import { NextRequest, NextResponse } from 'next/server';
import { searchUSDAFood } from '@/lib/nutrition';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search USDA database for food suggestions
    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      return NextResponse.json([]);
    }

    const searchResponse = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=10`
    );

    if (!searchResponse.ok) {
      return NextResponse.json([]);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.foods || searchData.foods.length === 0) {
      return NextResponse.json([]);
    }

    // Format the results with nutrition info
    const suggestions = await Promise.all(
      searchData.foods.slice(0, 8).map(async (food: any) => {
        try {
          // Get detailed nutrition info for each food
          const detailResponse = await fetch(
            `https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${apiKey}`
          );

          if (!detailResponse.ok) {
            return null;
          }

          const detailData = await detailResponse.json();
          const nutrients = detailData.foodNutrients || [];
          
          const getNutrientValue = (nutrientId: number) => {
            const nutrient = nutrients.find((n: any) => n.nutrient?.id === nutrientId);
            return Math.round(nutrient?.amount || 0);
          };

          // Clean up the food name
          let cleanName = food.description
            .replace(/,.*$/, '') // Remove everything after first comma
            .replace(/\b(raw|cooked|fresh|frozen|canned)\b/gi, '') // Remove common descriptors
            .trim();

          return {
            id: food.fdcId,
            name: cleanName,
            brand: food.brandOwner || null,
            calories: getNutrientValue(1008), // Energy
            protein: getNutrientValue(1003), // Protein
            carbs: getNutrientValue(1005), // Carbohydrate
            fat: getNutrientValue(1004), // Total lipid (fat)
            category: food.foodCategory || 'Food',
          };
        } catch (error) {
          return null;
        }
      })
    );

    // Filter out null results and return
    const validSuggestions = suggestions.filter(Boolean);
    return NextResponse.json(validSuggestions);
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json([]);
  }
}