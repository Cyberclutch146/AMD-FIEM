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

export async function searchFood(query: string): Promise<FoodSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=code,product_name,brands,nutriscore_grade,nutriments,image_front_small_url`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();

    if (!data.products || !Array.isArray(data.products)) return [];

    return data.products
      .filter((p: any) => p.product_name) // Only items with a name
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
  } catch (err) {
    console.error('Open Food Facts search error:', err);
    return [];
  }
}

/**
 * Maps a nutriscore grade to our internal food quality classification.
 * A/B → Healthy, C → Neutral, D/E → Junk
 */
export function nutriscoreToFoodType(grade: string): 'Healthy' | 'Junk' | 'Water' {
  const g = grade.toLowerCase();
  if (g === 'a' || g === 'b') return 'Healthy';
  if (g === 'c') return 'Healthy'; // neutral treated as healthy
  return 'Junk'; // d, e, unknown
}

/**
 * Gets a human-readable tag for a nutriscore grade
 */
export function nutriscoreToTag(grade: string): string {
  const g = grade.toLowerCase();
  switch (g) {
    case 'a': return 'Excellent';
    case 'b': return 'Good';
    case 'c': return 'Moderate';
    case 'd': return 'Poor';
    case 'e': return 'Bad';
    default: return 'Unrated';
  }
}
