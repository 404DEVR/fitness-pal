import { ActivityLevel, FitnessGoal, CalorieAdjustment, BasePlan, AdjustedPlan } from '@/types';

export const activityLevels: ActivityLevel[] = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)', multiplier: 1.2 },
  { value: 'lightly_active', label: 'Lightly active (light exercise 1-3 days/week)', multiplier: 1.375 },
  { value: 'moderately_active', label: 'Moderately active (moderate exercise 3-5 days/week)', multiplier: 1.55 },
  { value: 'very_active', label: 'Very active (hard exercise 6-7 days/week)', multiplier: 1.725 },
  { value: 'extremely_active', label: 'Extremely active (very hard exercise, physical job)', multiplier: 1.9 }
];

export const fitnessGoals: FitnessGoal[] = [
  { value: 'lose', label: 'Lose weight', calorieAdjustment: -500 },
  { value: 'maintain', label: 'Maintain weight', calorieAdjustment: 0 },
  { value: 'gain', label: 'Gain weight', calorieAdjustment: 500 },
  { value: 'recomposition', label: 'Body recomposition', calorieAdjustment: -200 }
];

// Mifflin-St Jeor Equation
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activity = activityLevels.find(level => level.value === activityLevel);
  return bmr * (activity?.multiplier || 1.2);
}

export function calculateTargetCalories(
  tdee: number,
  goal: string,
  currentWeight?: number,
  targetWeight?: number
): number {
  let calorieAdjustment = 0;

  if (goal === 'lose') {
    calorieAdjustment = -500; // Safe deficit
  } else if (goal === 'gain') {
    calorieAdjustment = 300; // Moderate surplus
  } else if (goal === 'maintain') {
    calorieAdjustment = 0;
  } else if (goal === 'recomposition') {
    calorieAdjustment = -200; // Small deficit for fat loss + muscle gain
  }

  return Math.round(tdee + calorieAdjustment);
}

export function calculateMacros(
  targetCalories: number,
  fitnessGoal?: string,
  bodyWeightKg?: number
) {
  // fallback if bodyWeight not passed
  const weight = bodyWeightKg || Math.round(targetCalories / 30);

  let proteinGrams: number;
  let fatGrams: number;
  let carbGrams: number;

  if (fitnessGoal === 'lose') {
    proteinGrams = Math.round(2.2 * weight);
    fatGrams = Math.round(0.8 * weight);
  } else if (fitnessGoal === 'gain') {
    proteinGrams = Math.round(1.7 * weight);
    fatGrams = Math.round(1.0 * weight);
  } else if (fitnessGoal === 'maintain') {
    proteinGrams = Math.round(1.8 * weight);
    fatGrams = Math.round(0.9 * weight);
  } else if (fitnessGoal === 'recomposition') {
    proteinGrams = Math.round(2.0 * weight);
    fatGrams = Math.round(0.9 * weight);
  } else {
    // default: maintain
    proteinGrams = Math.round(1.8 * weight);
    fatGrams = Math.round(0.9 * weight);
  }

  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  const remainingCalories = targetCalories - (proteinCalories + fatCalories);
  carbGrams = Math.max(0, Math.round(remainingCalories / 4));

  return { protein: proteinGrams, carbs: carbGrams, fat: fatGrams };
}


export function calculateWeightProgress(currentWeight: number, targetWeight: number): {
  weightDifference: number;
  progressPercentage: number;
  isOnTrack: boolean;
  timeToGoal: string;
} {
  const weightDifference = targetWeight - currentWeight;
  const absWeightDifference = Math.abs(weightDifference);
  
  // Calculate progress percentage (assuming starting weight was further from target)
  const progressPercentage = absWeightDifference > 0 ? 
    Math.max(0, Math.min(100, (1 - absWeightDifference / 10) * 100)) : 100;
  
  // Determine if on track (healthy weight loss/gain rate: 0.5-1kg per week)
  const isOnTrack = absWeightDifference <= 20; // Within 20kg of target is reasonable
  
  // Estimate time to goal (assuming 0.5kg per week)
  const weeksToGoal = Math.ceil(absWeightDifference / 0.5);
  const timeToGoal = weeksToGoal > 52 ? 
    `${Math.ceil(weeksToGoal / 52)} year${weeksToGoal > 104 ? 's' : ''}` :
    `${weeksToGoal} week${weeksToGoal !== 1 ? 's' : ''}`;
  
  return {
    weightDifference,
    progressPercentage,
    isOnTrack,
    timeToGoal
  };
}
// Calorie adjustment options for secondary layer
export const calorieAdjustments: CalorieAdjustment[] = [
  { value: 'none', label: 'No Adjustment (default)', adjustment: 0 },
  { value: 'deficit_200', label: 'Deficit: -200 kcal', adjustment: -200 },
  { value: 'deficit_400', label: 'Deficit: -400 kcal', adjustment: -400 },
  { value: 'deficit_600', label: 'Deficit: -600 kcal', adjustment: -600 },
  { value: 'surplus_200', label: 'Surplus: +200 kcal', adjustment: 200 },
  { value: 'surplus_400', label: 'Surplus: +400 kcal', adjustment: 400 },
  { value: 'surplus_600', label: 'Surplus: +600 kcal', adjustment: 600 }
];

// Calculate base plan (primary layer)
export function calculateBasePlan(
  maintenanceCalories: number,
  fitnessGoal: string,
  bodyWeightKg: number
): BasePlan {
  const goalCalories = calculateTargetCalories(maintenanceCalories, fitnessGoal);
  const goalName = fitnessGoals.find(g => g.value === fitnessGoal)?.label || 'Unknown Goal';
  
  // Calculate macros using the new formula
  const proteinGrams = Math.round(bodyWeightKg * 2); // 2g per kg
  const fatCalories = Math.round(goalCalories * 0.25); // 25% of calories
  const fatGrams = Math.round(fatCalories / 9);
  
  const proteinCalories = proteinGrams * 4;
  const remainingCalories = goalCalories - proteinCalories - fatCalories;
  const carbGrams = Math.max(0, Math.round(remainingCalories / 4));
  
  const proteinPercentage = Math.round((proteinCalories / goalCalories) * 100);
  const fatPercentage = 25;
  const carbPercentage = Math.round((remainingCalories / goalCalories) * 100);
  
  return {
    maintenanceCalories,
    goalCalories,
    goalName,
    macros: {
      protein: { grams: proteinGrams, percentage: proteinPercentage },
      carbs: { grams: carbGrams, percentage: carbPercentage },
      fat: { grams: fatGrams, percentage: fatPercentage }
    }
  };
}

// Calculate adjusted plan (secondary layer)
export function calculateAdjustedPlan(
  baseCalories: number,
  adjustment: number,
  bodyWeightKg: number
): AdjustedPlan {
  const adjustedCalories = baseCalories + adjustment;
  
  // Calculate expected weekly change
  const weeklyCalorieChange = adjustment * 7;
  const weeklyWeightChange = Math.abs(weeklyCalorieChange) / 7700; // 7700 kcal ≈ 1 kg fat
  
  let expectedWeeklyChange: string;
  if (adjustment === 0) {
    expectedWeeklyChange = 'No change expected';
  } else if (adjustment < 0) {
    expectedWeeklyChange = `Expected loss: ~${weeklyWeightChange.toFixed(2)} kg/week`;
  } else {
    expectedWeeklyChange = `Expected gain: ~${weeklyWeightChange.toFixed(2)} kg/week`;
  }
  
  // Recalculate macros with adjusted calories
  const proteinGrams = Math.round(bodyWeightKg * 2); // 2g per kg (fixed)
  const fatCalories = Math.round(adjustedCalories * 0.25); // 25% of calories
  const fatGrams = Math.round(fatCalories / 9);
  
  const proteinCalories = proteinGrams * 4;
  const remainingCalories = adjustedCalories - proteinCalories - fatCalories;
  const carbGrams = Math.max(0, Math.round(remainingCalories / 4));
  
  const proteinPercentage = Math.round((proteinCalories / adjustedCalories) * 100);
  const fatPercentage = 25;
  const carbPercentage = Math.round((remainingCalories / adjustedCalories) * 100);
  
  return {
    adjustedCalories,
    expectedWeeklyChange,
    macros: {
      protein: { grams: proteinGrams, percentage: proteinPercentage },
      carbs: { grams: carbGrams, percentage: carbPercentage },
      fat: { grams: fatGrams, percentage: fatPercentage }
    }
  };
}