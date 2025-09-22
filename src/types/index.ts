export interface User {
  id: string;
  email: string;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  current_weight?: number; // kg - current weight
  target_weight?: number; // kg - desired weight
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  fitness_goal?: 'lose' | 'maintain' | 'gain' | 'recomposition';
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  current_adjustment?: string; // Track current calorie adjustment state
  created_at?: string;
  updated_at?: string;
}

export interface Meal {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  created_at: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface ActivityLevel {
  value: string;
  label: string;
  multiplier: number;
}

export interface FitnessGoal {
  value: string;
  label: string;
  calorieAdjustment: number;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  logged_at: string;
  notes?: string;
}

export interface WeightProgress {
  currentWeight: number;
  targetWeight: number;
  weightDifference: number;
  progressPercentage: number;
  isOnTrack: boolean;
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  rest_seconds?: number;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_name: string;
  exercises: WorkoutExercise[];
  notes?: string;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
}

// Legacy interface for backward compatibility if needed
export interface Workout {
  id: string;
  user_id: string;
  workout_name: string;
  set_number: number;
  weight: number;
  reps: number;
  notes?: string;
  created_at: string;
}

export interface CalorieAdjustment {
  value: string;
  label: string;
  adjustment: number;
}

export interface BasePlan {
  maintenanceCalories: number;
  goalCalories: number;
  goalName: string;
  macros: {
    protein: { grams: number; percentage: number };
    carbs: { grams: number; percentage: number };
    fat: { grams: number; percentage: number };
  };
}

export interface AdjustedPlan {
  adjustedCalories: number;
  expectedWeeklyChange: string;
  macros: {
    protein: { grams: number; percentage: number };
    carbs: { grams: number; percentage: number };
    fat: { grams: number; percentage: number };
  };
}