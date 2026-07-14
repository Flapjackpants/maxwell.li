import craftingData from "@/lib/shop/crafting-recipes.json";
import {
  buildListingIndex,
  getSuggestedPriceForListing,
  normalizeName,
  type ListingIndex,
} from "@/lib/shop/crafting-suggestions";
import type { Listing } from "@/lib/shop/types";

type CraftRecipe = (typeof craftingData.recipes)[number];

const itemNames = craftingData.itemNames as Record<string, string>;
const tagItems = craftingData.tagItems as Record<string, string[]>;

export type DescendantCascadeAction = "reprice" | "offsale" | "delete";

export type DescendantSuggestion = {
  listingId: number;
  name: string;
  depth: number;
  currentPrice: Listing["price"];
  currentPriceUnit: Listing["priceUnit"];
  currentPricePerCount: Listing["pricePerCount"];
  inStock: boolean;
  suggestedPrice?: number;
  suggestedPriceUnit?: "item";
  suggestedPricePerCount?: number;
  currencyPerItem?: number;
};

function ingredientKeysForListing(
  listing: Listing,
  index: ListingIndex,
): Set<string> {
  const keys = new Set<string>();
  const norm = normalizeName(listing.name);

  for (const [id, displayName] of Object.entries(itemNames)) {
    if (normalizeName(displayName) === norm) keys.add(id);
  }

  keys.add(norm.replace(/\s+/g, "_"));

  for (const [tag, ids] of Object.entries(tagItems)) {
    const tagKey = `@tag:${tag}`;
    for (const id of ids) {
      if (keys.has(id)) {
        keys.add(tagKey);
        break;
      }
      const matches = index.byIngredientKey.get(id) ?? [];
      if (matches.some((match) => match.id === listing.id)) {
        keys.add(tagKey);
        break;
      }
    }
  }

  return keys;
}

function recipesUsingListing(
  listing: Listing,
  index: ListingIndex,
): CraftRecipe[] {
  const keys = ingredientKeysForListing(listing, index);
  return craftingData.recipes.filter((recipe) =>
    recipe.ingredients.some((ingredient) => keys.has(ingredient.key)),
  );
}

function findListedChild(
  recipeId: string,
  index: ListingIndex,
  listings: Listing[],
): Listing | null {
  const recipe = craftingData.recipes.find((entry) => entry.id === recipeId);
  if (!recipe) return null;

  const norm = normalizeName(recipe.name);
  const direct = index.byNormalizedName.get(norm);
  if (direct) return direct;

  return (
    listings.find((listing) => normalizeName(listing.name) === norm) ?? null
  );
}

export function getDescendantListings(
  rootListingId: number,
  listings: Listing[],
): Listing[] {
  const index = buildListingIndex(listings);
  const byId = new Map(listings.map((listing) => [listing.id, listing]));
  const root = byId.get(rootListingId);
  if (!root) return [];

  const descendants: Listing[] = [];
  const seen = new Set<number>([rootListingId]);
  const queue = [root];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const recipes = recipesUsingListing(current, index);
    const resultIds = new Set(recipes.map((recipe) => recipe.id));

    for (const resultId of resultIds) {
      const child = findListedChild(resultId, index, listings);
      if (!child || seen.has(child.id)) continue;
      seen.add(child.id);
      descendants.push(child);
      queue.push(child);
    }
  }

  return descendants;
}

function depthMap(rootListingId: number, listings: Listing[]): Map<number, number> {
  const index = buildListingIndex(listings);
  const byId = new Map(listings.map((listing) => [listing.id, listing]));
  const root = byId.get(rootListingId);
  const depths = new Map<number, number>();
  if (!root) return depths;

  const seen = new Set<number>([rootListingId]);
  const queue: { listing: Listing; depth: number }[] = [{ listing: root, depth: 0 }];

  while (queue.length > 0) {
    const { listing: current, depth } = queue.shift()!;
    const recipes = recipesUsingListing(current, index);
    const resultIds = new Set(recipes.map((recipe) => recipe.id));

    for (const resultId of resultIds) {
      const child = findListedChild(resultId, index, listings);
      if (!child || seen.has(child.id)) continue;
      seen.add(child.id);
      depths.set(child.id, depth + 1);
      queue.push({ listing: child, depth: depth + 1 });
    }
  }

  return depths;
}

export function getDescendantDepths(
  rootListingId: number,
  listings: Listing[],
): Map<number, number> {
  return depthMap(rootListingId, listings);
}

function priceBundleChanged(
  listing: Listing,
  suggested: {
    price: number;
    priceUnit: string;
    pricePerCount: number;
  },
): boolean {
  return (
    listing.price !== suggested.price ||
    listing.priceUnit !== suggested.priceUnit ||
    listing.pricePerCount !== suggested.pricePerCount
  );
}

export function getDescendantSuggestions(
  rootListingId: number,
  listings: Listing[],
  action: DescendantCascadeAction,
): DescendantSuggestion[] {
  const descendants = getDescendantListings(rootListingId, listings);
  if (descendants.length === 0) return [];

  const depths = depthMap(rootListingId, listings);

  return descendants
    .map((listing) => {
      const base: DescendantSuggestion = {
        listingId: listing.id,
        name: listing.name,
        depth: depths.get(listing.id) ?? 1,
        currentPrice: listing.price,
        currentPriceUnit: listing.priceUnit,
        currentPricePerCount: listing.pricePerCount,
        inStock: listing.inStock,
      };

      if (action === "reprice") {
        const suggested = getSuggestedPriceForListing(listing, listings);
        if (!suggested) return null;
        if (!priceBundleChanged(listing, suggested)) return null;
        return {
          ...base,
          suggestedPrice: suggested.price,
          suggestedPriceUnit: suggested.priceUnit,
          suggestedPricePerCount: suggested.pricePerCount,
          currencyPerItem: suggested.currencyPerItem,
        };
      }

      if (action === "offsale") {
        if (!listing.inStock) return null;
        return base;
      }

      return base;
    })
    .filter((entry): entry is DescendantSuggestion => entry !== null)
    .sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name));
}

export function listingHadPriceChange(
  before: Listing,
  after: {
    price: number;
    priceUnit: string;
    pricePerCount: number;
  },
): boolean {
  return (
    before.price !== after.price ||
    before.priceUnit !== after.priceUnit ||
    before.pricePerCount !== after.pricePerCount
  );
}
