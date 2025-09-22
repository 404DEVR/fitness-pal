'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutSession } from '@/types';
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
  RotateCcw,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TodaysWorkoutsProps {
  workoutSessions: WorkoutSession[];
  onWorkoutUpdated: () => void;
}

export function TodaysWorkouts({ workoutSessions, onWorkoutUpdated }: TodaysWorkoutsProps) {
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);

  // Filter to today's workout sessions only
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysWorkoutSessions = workoutSessions.filter(session => 
    format(new Date(session.created_at), 'yyyy-MM-dd') === today
  );

  const deleteWorkoutSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this entire workout session?')) return;

    setDeletingSession(sessionId);
    try {
      const response = await fetch(`/api/workouts/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onWorkoutUpdated();
      } else {
        alert('Failed to delete workout session');
      }
    } catch (error) {
      console.error('Failed to delete workout session:', error);
      alert('Failed to delete workout session');
    } finally {
      setDeletingSession(null);
    }
  };

  if (todaysWorkoutSessions.length === 0) {
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
          {todaysWorkoutSessions.map((session) => {
            // Calculate session totals
            const totalVolume = session.exercises.reduce((sum, exercise) => 
              sum + exercise.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0
            );
            const totalExercises = session.exercises.length;
            const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

            return (
              <div key={session.id} className="border rounded-lg p-4 bg-card">
                {/* Session Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{session.workout_name}</h3>
                    <Badge variant="secondary">
                      {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
                    </Badge>
                    {session.duration_minutes && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration_minutes}m
                      </Badge>
                    )}
                  </div>
                  
                  {/* Session Summary */}
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4 text-sm text-muted-foreground">
                    <div className="text-center">
                      <div className="font-medium text-foreground">{totalSets}</div>
                      <div className="text-xs sm:text-sm">Total Sets</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">{totalVolume.toFixed(0)}kg</div>
                      <div className="text-xs sm:text-sm">Volume</div>
                    </div>
                    <div className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => deleteWorkoutSession(session.id)}
                            disabled={deletingSession === session.id}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingSession === session.id ? 'Deleting...' : 'Delete Session'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-4">
                  {session.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="pl-4 border-l-2 border-muted">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        {exercise.name}
                        <Badge variant="outline" className="text-xs">
                          {exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''}
                        </Badge>
                      </h4>
                      
                      <div className="space-y-1">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                            <span>
                              Set {setIndex + 1}: <span className="font-semibold">{set.weight}kg</span>
                              <span className="text-muted-foreground mx-1">×</span>
                              <span className="font-semibold">{set.reps}</span>
                              <span className="text-muted-foreground ml-1">reps</span>
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {(set.weight * set.reps).toFixed(0)}kg
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Session Notes */}
                {session.notes && (
                  <div className="mt-4 p-3 bg-muted/50 rounded text-sm">
                    <span className="font-medium">Notes: </span>
                    {session.notes}
                  </div>
                )}

                {/* Session Time */}
                <div className="mt-3 text-xs text-muted-foreground">
                  Completed at {format(new Date(session.created_at), 'h:mm a')}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}