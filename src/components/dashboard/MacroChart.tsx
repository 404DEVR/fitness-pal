'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyStats } from '@/types';

interface MacroChartProps {
  stats: DailyStats;
}

const COLORS = {
  protein: '#8884d8',
  carbs: '#82ca9d',
  fat: '#ffc658',
};

export function MacroChart({ stats }: MacroChartProps) {
  const data = [
    {
      name: 'Protein',
      value: stats.totalProtein,
      target: stats.targetProtein,
      color: COLORS.protein,
    },
    {
      name: 'Carbs',
      value: stats.totalCarbs,
      target: stats.targetCarbs,
      color: COLORS.carbs,
    },
    {
      name: 'Fat',
      value: stats.totalFat,
      target: stats.targetFat,
      color: COLORS.fat,
    },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; target: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-2 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            {Math.round(data.value)}g / {Math.round(data.target)}g
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Macronutrients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {data.map((macro) => (
            <div key={macro.name} className="text-center p-2 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium" style={{ color: macro.color }}>
                {macro.name}
              </div>
              <div className="text-lg font-bold">
                {Math.round(macro.value)}g
              </div>
              <div className="text-xs text-muted-foreground">
                / {Math.round(macro.target)}g
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}