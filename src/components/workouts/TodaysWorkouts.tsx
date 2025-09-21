'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Workout } from '@/types';
import { format } from 'date-fns';
import { 
  Calendar, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  MoreVertical,
  TrendingUp,
  Weight,
  RotateCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TodaysWorkoutsProps {
  workouts: Workout[];
  onWorkoutUpdated: () => void;
}

export function TodaysWorkouts({ workouts, onWorkoutUpdated }: TodaysWorkoutsProps) {
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ weight: string; reps: string; notes: string }>({
    weight: '',
    reps: '',
    notes: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingWorkout, setDeletingWorkout] = useState<string | null>(null);

  // Filter to today's workouts only
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysWorkouts = workouts.filter(workout => 
    format(new Date(workout.created_at), 'yyyy-MM-dd') === today
  );

  // Group by workout name
  const workoutsByName = todaysWorkouts.reduce((acc: any, workout) => {
    if (!acc[workout.workout_name]) {
      acc[workout.workout_name] = [];
    }
    acc[workout.workout_name].push(workout);
    return acc;
  }, {});

  const startEdit = (workout: Workout) => {
    setEditingWorkout(workout.id);
    setEditValues({
      weight: workout.weight.toString(),
      reps: workout.reps.toString(),
      notes: workout.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingWorkout(null);
    setEditValues({ weight: '', reps: '', notes: '' });
  };

  const saveEdit = async (workoutId: string) => {
    if (!editValues.weight || !editValues.reps) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight: parseFloat(editValues.weight),
          reps: parseInt(editValues.reps),
          notes: editValues.notes,
        }),
      });

      if (response.ok) {
        setEditingWorkout(null);
        onWorkoutUpdated();
      } else {
        alert('Failed to update workout');
      }
    } catch (error) {
      console.error('Failed to update workout:', error);
      alert('Failed to update workout');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this set?')) return;

    setDeletingWorkout(workoutId);
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onWorkoutUpdated();
      } else {
        alert('Failed to delete workout');
      }
    } catch (error) {
      console.error('Failed to delete workout:', error);
      alert('Failed to delete workout');
    } finally {
      setDeletingWorkout(null);
    }
  };

  if (Object.keys(workoutsByName).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Weight className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No workouts today</p>
            <p className="text-sm">Start by logging your first workout above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Workouts
          <Badge variant="outline" className="ml-auto">
            {format(new Date(), 'MMM dd, yyyy')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(workoutsByName).map(([workoutName, sets]: [string, any]) => {
            const totalVolume = sets.reduce((sum: number, set: Workout) => 
              sum + (set.weight * set.reps), 0
            );
            const maxWeight = Math.max(...sets.map((set: Workout) => set.weight));
            const totalReps = sets.reduce((sum: number, set: Workout) => sum + set.reps, 0);

            return (
              <div key={workoutName} className="border rounded-lg p-4 bg-card">
                {/* Workout Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{workoutName}</h3>
                    <Badge variant="secondary">
                      {sets.length} set{sets.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  {/* Workout Summary */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="text-center">
                      <div className="font-medium text-foreground">{maxWeight}kg</div>
                      <div>Max Weight</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">{totalReps}</div>
                      <div>Total Reps</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">{totalVolume.toFixed(0)}kg</div>
                      <div>Volume</div>
                    </div>
                  </div>
                </div>

                {/* Sets List */}
                <div className="space-y-2">
                  {sets
                    .sort((a: Workout, b: Workout) => a.set_number - b.set_number)
                    .map((set: Workout) => (
                      <div key={set.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        {editingWorkout === set.id ? (
                          // Edit Mode
                          <div className="flex items-center gap-3 flex-1">
                            <span className="font-medium w-12">Set {set.set_number}:</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.5"
                                value={editValues.weight}
                                onChange={(e) => setEditValues(prev => ({ ...prev, weight: e.target.value }))}
                                className="w-20 h-8"
                                placeholder="Weight"
                              />
                              <span className="text-sm text-muted-foreground">kg ×</span>
                              <Input
                                type="number"
                                value={editValues.reps}
                                onChange={(e) => setEditValues(prev => ({ ...prev, reps: e.target.value }))}
                                className="w-16 h-8"
                                placeholder="Reps"
                              />
                              <span className="text-sm text-muted-foreground">reps</span>
                            </div>
                            <div className="flex items-center gap-1 ml-auto">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(set.id)}
                                disabled={isUpdating}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                disabled={isUpdating}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">Set {set.set_number}:</span>
                              <span className="text-lg">
                                <span className="font-semibold">{set.weight}kg</span>
                                <span className="text-muted-foreground mx-2">×</span>
                                <span className="font-semibold">{set.reps}</span>
                                <span className="text-muted-foreground ml-1">reps</span>
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {(set.weight * set.reps).toFixed(0)}kg volume
                              </Badge>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => startEdit(set)}>
                                  <Edit3 className="mr-2 h-4 w-4" />
                                  Edit Set
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteWorkout(set.id)}
                                  disabled={deletingWorkout === set.id}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {deletingWorkout === set.id ? 'Deleting...' : 'Delete Set'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    ))}
                </div>

                {/* Notes */}
                {sets[0]?.notes && (
                  <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                    <span className="font-medium">Notes: </span>
                    {sets[0].notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}