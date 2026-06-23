import craftingData from "@/lib/shop/crafting-recipes.json";
import {
  currencyPerItemRate,
  listingPrice,
  type ListingPrice,
} from "@/lib/shop/pricing";
import type { Listing } from "@/lib/shop/types";

type CraftRecipe = (typeof craftingData.recipes)[number];

export type CraftingIngredient = CraftRecipe["ingredients"][number];

export type ResolvedCraftingIngredient = {
  count: number;
  name: string;
};

export type CraftingSuggestion = {
  recipeId: string;
  name: string;
  outputCount: number;
  ingredients: ResolvedCraftingIngredient[];
  /** Integer emeralds per item (rounded up from ingredient costs). */
  price: number;
  priceUnit: "item";
  pricePerCount: 1;
  /** Exact unrounded emeralds per output item. */
  currencyPerItem: number;
  category: string | null;
};

const itemNames = craftingData.itemNames as Record<string, string>;
const tagItems = craftingData.tagItems as Record<string, string[]>;

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type ListingIndex = {
  byNormalizedName: Map<string, Listing>;
  byIngredientKey: Map<string, Listing[]>;
};

function buildListingIndex(listings: Listing[]): ListingIndex {
  const byNormalizedName = new Map<string, Listing>();
  const byIngredientKey = new Map<string, Listing[]>();

  function addKey(key: string, listing: Listing) {
    const list = byIngredientKey.get(key) ?? [];
    if (!list.includes(listing)) {
      list.push(listing);
      byIngredientKey.set(key, list);
    }
  }

  for (const listing of listings) {
    const norm = normalizeName(listing.name);
    byNormalizedName.set(norm, listing);

    for (const [id, displayName] of Object.entries(itemNames)) {
      if (normalizeName(displayName) === norm) {
        addKey(id, listing);
      }
    }

    addKey(norm.replace(/\s+/g, "_"), listing);
  }

  return { byNormalizedName, byIngredientKey };
}

function listingsForIngredient(
  ingredient: CraftingIngredient,
  index: ListingIndex,
): Listing[] {
  if (ingredient.tag) {
    const itemIds = tagItems[ingredient.tag] ?? [];
    const matches: Listing[] = [];
    for (const id of itemIds) {
      for (const listing of index.byIngredientKey.get(id) ?? []) {
        if (!matches.includes(listing)) matches.push(listing);
      }
    }
    return matches;
  }

  return index.byIngredientKey.get(ingredient.key) ?? [];
}

function cheapestListingForIngredient(
  ingredient: CraftingIngredient,
  index: ListingIndex,
): { listing: Listing; perItem: number } | null {
  const listings = listingsForIngredient(ingredient, index);
  if (listings.length === 0) return null;

  let best: { listing: Listing; perItem: number } | null = null;
  for (const listing of listings) {
    const rate = currencyPerItemRate(listingPrice(listing));
    const perItem = rate.numerator / rate.denominator;
    if (!best || perItem < best.perItem) {
      best = { listing, perItem };
    }
  }
  return best;
}

function recipeIsCraftable(recipe: CraftRecipe, index: ListingIndex): boolean {
  return (
    recipe.ingredients.length > 0 &&
    recipe.ingredients.every(
      (ingredient) => listingsForIngredient(ingredient, index).length > 0,
    )
  );
}

/** Emeralds per crafted output item, using cheapest listed materials. */
function craftCostPerOutput(
  recipe: CraftRecipe,
  index: ListingIndex,
): { currencyPerItem: number; ingredients: ResolvedCraftingIngredient[] } | null {
  const outputCount = recipe.outputCount > 0 ? recipe.outputCount : 1;
  const resolved: ResolvedCraftingIngredient[] = [];
  let totalNumerator = 0;
  let totalDenominator = 1;

  for (const ingredient of recipe.ingredients) {
    const cheapest = cheapestListingForIngredient(ingredient, index);
    if (!cheapest) return null;

    const rate = currencyPerItemRate(listingPrice(cheapest.listing));
    const ingredientNumerator = ingredient.count * rate.numerator;
    const ingredientDenominator = rate.denominator;

    totalNumerator =
      totalNumerator * ingredientDenominator +
      ingredientNumerator * totalDenominator;
    totalDenominator *= ingredientDenominator;

    resolved.push({
      count: ingredient.count,
      name: cheapest.listing.name,
    });
  }

  const craftNumerator = totalNumerator;
  const craftDenominator = totalDenominator * outputCount;
  if (craftNumerator <= 0) return null;

  return {
    currencyPerItem: craftNumerator / craftDenominator,
    ingredients: resolved,
  };
}

function suggestedItemPrice(currencyPerItem: number): number {
  return Math.max(1, Math.ceil(currencyPerItem));
}

function isAlreadyListed(
  recipeName: string,
  recipeId: string,
  index: ListingIndex,
): boolean {
  const normName = normalizeName(recipeName);
  if (index.byNormalizedName.has(normName)) return true;
  const display = itemNames[recipeId];
  if (display && index.byNormalizedName.has(normalizeName(display))) return true;
  return index.byNormalizedName.has(normalizeName(recipeId.replace(/_/g, " ")));
}

function recipesByResultId(): Map<string, CraftRecipe[]> {
  const grouped = new Map<string, CraftRecipe[]>();
  for (const recipe of craftingData.recipes) {
    const list = grouped.get(recipe.id) ?? [];
    list.push(recipe);
    grouped.set(recipe.id, list);
  }
  return grouped;
}

export function getCraftingSuggestions(listings: Listing[]): CraftingSuggestion[] {
  const index = buildListingIndex(listings);
  const suggestions: CraftingSuggestion[] = [];

  for (const [recipeId, variants] of recipesByResultId()) {
    const sample = variants[0]!;
    if (isAlreadyListed(sample.name, recipeId, index)) continue;

    let best: {
      recipe: CraftRecipe;
      currencyPerItem: number;
      ingredients: ResolvedCraftingIngredient[];
    } | null = null;

    for (const recipe of variants) {
      if (!recipeIsCraftable(recipe, index)) continue;

      const cost = craftCostPerOutput(recipe, index);
      if (!cost) continue;

      if (!best || cost.currencyPerItem < best.currencyPerItem) {
        best = {
          recipe,
          currencyPerItem: cost.currencyPerItem,
          ingredients: cost.ingredients,
        };
      }
    }

    if (!best) continue;

    suggestions.push({
      recipeId,
      name: best.recipe.name,
      outputCount: best.recipe.outputCount,
      ingredients: best.ingredients,
      price: suggestedItemPrice(best.currencyPerItem),
      priceUnit: "item",
      pricePerCount: 1,
      currencyPerItem: best.currencyPerItem,
      category: best.recipe.category,
    });
  }

  return suggestions.sort((a, b) => a.name.localeCompare(b.name));
}

export function formatIngredientList(
  ingredients: ResolvedCraftingIngredient[],
): string {
  return ingredients
    .map((ingredient) => `${ingredient.count}× ${ingredient.name}`)
    .join(" + ");
}

export function suggestionToListingPrice(
  suggestion: CraftingSuggestion,
): ListingPrice {
  return {
    amount: suggestion.price,
    unit: suggestion.priceUnit,
    perCount: suggestion.pricePerCount,
  };
}
