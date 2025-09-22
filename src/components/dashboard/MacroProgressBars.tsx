'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DailyStats } from '@/types';
import { Target, TrendingUp } from 'lucide-react';

interface MacroProgressBarsProps {
  stats: DailyStats;
}

export function MacroProgressBars({ stats }: MacroProgressBarsProps) {
  const macros = [
    {
      name: 'Protein',
      current: stats.totalProtein,
      target: stats.targetProtein,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      unit: 'g'
    },
    {
      name: 'Carbs',
      current: stats.totalCarbs,
      target: stats.targetCarbs,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      unit: 'g'
    },
    {
      name: 'Fat',
      current: stats.totalFat,
      target: stats.targetFat,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      unit: 'g'
    }
  ];

  const calculatePercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getRemainingAmount = (current: number, target: number) => {
    return Math.max(target - current, 0);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Target className="h-5 w-5 flex-shrink-0" />
          <span className="break-words">Macro Progress Tracking</span>
        </CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visual progress toward your daily macro targets
        </p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {macros.map((macro) => {
          const percentage = calculatePercentage(macro.current, macro.target);
          const remaining = getRemainingAmount(macro.current, macro.target);
          const isComplete = percentage >= 100;
          
          return (
            <div key={macro.name} className="space-y-3">
              {/* Macro Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${macro.color} flex-shrink-0`}></div>
                  <span className="font-medium text-sm sm:text-base">{macro.name}</span>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm sm:text-base font-semibold">
                    {Math.round(macro.current)}{macro.unit} / {Math.round(macro.target)}{macro.unit}
                  </div>
                  <div className={`text-xs sm:text-sm ${getStatusColor(percentage)}`}>
                    {Math.round(percentage)}% complete
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className={`w-full h-3 sm:h-4 rounded-full ${macro.bgColor}`}>
                  <div 
                    className={`h-3 sm:h-4 rounded-full transition-all duration-300 ${macro.color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                  {percentage > 100 && (
                    <div className="absolute top-0 right-0 h-3 sm:h-4 w-2 bg-red-500 rounded-r-full"></div>
                  )}
                </div>
              </div>

              {/* Remaining Amount Display */}
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 rounded-lg ${macro.bgColor}`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-4 w-4 ${macro.textColor} flex-shrink-0`} />
                  <span className={`text-sm sm:text-base font-medium ${macro.textColor}`}>
                    {isComplete ? 'Target Reached!' : 'Remaining'}
                  </span>
                </div>
                <div className={`text-left sm:text-right ${macro.textColor}`}>
                  {isComplete ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <span className="text-sm sm:text-base font-bold">✓ Complete</span>
                      {percentage > 100 && (
                        <span className="text-xs sm:text-sm break-words">
                          (+{Math.round(macro.current - macro.target)}g over)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg sm:text-xl font-bold">
                        {Math.round(remaining)}{macro.unit}
                      </div>
                      <div className="text-xs sm:text-sm opacity-75">
                        to reach target
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Overall Progress Summary */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <span className="font-medium text-sm sm:text-base">Overall Macro Balance</span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {macros.filter(m => calculatePercentage(m.current, m.target) >= 90).length} of 3 targets nearly complete
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
            {macros.map((macro) => {
              const percentage = calculatePercentage(macro.current, macro.target);
              return (
                <div key={macro.name} className="text-center p-2 sm:p-1">
                  <div className={`text-xs sm:text-sm font-medium ${macro.textColor}`}>
                    {macro.name}
                  </div>
                  <div className={`text-lg sm:text-xl font-bold ${getStatusColor(percentage)}`}>
                    {Math.round(percentage)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}