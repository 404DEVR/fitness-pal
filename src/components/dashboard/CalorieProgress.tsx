'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyStats } from '@/types';

interface CalorieProgressProps {
  stats: DailyStats;
}

export function CalorieProgress({ stats }: CalorieProgressProps) {
  const caloriePercentage = Math.min((stats.totalCalories / stats.targetCalories) * 100, 100);
  const remaining = Math.max(stats.targetCalories - stats.totalCalories, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Calories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">{Math.round(stats.totalCalories)}</span>
          <span className="text-muted-foreground">/ {stats.targetCalories} kcal</span>
        </div>
        
        <Progress value={caloriePercentage} className="h-3" />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Consumed</span>
          <span>{remaining} remaining</span>
        </div>
      </CardContent>
    </Card>
  );
}