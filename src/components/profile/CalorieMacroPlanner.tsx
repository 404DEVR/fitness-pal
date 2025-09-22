'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Settings, TrendingUp, TrendingDown, Minus, Check, RotateCcw } from 'lucide-react';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateBasePlan, 
  calculateAdjustedPlan,
  calorieAdjustments,
  fitnessGoals
} from '@/lib/calculations';
import { BasePlan, AdjustedPlan } from '@/types';

interface CalorieMacroPlannerProps {
  currentWeight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
  fitnessGoal?: string;
  onImplementAdjustment?: (adjustedPlan: AdjustedPlan) => void;
  onRevertToBase?: (basePlan: BasePlan) => void;
}

export default function CalorieMacroPlanner({
  currentWeight,
  height,
  age,
  gender,
  activityLevel,
  fitnessGoal,
  onImplementAdjustment,
  onRevertToBase
}: CalorieMacroPlannerProps) {
  const [basePlan, setBasePlan] = useState<BasePlan | null>(null);
  const [selectedAdjustment, setSelectedAdjustment] = useState('none');
  const [adjustedPlan, setAdjustedPlan] = useState<AdjustedPlan | null>(null);
  const [isImplemented, setIsImplemented] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);

  // Calculate base plan when user data is available
  useEffect(() => {
    if (currentWeight && height && age && gender && activityLevel && fitnessGoal) {
      const bmr = calculateBMR(currentWeight, height, age, gender);
      const tdee = calculateTDEE(bmr, activityLevel);
      const base = calculateBasePlan(tdee, fitnessGoal, currentWeight);
      setBasePlan(base);
    }
  }, [currentWeight, height, age, gender, activityLevel, fitnessGoal]);

  // Calculate adjusted plan when adjustment changes
  useEffect(() => {
    if (basePlan && currentWeight && selectedAdjustment !== 'none') {
      const adjustment = calorieAdjustments.find(adj => adj.value === selectedAdjustment);
      if (adjustment) {
        const adjusted = calculateAdjustedPlan(
          basePlan.goalCalories,
          adjustment.adjustment,
          currentWeight
        );
        setAdjustedPlan(adjusted);
      }
    } else {
      setAdjustedPlan(null);
    }
  }, [selectedAdjustment, basePlan, currentWeight]);

  const handleAdjustmentChange = (value: string) => {
    setSelectedAdjustment(value);
    setIsImplemented(false); // Reset implementation status when adjustment changes
  };

  const handleImplementAdjustment = async () => {
    if (!adjustedPlan) return;
    
    setIsImplementing(true);
    try {
      await onImplementAdjustment?.(adjustedPlan);
      setIsImplemented(true);
    } catch (error) {
      console.error('Failed to implement adjustment:', error);
    } finally {
      setIsImplementing(false);
    }
  };

  const handleRevertToBase = async () => {
    if (!basePlan) return;
    
    setIsImplementing(true);
    try {
      await onRevertToBase?.(basePlan);
      setSelectedAdjustment('none');
      setIsImplemented(false);
    } catch (error) {
      console.error('Failed to revert to base:', error);
    } finally {
      setIsImplementing(false);
    }
  };

  const getAdjustmentIcon = () => {
    const adjustment = calorieAdjustments.find(adj => adj.value === selectedAdjustment);
    if (!adjustment || adjustment.adjustment === 0) return <Minus className="h-4 w-4 text-blue-500" />;
    if (adjustment.adjustment < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  if (!basePlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calorie & Macro Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please complete your profile information to see your personalized plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  const goalLabel = fitnessGoals.find(g => g.value === fitnessGoal)?.label || 'Unknown Goal';

  return (
    <div className="space-y-4">
      {/* Base Plan Card - Primary Focus */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Your Base Plan
            </CardTitle>
            <Badge variant="secondary" className="w-fit">{goalLabel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Calculated based on your fitness goal and personal metrics
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calorie Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div className="text-lg sm:text-xl font-semibold text-muted-foreground">
                {basePlan.maintenanceCalories}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Maintenance</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-primary/10 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {basePlan.goalCalories}
              </div>
              <div className="text-sm sm:text-base text-primary font-medium">Goal Calories</div>
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {basePlan.macros.protein.grams}g
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {basePlan.macros.protein.percentage}%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Protein</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {basePlan.macros.carbs.grams}g
              </div>
              <div className="text-sm text-green-600 font-medium">
                {basePlan.macros.carbs.percentage}%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Carbs</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-orange-600">
                {basePlan.macros.fat.grams}g
              </div>
              <div className="text-sm text-orange-600 font-medium">
                {basePlan.macros.fat.percentage}%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Fat</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional Adjustment Panel - Secondary */}
      <Card className="border border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="break-words">Optional: Adjust Your Daily Calories</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Fine-tune your calories for faster or slower progress
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="calorie-adjustment" className="text-sm">Calorie Adjustment</Label>
            <Select value={selectedAdjustment} onValueChange={handleAdjustmentChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select adjustment" />
              </SelectTrigger>
              <SelectContent>
                {calorieAdjustments.map((adjustment) => (
                  <SelectItem key={adjustment.value} value={adjustment.value}>
                    {adjustment.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Adjusted Results */}
          {adjustedPlan && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                {getAdjustmentIcon()}
                <span className="text-sm font-medium">Adjusted Plan</span>
              </div>
              
              <div className="space-y-3">
                {/* Adjusted Calories */}
                <div className="text-center p-3 sm:p-4 bg-background rounded border">
                  <div className="text-xl sm:text-2xl font-bold">
                    {adjustedPlan.adjustedCalories}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Adjusted Calories</div>
                </div>

                {/* Expected Change */}
                <div className="text-center p-3 sm:p-4 bg-background rounded border">
                  <div className="text-sm sm:text-base font-medium text-muted-foreground break-words">
                    {adjustedPlan.expectedWeeklyChange}
                  </div>
                </div>

                {/* Adjusted Macros */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div className="text-center p-2 sm:p-3 bg-blue-50/50 rounded">
                    <div className="text-sm sm:text-base font-bold text-blue-600">
                      {adjustedPlan.macros.protein.grams}g
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600">
                      {adjustedPlan.macros.protein.percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  
                  <div className="text-center p-2 sm:p-3 bg-green-50/50 rounded">
                    <div className="text-sm sm:text-base font-bold text-green-600">
                      {adjustedPlan.macros.carbs.grams}g
                    </div>
                    <div className="text-xs sm:text-sm text-green-600">
                      {adjustedPlan.macros.carbs.percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  
                  <div className="text-center p-2 sm:p-3 bg-orange-50/50 rounded">
                    <div className="text-sm sm:text-base font-bold text-orange-600">
                      {adjustedPlan.macros.fat.grams}g
                    </div>
                    <div className="text-xs sm:text-sm text-orange-600">
                      {adjustedPlan.macros.fat.percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">Fat</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  {!isImplemented ? (
                    <Button 
                      onClick={handleImplementAdjustment}
                      disabled={isImplementing}
                      size="sm"
                      className="w-full sm:flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      <span className="truncate">{isImplementing ? 'Implementing...' : 'Implement Changes'}</span>
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <div className="flex-1 flex items-center justify-center p-2 sm:p-3 bg-green-50 text-green-700 rounded text-sm font-medium">
                        <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Changes Applied</span>
                      </div>
                      <Button 
                        onClick={handleRevertToBase}
                        disabled={isImplementing}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        <span className="truncate">{isImplementing ? 'Reverting...' : 'Revert'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}