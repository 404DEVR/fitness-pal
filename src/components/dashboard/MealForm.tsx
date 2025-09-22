'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Scan } from 'lucide-react';
import { searchCommonFoods } from '@/lib/common-foods';
import { BarcodeScanner } from './BarcodeScanner';
import { ManualBarcodeEntry } from './ManualBarcodeEntry';

interface FoodSuggestion {
  id?: number;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

interface MealFormProps {
  onMealAdded: () => void;
}

export function MealForm({ onMealAdded }: MealFormProps) {
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [quantityType, setQuantityType] = useState('grams');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search for food suggestions
  useEffect(() => {
    const searchFoods = async () => {
      if (foodName.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);

      // First, search common foods (instant)
      const commonResults = searchCommonFoods(foodName);
      setSuggestions(commonResults);
      setShowSuggestions(true);

      // Then search USDA database (slower)
      try {
        const response = await fetch(`/api/food-search?q=${encodeURIComponent(foodName)}`);
        if (response.ok) {
          const usdaResults = await response.json();
          // Combine common foods with USDA results, removing duplicates
          const combined = [...commonResults];
          usdaResults.forEach((usdaFood: FoodSuggestion) => {
            if (!combined.some(food => food.name.toLowerCase() === usdaFood.name.toLowerCase())) {
              combined.push(usdaFood);
            }
          });
          setSuggestions(combined.slice(0, 8));
        }
      } catch (error) {
        console.error('USDA search failed:', error);
      }

      setIsSearching(false);
    };

    const timeoutId = setTimeout(searchFoods, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [foodName]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFoodSelect = (food: FoodSuggestion) => {
    setFoodName(food.name);
    setSelectedFood(food);
    setShowSuggestions(false);
  };

  const handleBarcodeScanned = (product: any) => {
    setFoodName(product.name);
    setSelectedFood({
      name: product.name,
      brand: product.brand,
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
      category: product.category || 'Packaged Food',
    });
    setShowScanner(false);
  };

  const getQuantityMultiplier = () => {
    const qty = parseFloat(quantity);
    
    switch (quantityType) {
      case 'grams':
        return qty / 100; // Convert to per-gram multiplier
      case 'pieces':
        // Estimate average piece weights for common foods
        const pieceWeights: { [key: string]: number } = {
          'roti': 30, 'chapati': 30, 'naan': 60, 'paratha': 50,
          'bread': 25, 'slice': 25, 'biscuit': 15, 'cookie': 15,
          'apple': 150, 'banana': 120, 'orange': 130, 'egg': 50,
          'samosa': 40, 'pakora': 20, 'idli': 35, 'dosa': 80
        };
        
        const foodLower = foodName.toLowerCase();
        let estimatedWeight = 50; // Default weight per piece
        
        for (const [food, weight] of Object.entries(pieceWeights)) {
          if (foodLower.includes(food)) {
            estimatedWeight = weight;
            break;
          }
        }
        
        return (qty * estimatedWeight) / 100;
      case 'cups':
        // Convert cups to grams (approximate)
        return (qty * 240) / 100; // 1 cup ≈ 240g for most foods
      case 'tablespoons':
        return (qty * 15) / 100; // 1 tbsp ≈ 15g
      case 'teaspoons':
        return (qty * 5) / 100; // 1 tsp ≈ 5g
      default:
        return qty / 100;
    }
  };

  const getServingSizeText = () => {
    const qty = quantity;
    switch (quantityType) {
      case 'pieces':
        return `${qty} piece${qty !== '1' ? 's' : ''}`;
      case 'cups':
        return `${qty} cup${qty !== '1' ? 's' : ''}`;
      case 'tablespoons':
        return `${qty} tbsp`;
      case 'teaspoons':
        return `${qty} tsp`;
      default:
        return `${qty}g`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !mealType || !quantity) return;

    setIsLoading(true);
    setError('');

    try {
      let nutrition;
      const quantityMultiplier = getQuantityMultiplier();

      if (selectedFood) {
        // Use selected food's nutrition data
        nutrition = {
          calories: Math.round(selectedFood.calories * quantityMultiplier),
          protein: Math.round(selectedFood.protein * quantityMultiplier),
          carbs: Math.round(selectedFood.carbs * quantityMultiplier),
          fat: Math.round(selectedFood.fat * quantityMultiplier),
        };
      } else {
        // Get nutrition info from API
        const nutritionResponse = await fetch('/api/nutrition', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ foodDescription: foodName }),
        });

        if (!nutritionResponse.ok) {
          throw new Error('Failed to get nutrition info');
        }

        const apiNutrition = await nutritionResponse.json();
        nutrition = {
          calories: Math.round(apiNutrition.calories * quantityMultiplier),
          protein: Math.round(apiNutrition.protein * quantityMultiplier),
          carbs: Math.round(apiNutrition.carbs * quantityMultiplier),
          fat: Math.round(apiNutrition.fat * quantityMultiplier),
        };
      }

      // Save meal
      const mealResponse = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          food_name: `${foodName} (${getServingSizeText()})`,
          meal_type: mealType,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          serving_size: getServingSizeText(),
        }),
      });

      if (!mealResponse.ok) {
        throw new Error('Failed to save meal');
      }

      // Reset form
      setFoodName('');
      setMealType('');
      setQuantity('100');
      setQuantityType('grams');
      setSelectedFood(null);
      setSuggestions([]);
      onMealAdded();
    } catch (error) {
      setError('Failed to add meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a Meal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label htmlFor="foodName">Food Item</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-1 flex-1 sm:flex-none"
                >
                  <Scan className="h-4 w-4" />
                  <span>Scan</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualEntry(true)}
                  className="flex items-center gap-1 flex-1 sm:flex-none"
                >
                  <Search className="h-4 w-4" />
                  <span>Barcode</span>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Input
                ref={inputRef}
                id="foodName"
                placeholder="e.g., roti, chicken tikka, apple..."
                value={foodName}
                onChange={(e) => {
                  setFoodName(e.target.value);
                  setSelectedFood(null);
                }}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                required
                className="pr-8"
              />
              {isSearching && (
                <Search className="absolute right-2 top-2.5 h-4 w-4 animate-pulse text-muted-foreground" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto"
              >
                {suggestions.map((food, index) => (
                  <div
                    key={`${food.name}-${index}`}
                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => handleFoodSelect(food)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{food.name}</div>
                      {food.brand && (
                        <div className="text-xs text-muted-foreground">{food.brand}</div>
                      )}
                      <Badge variant="outline" className="text-xs mt-1">
                        {food.category}
                      </Badge>
                    </div>
                    <div className="text-right text-xs text-muted-foreground ml-2">
                      <div className="font-medium">{food.calories} kcal</div>
                      <div>P:{food.protein}g C:{food.carbs}g F:{food.fat}g</div>
                      <div className="text-xs opacity-75">per 100g</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder={
                    quantityType === 'pieces' ? '2' :
                    quantityType === 'cups' ? '1' :
                    quantityType === 'tablespoons' ? '2' :
                    quantityType === 'teaspoons' ? '1' : '100'
                  }
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="flex-1"
                />
                <Select value={quantityType} onValueChange={(value) => {
                  setQuantityType(value);
                  // Update default quantity based on type
                  if (value === 'pieces') setQuantity('2');
                  else if (value === 'cups') setQuantity('1');
                  else if (value === 'tablespoons') setQuantity('2');
                  else if (value === 'teaspoons') setQuantity('1');
                  else setQuantity('100');
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grams">Grams</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="cups">Cups</SelectItem>
                    <SelectItem value="tablespoons">Tbsp</SelectItem>
                    <SelectItem value="teaspoons">Tsp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {quantityType === 'pieces' && (
                <p className="text-xs text-muted-foreground">
                  Use for items like rotis, bread slices, fruits, etc.
                </p>
              )}
              {quantityType === 'cups' && (
                <p className="text-xs text-muted-foreground">
                  Use for rice, dal, vegetables, liquids, etc.
                </p>
              )}
              {quantityType === 'tablespoons' && (
                <p className="text-xs text-muted-foreground">
                  Use for oils, ghee, sauces, etc.
                </p>
              )}
              {quantityType === 'teaspoons' && (
                <p className="text-xs text-muted-foreground">
                  Use for spices, sugar, small amounts, etc.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealType">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nutrition Preview */}
          {selectedFood && quantity && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">Nutrition Preview ({getServingSizeText()}):</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">{Math.round(selectedFood.calories * getQuantityMultiplier())}</div>
                  <div className="text-muted-foreground">kcal</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{Math.round(selectedFood.protein * getQuantityMultiplier())}g</div>
                  <div className="text-muted-foreground">protein</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{Math.round(selectedFood.carbs * getQuantityMultiplier())}g</div>
                  <div className="text-muted-foreground">carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{Math.round(selectedFood.fat * getQuantityMultiplier())}g</div>
                  <div className="text-muted-foreground">fat</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button type="submit" disabled={isLoading || !foodName.trim() || !mealType || !quantity}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding meal...
              </>
            ) : (
              'Add Meal'
            )}
          </Button>
        </form>

        {/* Barcode Scanner Modal */}
        {showScanner && (
          <BarcodeScanner
            onProductScanned={handleBarcodeScanned}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Manual Barcode Entry Modal */}
        {showManualEntry && (
          <ManualBarcodeEntry
            onProductFound={handleBarcodeScanned}
            onClose={() => setShowManualEntry(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}