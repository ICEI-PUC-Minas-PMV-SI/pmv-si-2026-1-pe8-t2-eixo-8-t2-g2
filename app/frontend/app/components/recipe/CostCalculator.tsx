/**
 * CostCalculator.tsx
 *
 * Root component that wires together IngredientsPage, RecipesPage and RecipeDetailModal.
 * Handles all state (ingredients + recipes), derivation of calculated fields, and
 * persistence via localStorage so data survives page refreshes.
 *
 * Usage:
 *   import { CostCalculator } from './CostCalculator';
 *   <CostCalculator />
 */

import { useState, useEffect } from 'react';
import { Tabs, Badge } from 'antd';
import { ExperimentOutlined, CoffeeOutlined } from '@ant-design/icons';

import { IngredientsPage, type Ingredient } from './IngredientsPage';
import { RecipesPage, type Recipe } from './RecipesPage';
import { RecipeDetailModal } from './RecipeDetailModal';

// ─── helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Derive all calculated fields for a recipe given the current ingredient list. */
function deriveRecipe(
  raw: Omit<Recipe, 'ingredientsCost' | 'finalCost' | 'finalCostWithPackaging' | 'minSalePrice' | 'totalRevenue' | 'profitMargin'>,
  ingredients: Ingredient[],
): Recipe {
  // Recalculate ingredient costs in case costPerGram changed
  const enrichedIngredients = raw.ingredients.map((ri) => {
    const ing = ingredients.find((i) => i.id === ri.ingredientId);
    return {
      ...ri,
      cost: (ing?.costPerGram ?? 0) * ri.quantityUsed,
    };
  });

  const ingredientsCost = enrichedIngredients.reduce((acc, ri) => acc + ri.cost, 0);
  const packagingTotal = raw.packagingCost * raw.packagingQuantity;
  const finalCost = ingredientsCost + raw.productionCost;
  const finalCostWithPackaging = finalCost + packagingTotal;
  const minSalePrice = finalCostWithPackaging * 3;
  const totalRevenue = raw.salePrice * raw.quantityPerRecipe;
  const profitMargin =
    totalRevenue > 0 ? ((totalRevenue - finalCostWithPackaging) / totalRevenue) * 100 : 0;

  return {
    ...raw,
    ingredients: enrichedIngredients,
    ingredientsCost,
    finalCost,
    finalCostWithPackaging,
    minSalePrice,
    totalRevenue,
    profitMargin,
  };
}

/** Derive costPerGram for an ingredient. */
function deriveIngredient(
  raw: Omit<Ingredient, 'costPerGram'>,
): Ingredient {
  return {
    ...raw,
    costPerGram: raw.totalQuantity > 0 ? raw.totalCost / raw.totalQuantity : 0,
  };
}

// ─── component ──────────────────────────────────────────────────────────────

const STORAGE_KEY_INGREDIENTS = 'cost_calc_ingredients';
const STORAGE_KEY_RECIPES = 'cost_calc_recipes';

export function CostCalculator() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INGREDIENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECIPES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(recipes));
  }, [recipes]);

  // ── ingredient CRUD ────────────────────────────────────────────────────────

  const handleAddIngredient = (raw: Omit<Ingredient, 'id' | 'costPerGram'>) => {
    const ingredient = deriveIngredient({ ...raw, id: uid() });
    const updated = [...ingredients, ingredient];
    setIngredients(updated);
    // Re-derive all recipes so their costs stay correct
    setRecipes((prev) => prev.map((r) => deriveRecipe(r, updated)));
  };

  const handleEditIngredient = (id: string, raw: Omit<Ingredient, 'id' | 'costPerGram'>) => {
    const ingredient = deriveIngredient({ ...raw, id });
    const updated = ingredients.map((i) => (i.id === id ? ingredient : i));
    setIngredients(updated);
    setRecipes((prev) => prev.map((r) => deriveRecipe(r, updated)));
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  // ── recipe CRUD ────────────────────────────────────────────────────────────

  const handleAddRecipe = (
    raw: Omit<Recipe, 'id' | 'ingredientsCost' | 'finalCost' | 'finalCostWithPackaging' | 'minSalePrice' | 'totalRevenue' | 'profitMargin'>,
  ) => {
    const recipe = deriveRecipe({ ...raw, id: uid() }, ingredients);
    setRecipes((prev) => [...prev, recipe]);
  };

  const handleEditRecipe = (
    id: string,
    raw: Omit<Recipe, 'id' | 'ingredientsCost' | 'finalCost' | 'finalCostWithPackaging' | 'minSalePrice' | 'totalRevenue' | 'profitMargin'>,
  ) => {
    const recipe = deriveRecipe({ ...raw, id }, ingredients);
    setRecipes((prev) => prev.map((r) => (r.id === id ? recipe : r)));
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  // ── tabs ───────────────────────────────────────────────────────────────────

  const tabs = [
    {
      key: 'ingredients',
      label: (
        <span>
          <ExperimentOutlined />
          Ingredientes{' '}
          <Badge count={ingredients.length} style={{ backgroundColor: '#a0522d' }} />
        </span>
      ),
      children: (
        <IngredientsPage
          ingredients={ingredients}
          onAdd={handleAddIngredient}
          onEdit={handleEditIngredient}
          onDelete={handleDeleteIngredient}
        />
      ),
    },
    {
      key: 'recipes',
      label: (
        <span>
          <CoffeeOutlined />
          Receitas{' '}
          <Badge count={recipes.length} style={{ backgroundColor: '#a0522d' }} />
        </span>
      ),
      children: (
        <RecipesPage
          recipes={recipes}
          ingredients={ingredients}
          onAdd={handleAddRecipe}
          onEdit={handleEditRecipe}
          onDelete={handleDeleteRecipe}
          onViewDetail={setDetailRecipe}
        />
      ),
    },
  ];

  return (
    <>
      <Tabs
        defaultActiveKey="ingredients"
        items={tabs}
        size="large"
        style={{ background: '#fff', minHeight: '100vh' }}
        tabBarStyle={{ paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid #f0f0f0' }}
      />
      <RecipeDetailModal
        recipe={detailRecipe}
        open={!!detailRecipe}
        onClose={() => setDetailRecipe(null)}
      />
    </>
  );
}
