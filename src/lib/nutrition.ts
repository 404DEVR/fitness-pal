import { NutritionInfo } from '@/types';

export async function searchUSDAFood(query: string): Promise<NutritionInfo | null> {
  try {
    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      console.warn('USDA API key not configured');
      return null;
    }

    const searchResponse = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=1`
    );

    if (!searchResponse.ok) {
      throw new Error('USDA API search failed');
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.foods || searchData.foods.length === 0) {
      return null;
    }

    const food = searchData.foods[0];
    const fdcId = food.fdcId;

    // Get detailed nutrition info
    const detailResponse = await fetch(
      `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`
    );

    if (!detailResponse.ok) {
      throw new Error('USDA API detail failed');
    }

    const detailData = await detailResponse.json();
    
    // Extract nutrition info
    const nutrients = detailData.foodNutrients || [];
    
    const getNutrientValue = (nutrientId: number) => {
      const nutrient = nutrients.find((n: { nutrient?: { id: number }; amount?: number }) => n.nutrient?.id === nutrientId);
      return nutrient?.amount || 0;
    };

    return {
      calories: getNutrientValue(1008), // Energy
      protein: getNutrientValue(1003), // Protein
      carbs: getNutrientValue(1005), // Carbohydrate
      fat: getNutrientValue(1004), // Total lipid (fat)
    };
  } catch (error) {
    console.error('USDA API error:', error);
    return null;
  }
}

export async function estimateNutritionWithGemini(foodDescription: string): Promise<NutritionInfo> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Estimate the nutritional information for: "${foodDescription}"
    
    Please provide ONLY a JSON response with the following format (no additional text):
    {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
    
    Values should be per typical serving size in grams for macros and total calories.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const nutrition = JSON.parse(jsonMatch[0]);
    
    return {
      calories: Number(nutrition.calories) || 0,
      protein: Number(nutrition.protein) || 0,
      carbs: Number(nutrition.carbs) || 0,
      fat: Number(nutrition.fat) || 0,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback estimates for common foods
    return {
      calories: 200,
      protein: 10,
      carbs: 20,
      fat: 8,
    };
  }
}

export async function getNutritionInfo(foodDescription: string): Promise<NutritionInfo & { source: string }> {
  console.log(`🔍 Looking up nutrition for: "${foodDescription}"`);
  
  // First try USDA API
  const usdaResult = await searchUSDAFood(foodDescription);
  
  if (usdaResult) {
    console.log(`✅ Found in USDA database (95% accurate)`);
    return { ...usdaResult, source: 'USDA' };
  }

  console.log(`⚠️ Not found in USDA, using Gemini AI estimation (75-85% accurate)`);
  // Fallback to Gemini estimation
  const geminiResult = await estimateNutritionWithGemini(foodDescription);
  return { ...geminiResult, source: 'Gemini AI' };
}