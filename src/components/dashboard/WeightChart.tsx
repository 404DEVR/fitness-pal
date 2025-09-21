'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightLog } from '@/types';
import { format } from 'date-fns';

interface WeightChartProps {
  weightLogs: WeightLog[];
  targetWeight: number;
}

export function WeightChart({ weightLogs, targetWeight }: WeightChartProps) {
  if (weightLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No weight data yet. Start logging your weight to see trends!
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart (reverse to show oldest first)
  const chartData = [...weightLogs]
    .reverse()
    .map((log) => ({
      date: format(new Date(log.logged_at), 'MMM dd'),
      weight: log.weight,
      target: targetWeight,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Weight: {payload[0].value.toFixed(1)}kg
          </p>
          <p className="text-sm text-muted-foreground">
            Target: {targetWeight}kg
          </p>
        </div>
      );
    }
    return null;
  };

  const minWeight = Math.min(...weightLogs.map(log => log.weight), targetWeight) - 2;
  const maxWeight = Math.max(...weightLogs.map(log => log.weight), targetWeight) + 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                domain={[minWeight, maxWeight]}
                tickFormatter={(value) => `${value}kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#82ca9d" 
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#8884d8] rounded-full"></div>
            <span>Actual Weight</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#82ca9d] border-dashed"></div>
            <span>Target Weight</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}