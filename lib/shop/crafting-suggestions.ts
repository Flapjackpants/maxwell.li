import craftingData from "@/lib/shop/crafting-recipes.json";
import {
  cheaperRational,
  currencyPerItemRate,
  listingPrice,
  suggestedCraftBundlePrice,
  type ListingPrice,
} from "@/lib/shop/pricing";
import type { Listing } from "@/lib/shop/types";

type CraftRecipe = (typeof craftingData.recipes)[number];

export type CraftingIngredient = CraftRecipe["ingredients"][number];

export type ResolvedCraftingIngredient = {
  count: number;
  name: string;
};

export type ListingIndex = {
  byNormalizedName: Map<string, Listing>;
  byIngredientKey: Map<string, Listing[]>;
};

export type CraftingSuggestion = {
  recipeId: string;
  name: string;
  outputCount: number;
  ingredients: ResolvedCraftingIngredient[];
  price: number;
  priceUnit: "item";
  pricePerCount: number;
  currencyPerItem: number;
  category: string | null;
};

const itemNames = craftingData.itemNames as Record<string, string>;
const tagItems = craftingData.tagItems as Record<string, string[]>;

export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildListingIndex(listings: Listing[]): ListingIndex {
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

export type CraftCostRational = {
  numerator: number;
  denominator: number;
  ingredients: ResolvedCraftingIngredient[];
};

/** Total craft cost as emeralds per one output item (reduced rational). */
export function craftCostRational(
  recipe: CraftRecipe,
  index: ListingIndex,
): CraftCostRational | null {
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

  const numerator = totalNumerator;
  const denominator = totalDenominator * outputCount;
  if (numerator <= 0) return null;

  return { numerator, denominator, ingredients: resolved };
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

function recipeIdForListing(listing: Listing): string | null {
  const norm = normalizeName(listing.name);
  for (const [id, name] of Object.entries(itemNames)) {
    if (normalizeName(name) === norm) return id;
  }
  const pseudo = norm.replace(/\s+/g, "_");
  if (recipesByResultId().has(pseudo)) return pseudo;
  return null;
}

function bundleFromCraftCost(cost: CraftCostRational) {
  const bundle = suggestedCraftBundlePrice(cost.numerator, cost.denominator);
  return {
    price: bundle.amount,
    priceUnit: "item" as const,
    pricePerCount: bundle.perCount,
    currencyPerItem: bundle.currencyPerItem,
    ingredients: cost.ingredients,
  };
}

export function getSuggestedPriceForListing(
  listing: Listing,
  allListings: Listing[],
):
  | {
      price: number;
      priceUnit: "item";
      pricePerCount: number;
      currencyPerItem: number;
      ingredients: ResolvedCraftingIngredient[];
    }
  | null {
  const recipeId = recipeIdForListing(listing);
  if (!recipeId) return null;

  const variants = recipesByResultId().get(recipeId) ?? [];
  const index = buildListingIndex(allListings);

  let best: CraftCostRational | null = null;

  for (const recipe of variants) {
    if (!recipeIsCraftable(recipe, index)) continue;
    const cost = craftCostRational(recipe, index);
    if (!cost) continue;
    if (
      !best ||
      cheaperRational(
        cost.numerator,
        cost.denominator,
        best.numerator,
        best.denominator,
      )
    ) {
      best = cost;
    }
  }

  if (!best) return null;
  return bundleFromCraftCost(best);
}

export function getCraftingSuggestions(listings: Listing[]): CraftingSuggestion[] {
  const index = buildListingIndex(listings);
  const suggestions: CraftingSuggestion[] = [];

  for (const [recipeId, variants] of recipesByResultId()) {
    const sample = variants[0]!;
    if (isAlreadyListed(sample.name, recipeId, index)) continue;

    let best: (CraftCostRational & { recipe: CraftRecipe }) | null = null;

    for (const recipe of variants) {
      if (!recipeIsCraftable(recipe, index)) continue;

      const cost = craftCostRational(recipe, index);
      if (!cost) continue;

      if (
        !best ||
        cheaperRational(
          cost.numerator,
          cost.denominator,
          best.numerator,
          best.denominator,
        )
      ) {
        best = { ...cost, recipe };
      }
    }

    if (!best) continue;

    const bundle = bundleFromCraftCost(best);

    suggestions.push({
      recipeId,
      name: best.recipe.name,
      outputCount: best.recipe.outputCount,
      ingredients: bundle.ingredients,
      price: bundle.price,
      priceUnit: bundle.priceUnit,
      pricePerCount: bundle.pricePerCount,
      currencyPerItem: bundle.currencyPerItem,
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
