import { ActivityLevel, FitnessGoal } from '@/types';

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
  { value: 'gain', label: 'Gain weight', calorieAdjustment: 500 }
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

export function calculateTargetCalories(tdee: number, goal: string, currentWeight?: number, targetWeight?: number): number {
  const goalObj = fitnessGoals.find(g => g.value === goal);
  let calorieAdjustment = goalObj?.calorieAdjustment || 0;
  
  // If we have both current and target weight, calculate more precise calorie adjustment
  if (currentWeight && targetWeight && currentWeight !== targetWeight) {
    const weightDifference = targetWeight - currentWeight;
    
    if (weightDifference < 0) {
      // Losing weight: create larger deficit for faster loss if desired
      calorieAdjustment = Math.max(-750, weightDifference * 50); // Max 750 cal deficit
    } else if (weightDifference > 0) {
      // Gaining weight: create surplus
      calorieAdjustment = Math.min(500, weightDifference * 50); // Max 500 cal surplus
    }
  }
  
  return Math.round(tdee + calorieAdjustment);
}

export function calculateMacros(targetCalories: number) {
  // Standard macro distribution: 30% protein, 40% carbs, 30% fat
  const protein = Math.round((targetCalories * 0.3) / 4); // 4 calories per gram
  const carbs = Math.round((targetCalories * 0.4) / 4); // 4 calories per gram
  const fat = Math.round((targetCalories * 0.3) / 9); // 9 calories per gram
  
  return { protein, carbs, fat };
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