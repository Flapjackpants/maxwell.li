#!/usr/bin/env node
/**
 * Fetch all Minecraft crafting recipes from the official client jar.
 * Default version: 26.2 (latest stable release).
 *
 * Run: node scripts/fetch-crafting-recipes.mjs [version]
 * Or:  npm run db:fetch-crafting
 */
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const AdmZip = require("adm-zip");

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "lib/shop/crafting-recipes.json");
const cacheDir = path.join(root, ".cache/minecraft");
const DEFAULT_VERSION = "26.2";

const CRAFTING_TYPES = new Set([
  "minecraft:crafting_shaped",
  "minecraft:crafting_shapeless",
]);

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetch(res.headers.location).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function getVersionMeta(versionId) {
  const manifest = JSON.parse(
    (await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).toString(),
  );
  const version = manifest.versions.find((entry) => entry.id === versionId);
  if (!version) {
    throw new Error(`Version ${versionId} not found in Mojang manifest`);
  }
  return JSON.parse((await fetch(version.url)).toString());
}

async function downloadClientJar(versionId, clientUrl) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const jarPath = path.join(cacheDir, `${versionId}-client.jar`);
  if (!fs.existsSync(jarPath)) {
    console.log(`[crafting] Downloading Minecraft ${versionId} client jar...`);
    fs.writeFileSync(jarPath, await fetch(clientUrl));
  }
  return jarPath;
}

function loadJarFiles(jarPath) {
  const zip = new AdmZip(jarPath);
  const files = new Map();
  for (const entry of zip.getEntries()) {
    if (!entry.entryName.endsWith(".json")) continue;
    files.set(entry.entryName, entry.getData().toString("utf8"));
  }
  return files;
}

function stripNamespace(id) {
  return id.replace(/^minecraft:/, "");
}

function langName(lang, itemId) {
  const id = stripNamespace(itemId);
  return (
    lang[`item.minecraft.${id}`] ??
    lang[`block.minecraft.${id}`] ??
    id
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function parseIngredientRef(ref) {
  if (typeof ref === "string") {
    if (ref.startsWith("#")) {
      const tag = ref.startsWith("#minecraft:")
        ? ref.slice(1)
        : `minecraft:${ref.slice(1)}`;
      return { type: "tag", tag };
    }
    return { type: "item", item: stripNamespace(ref) };
  }
  if (ref?.tag) return { type: "tag", tag: ref.tag };
  if (ref?.item) return { type: "item", item: stripNamespace(ref.item) };
  return null;
}

function resolveTagItems(tag, files, tagCache) {
  if (tagCache[tag]) return tagCache[tag];

  const raw = files.get(`data/minecraft/tags/item/${stripNamespace(tag)}.json`);
  if (!raw) {
    tagCache[tag] = [];
    return [];
  }

  const items = [];
  for (const value of JSON.parse(raw).values ?? []) {
    if (typeof value !== "string") continue;
    if (value.startsWith("#")) {
      for (const item of resolveTagItems(value.slice(1), files, tagCache)) {
        if (!items.includes(item)) items.push(item);
      }
    } else {
      const item = stripNamespace(value);
      if (!items.includes(item)) items.push(item);
    }
  }

  tagCache[tag] = items;
  return items;
}

function addIngredient(counts, parsed) {
  if (!parsed) return;
  const key = parsed.type === "tag" ? `@tag:${parsed.tag}` : parsed.item;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function recipeIngredients(recipe) {
  const counts = new Map();

  if (recipe.type === "minecraft:crafting_shapeless") {
    for (const ingredient of recipe.ingredients ?? []) {
      addIngredient(counts, parseIngredientRef(ingredient));
    }
  } else if (recipe.type === "minecraft:crafting_shaped") {
    for (const row of recipe.pattern ?? []) {
      for (const char of row) {
        if (char === " ") continue;
        addIngredient(counts, parseIngredientRef(recipe.key?.[char]));
      }
    }
  }

  return [...counts.entries()].map(([key, count]) => ({
    key,
    count,
    tag: key.startsWith("@tag:") ? key.slice(5) : null,
  }));
}

function tagDisplayName(tag) {
  return `Any ${stripNamespace(tag).replace(/_/g, " ")}`;
}

async function main() {
  const versionId = process.argv[2] ?? DEFAULT_VERSION;
  const meta = await getVersionMeta(versionId);
  const jarPath = await downloadClientJar(versionId, meta.downloads.client.url);

  console.log(`[crafting] Loading jar entries...`);
  const files = loadJarFiles(jarPath);
  const lang = JSON.parse(files.get("assets/minecraft/lang/en_us.json") ?? "{}");
  const tagCache = {};
  const tagItems = {};
  const itemNames = {};
  const recipes = [];

  const recipePaths = [...files.keys()].filter((name) =>
    name.startsWith("data/minecraft/recipe/"),
  );
  console.log(`[crafting] Parsing ${recipePaths.length} recipe files...`);

  for (const filePath of recipePaths) {
    const recipe = JSON.parse(files.get(filePath) ?? "{}");
    if (!CRAFTING_TYPES.has(recipe.type)) continue;

    const resultId = recipe.result?.id ?? recipe.result?.item;
    if (!resultId) continue;

    const id = stripNamespace(resultId);
    const outputCount = recipe.result?.count ?? 1;
    const ingredients = recipeIngredients(recipe);

    for (const ingredient of ingredients) {
      if (ingredient.tag) {
        if (!tagItems[ingredient.tag]) {
          tagItems[ingredient.tag] = resolveTagItems(
            ingredient.tag,
            files,
            tagCache,
          );
          for (const itemId of tagItems[ingredient.tag]) {
            itemNames[itemId] = langName(lang, itemId);
          }
        }
      } else {
        itemNames[ingredient.key] = langName(lang, ingredient.key);
      }
    }

    itemNames[id] = langName(lang, resultId);

    recipes.push({
      id,
      name: itemNames[id],
      outputCount,
      ingredients: ingredients.map((ingredient) => ({
        key: ingredient.key,
        count: ingredient.count,
        tag: ingredient.tag,
        displayName: ingredient.tag
          ? tagDisplayName(ingredient.tag)
          : itemNames[ingredient.key],
      })),
      category: recipe.category ?? null,
      group: recipe.group ?? null,
    });
  }

  recipes.sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    source: `minecraft:${versionId}`,
    minecraftVersion: versionId,
    fetchedAt: new Date().toISOString().slice(0, 10),
    recipeCount: recipes.length,
    itemNames,
    tagItems,
    recipes,
  };

  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(
    `[crafting] Wrote ${recipes.length} crafting recipes (${Object.keys(tagItems).length} tags) to ${outPath}`,
  );
}

main().catch((err) => {
  console.error("[crafting] Failed:", err);
  process.exit(1);
});
