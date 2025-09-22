'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Weight, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface ProgressData {
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
  exercises: Array<{
    name: string;
    sets: Array<{
      weight: number;
      reps: number;
    }>;
    volume: number;
    maxWeight: number;
    totalReps: number;
  }>;
}

interface WorkoutProgressProps {
  refreshTrigger: number;
}

export function WorkoutProgress({ refreshTrigger }: WorkoutProgressProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<string>('');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [workoutOptions, setWorkoutOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<'weight' | 'volume'>('weight');

  // Fetch available workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch('/api/workouts');
        if (response.ok) {
          const workouts: Array<{ workout_name: string }> = await response.json();
          const workoutNames = workouts.map(w => w.workout_name);
          const uniqueWorkoutsSet = new Set(workoutNames);
          const uniqueWorkouts = Array.from(uniqueWorkoutsSet);
          setWorkoutOptions(uniqueWorkouts);
          if (uniqueWorkouts.length > 0 && !selectedWorkout) {
            setSelectedWorkout(uniqueWorkouts[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch workouts:', error);
      }
    };

    fetchWorkouts();
  }, [refreshTrigger, selectedWorkout]);

  // Fetch progress data for selected workout
  useEffect(() => {
    const fetchProgress = async () => {
      if (!selectedWorkout) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/workouts/progress?workout=${encodeURIComponent(selectedWorkout)}`);
        if (response.ok) {
          const data = await response.json();
          setProgressData(data.progress || []);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [selectedWorkout, refreshTrigger]);

  const chartData = progressData.map(session => ({
    date: format(new Date(session.date), 'MMM dd'),
    fullDate: session.date,
    maxWeight: session.maxWeight,
    totalVolume: session.totalVolume,
    totalReps: session.totalReps,
    sets: session.exercises?.reduce((total: number, exercise: any) => total + (exercise.sets?.length || 0), 0) || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">Max Weight: {data.maxWeight}kg</p>
          <p className="text-sm">Total Volume: {data.totalVolume}kg</p>
          <p className="text-sm">Total Reps: {data.totalReps}</p>
          <p className="text-sm">Sets: {data.sets}</p>
        </div>
      );
    }
    return null;
  };

  if (workoutOptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Workout Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No workout data yet. Start logging workouts to see your progress!
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestSession = progressData[progressData.length - 1];
  const firstSession = progressData[0];
  const weightImprovement = latestSession && firstSession ? 
    ((latestSession.maxWeight - firstSession.maxWeight) / firstSession.maxWeight * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Workout Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Workout Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workout to track" />
                </SelectTrigger>
                <SelectContent>
                  {workoutOptions.map((workout) => (
                    <SelectItem key={workout} value={workout}>
                      {workout}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={chartType} onValueChange={(value: 'weight' | 'volume') => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Max Weight</SelectItem>
                <SelectItem value="volume">Total Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress Stats */}
          {latestSession && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Weight className="h-4 w-4" />
                  <span className="text-sm font-medium">Max Weight</span>
                </div>
                <div className="text-2xl font-bold">{latestSession.maxWeight}kg</div>
                {weightImprovement !== 0 && (
                  <Badge variant={weightImprovement > 0 ? 'default' : 'secondary'} className="text-xs">
                    {weightImprovement > 0 ? '+' : ''}{weightImprovement.toFixed(1)}%
                  </Badge>
                )}
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Total Volume</span>
                </div>
                <div className="text-2xl font-bold">{latestSession.totalVolume}kg</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Sessions</span>
                </div>
                <div className="text-2xl font-bold">{progressData.length}</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-sm font-medium">Total Reps</span>
                </div>
                <div className="text-2xl font-bold">{latestSession.totalReps}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Chart */}
      {selectedWorkout && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedWorkout} - {chartType === 'weight' ? 'Max Weight' : 'Total Volume'} Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">Loading progress data...</div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">No data available for {selectedWorkout}</div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'weight' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="maxWeight" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="totalVolume" fill="#82ca9d" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}