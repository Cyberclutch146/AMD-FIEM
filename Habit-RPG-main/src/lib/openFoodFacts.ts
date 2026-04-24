// Open Food Facts API wrapper
// Free, no API key required. Returns nutriscore + full macros.

export interface FoodSearchResult {
  id: string;
  name: string;
  brand: string;
  nutriscoreGrade: string; // a, b, c, d, e or 'unknown'
  calories: number; // kcal per 100g
  protein: number; // g per 100g
  carbs: number; // g per 100g
  fat: number; // g per 100g
  fiber: number; // g per 100g
  sugar: number; // g per 100g
  imageUrl: string | null;
}

const API_BASE = 'https://world.openfoodfacts.net/cgi/search.pl';

export async function searchFood(query: string): Promise<FoodSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '8',
    fields: 'code,product_name,brands,nutriscore_grade,nutriments,image_front_small_url',
  });

  try {
    const response = await fetch(`${API_BASE}?${params}`, {
      headers: {
        'User-Agent': 'NutriIntel/1.0 (https://nutriintel.app; contact@nutriintel.app)',
      },
    });

    if (!response.ok) {
      console.warn(`OFF API returned ${response.status}, trying v2 fallback...`);
      return await searchFoodV2(query);
    }

    const data = await response.json();
    if (!data.products || !Array.isArray(data.products)) return [];

    return parseProducts(data.products);
  } catch (err) {
    console.warn('OFF search.pl failed, trying v2 API...', err);
    return await searchFoodV2(query);
  }
}

// Fallback: use the v2 search API endpoint
async function searchFoodV2(query: string): Promise<FoodSearchResult[]> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.net/api/v2/search?categories_tags_en=${encodeURIComponent(query)}&fields=code,product_name,brands,nutriscore_grade,nutriments,image_front_small_url&page_size=8&sort_by=popularity_key`,
      {
        headers: {
          'User-Agent': 'NutriIntel/1.0 (https://nutriintel.app; contact@nutriintel.app)',
        },
      }
    );

    if (!response.ok) {
      console.error(`OFF v2 API also failed: ${response.status}`);
      return getFallbackResults(query);
    }

    const data = await response.json();
    if (!data.products || !Array.isArray(data.products)) return getFallbackResults(query);

    const results = parseProducts(data.products);
    return results.length > 0 ? results : getFallbackResults(query);
  } catch (err) {
    console.error('OFF v2 search also failed:', err);
    return getFallbackResults(query);
  }
}

function parseProducts(products: any[]): FoodSearchResult[] {
  return products
    .filter((p: any) => p.product_name)
    .map((p: any) => ({
      id: p.code || Math.random().toString(36),
      name: p.product_name || 'Unknown',
      brand: p.brands || '',
      nutriscoreGrade: p.nutriscore_grade || 'unknown',
      calories: Math.round(p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal'] || 0),
      protein: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((p.nutriments?.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((p.nutriments?.fat_100g || 0) * 10) / 10,
      fiber: Math.round((p.nutriments?.fiber_100g || 0) * 10) / 10,
      sugar: Math.round((p.nutriments?.sugars_100g || 0) * 10) / 10,
      imageUrl: p.image_front_small_url || null,
    }));
}

// Offline fallback: common foods with realistic nutrition data
function getFallbackResults(query: string): FoodSearchResult[] {
  const q = query.toLowerCase();
  const commonFoods: FoodSearchResult[] = [
    { id: 'f1', name: 'Apple (Fresh)', brand: 'Generic', nutriscoreGrade: 'a', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, imageUrl: null },
    { id: 'f2', name: 'Banana', brand: 'Generic', nutriscoreGrade: 'a', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, imageUrl: null },
    { id: 'f3', name: 'Chicken Breast (Grilled)', brand: 'Generic', nutriscoreGrade: 'a', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, imageUrl: null },
    { id: 'f4', name: 'White Rice (Cooked)', brand: 'Generic', nutriscoreGrade: 'b', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, imageUrl: null },
    { id: 'f5', name: 'Salad (Mixed Greens)', brand: 'Generic', nutriscoreGrade: 'a', calories: 20, protein: 1.5, carbs: 3.5, fat: 0.2, fiber: 2, sugar: 1, imageUrl: null },
    { id: 'f6', name: 'Pasta (Cooked)', brand: 'Generic', nutriscoreGrade: 'b', calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, imageUrl: null },
    { id: 'f7', name: 'Egg (Boiled)', brand: 'Generic', nutriscoreGrade: 'a', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, imageUrl: null },
    { id: 'f8', name: 'Bread (Whole Wheat)', brand: 'Generic', nutriscoreGrade: 'b', calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7, sugar: 6, imageUrl: null },
    { id: 'f9', name: 'Pizza Slice', brand: 'Generic', nutriscoreGrade: 'd', calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3, sugar: 3.6, imageUrl: null },
    { id: 'f10', name: 'Burger (Beef)', brand: 'Generic', nutriscoreGrade: 'd', calories: 295, protein: 17, carbs: 24, fat: 14, fiber: 1.3, sugar: 5, imageUrl: null },
    { id: 'f11', name: 'French Fries', brand: 'Generic', nutriscoreGrade: 'd', calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, sugar: 0.3, imageUrl: null },
    { id: 'f12', name: 'Chocolate Bar', brand: 'Generic', nutriscoreGrade: 'e', calories: 546, protein: 5, carbs: 60, fat: 31, fiber: 7, sugar: 48, imageUrl: null },
    { id: 'f13', name: 'Yogurt (Plain)', brand: 'Generic', nutriscoreGrade: 'a', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2, imageUrl: null },
    { id: 'f14', name: 'Orange Juice', brand: 'Generic', nutriscoreGrade: 'c', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2, sugar: 8.4, imageUrl: null },
    { id: 'f15', name: 'Chips (Potato)', brand: 'Generic', nutriscoreGrade: 'd', calories: 536, protein: 7, carbs: 53, fat: 35, fiber: 4.8, sugar: 0.3, imageUrl: null },
    { id: 'f16', name: 'Dal (Lentils)', brand: 'Generic', nutriscoreGrade: 'a', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sugar: 1.8, imageUrl: null },
    { id: 'f17', name: 'Roti / Chapati', brand: 'Generic', nutriscoreGrade: 'b', calories: 120, protein: 3.7, carbs: 18, fat: 3.7, fiber: 2, sugar: 0.3, imageUrl: null },
    { id: 'f18', name: 'Paneer', brand: 'Generic', nutriscoreGrade: 'b', calories: 265, protein: 18, carbs: 1.2, fat: 21, fiber: 0, sugar: 0.5, imageUrl: null },
    { id: 'f19', name: 'Soda / Cola', brand: 'Generic', nutriscoreGrade: 'e', calories: 42, protein: 0, carbs: 11, fat: 0, fiber: 0, sugar: 11, imageUrl: null },
    { id: 'f20', name: 'Water', brand: 'Generic', nutriscoreGrade: 'a', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, imageUrl: null },
  ];

  return commonFoods.filter(f =>
    f.name.toLowerCase().includes(q) ||
    q.split(' ').some(w => f.name.toLowerCase().includes(w))
  ).slice(0, 8);
}

/**
 * Maps nutriscore grade to food quality: A/B/C → Healthy, D/E/unknown → Junk
 */
export function nutriscoreToFoodType(grade: string): 'Healthy' | 'Junk' | 'Water' {
  const g = grade.toLowerCase();
  if (g === 'a' || g === 'b' || g === 'c') return 'Healthy';
  return 'Junk';
}

export function nutriscoreToTag(grade: string): string {
  switch (grade.toLowerCase()) {
    case 'a': return 'Excellent';
    case 'b': return 'Good';
    case 'c': return 'Moderate';
    case 'd': return 'Poor';
    case 'e': return 'Bad';
    default: return 'Unrated';
  }
}
