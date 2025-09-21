// Common Indian and international foods with approximate nutrition per 100g
export const commonFoods = [
  // Indian Staples
  { name: 'Roti (Wheat)', calories: 297, protein: 11, carbs: 61, fat: 4, category: 'Grains' },
  { name: 'Rice (Cooked)', calories: 130, protein: 3, carbs: 28, fat: 0, category: 'Grains' },
  { name: 'Dal (Cooked)', calories: 116, protein: 9, carbs: 20, fat: 0, category: 'Legumes' },
  { name: 'Chicken Tikka', calories: 186, protein: 25, carbs: 5, fat: 8, category: 'Meat' },
  { name: 'Paneer', calories: 265, protein: 18, carbs: 4, fat: 21, category: 'Dairy' },
  { name: 'Curd/Yogurt', calories: 60, protein: 3, carbs: 5, fat: 3, category: 'Dairy' },
  { name: 'Chapati', calories: 297, protein: 11, carbs: 61, fat: 4, category: 'Grains' },
  { name: 'Paratha', calories: 320, protein: 8, carbs: 45, fat: 12, category: 'Grains' },
  { name: 'Biryani', calories: 200, protein: 8, carbs: 35, fat: 4, category: 'Mixed' },
  { name: 'Rajma', calories: 127, protein: 9, carbs: 23, fat: 0, category: 'Legumes' },
  { name: 'Chole', calories: 164, protein: 8, carbs: 27, fat: 3, category: 'Legumes' },
  { name: 'Samosa', calories: 308, protein: 6, carbs: 28, fat: 19, category: 'Snacks' },
  
  // Proteins
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, category: 'Meat' },
  { name: 'Fish (Salmon)', calories: 208, protein: 20, carbs: 0, fat: 13, category: 'Fish' },
  { name: 'Eggs (2 large)', calories: 155, protein: 13, carbs: 1, fat: 11, category: 'Eggs' },
  { name: 'Mutton', calories: 294, protein: 25, carbs: 0, fat: 21, category: 'Meat' },
  { name: 'Prawns', calories: 99, protein: 18, carbs: 1, fat: 1, category: 'Seafood' },
  
  // Vegetables
  { name: 'Mixed Vegetables', calories: 65, protein: 3, carbs: 13, fat: 0, category: 'Vegetables' },
  { name: 'Spinach (Palak)', calories: 23, protein: 3, carbs: 4, fat: 0, category: 'Vegetables' },
  { name: 'Potato', calories: 77, protein: 2, carbs: 17, fat: 0, category: 'Vegetables' },
  { name: 'Onion', calories: 40, protein: 1, carbs: 9, fat: 0, category: 'Vegetables' },
  { name: 'Tomato', calories: 18, protein: 1, carbs: 4, fat: 0, category: 'Vegetables' },
  
  // Fruits
  { name: 'Apple', calories: 52, protein: 0, carbs: 14, fat: 0, category: 'Fruits' },
  { name: 'Banana', calories: 89, protein: 1, carbs: 23, fat: 0, category: 'Fruits' },
  { name: 'Orange', calories: 47, protein: 1, carbs: 12, fat: 0, category: 'Fruits' },
  { name: 'Mango', calories: 60, protein: 1, carbs: 15, fat: 0, category: 'Fruits' },
  
  // Snacks & Others
  { name: 'Almonds (10 pieces)', calories: 173, protein: 6, carbs: 6, fat: 15, category: 'Nuts' },
  { name: 'Milk (1 cup)', calories: 103, protein: 8, carbs: 12, fat: 2, category: 'Dairy' },
  { name: 'Tea (with milk)', calories: 30, protein: 1, carbs: 4, fat: 1, category: 'Beverages' },
  { name: 'Coffee (with milk)', calories: 25, protein: 1, carbs: 3, fat: 1, category: 'Beverages' },
  { name: 'Bread (2 slices)', calories: 160, protein: 8, carbs: 30, fat: 2, category: 'Grains' },
  { name: 'Oats', calories: 389, protein: 17, carbs: 66, fat: 7, category: 'Grains' },
];

export function searchCommonFoods(query: string) {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  return commonFoods
    .filter(food => 
      food.name.toLowerCase().includes(searchTerm) ||
      food.category.toLowerCase().includes(searchTerm)
    )
    .slice(0, 6);
}