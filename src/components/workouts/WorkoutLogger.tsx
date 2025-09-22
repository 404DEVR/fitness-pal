'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutSet, WorkoutExercise } from '@/types';
import { commonWorkouts } from '@/lib/common-workouts';
import { Plus, Trash2, Dumbbell, Loader2, X } from 'lucide-react';

interface WorkoutLoggerProps {
  onWorkoutSaved: () => void;
}

export function WorkoutLogger({ onWorkoutSaved }: WorkoutLoggerProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([
    { weight: 0, reps: 0 },
    { weight: 0, reps: 0 },
    { weight: 0, reps: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addSet = () => {
    setCurrentSets(prev => [
      ...prev,
      { weight: 0, reps: 0 }
    ]);
  };

  const removeSet = (index: number) => {
    if (currentSets.length > 1) {
      setCurrentSets(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: 'weight' | 'reps', value: string) => {
    setCurrentSets(prev => prev.map((set, i) =>
      i === index
        ? { ...set, [field]: parseFloat(value) || 0 }
        : set
    ));
  };

  const addExercise = () => {
    if (!currentExercise) {
      setError('Please select an exercise');
      return;
    }

    // Validate that at least one set has data
    const validSets = currentSets.filter(set => set.weight > 0 && set.reps > 0);
    if (validSets.length === 0) {
      setError('Please enter weight and reps for at least one set');
      return;
    }

    const newExercise: WorkoutExercise = {
      name: currentExercise,
      sets: validSets,
    };

    setExercises(prev => [...prev, newExercise]);

    // Reset current exercise form
    setCurrentExercise('');
    setCurrentSets([
      { weight: 0, reps: 0 },
      { weight: 0, reps: 0 },
      { weight: 0, reps: 0 },
    ]);
    setError('');
  };

  // Check if exercise can be added
  const canAddExercise = currentExercise && currentSets.some(set => set.weight > 0 && set.reps > 0);

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workoutName || exercises.length === 0) {
      setError('Please enter a workout name and add at least one exercise');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Submitting workout:', { workout_name: workoutName, exercises, notes });

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workout_name: workoutName,
          exercises,
          notes,
        }),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save workout session');
      }

      // Reset form
      setWorkoutName('');
      setExercises([]);
      setCurrentExercise('');
      setCurrentSets([
        { weight: 0, reps: 0 },
        { weight: 0, reps: 0 },
        { weight: 0, reps: 0 },
      ]);
      setNotes('');
      onWorkoutSaved();
    } catch (error) {
      console.error('Error saving workout:', error);
      setError(error instanceof Error ? error.message : 'Failed to save workout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWorkoutInfo = commonWorkouts.find(w => w.name === currentExercise);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Log Workout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workout Name */}
          <div className="space-y-2">
            <Label htmlFor="workoutName">Workout Name</Label>
            <Input
              id="workoutName"
              placeholder="e.g., Push Day, Leg Day, Full Body..."
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>

          {/* Added Exercises */}
          {exercises.length > 0 && (
            <div className="space-y-3">
              <Label>Added Exercises ({exercises.length})</Label>
              {exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{exercise.name}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExercise(exerciseIndex)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {exercise.sets.length} sets • Total volume: {' '}
                    {exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0).toFixed(1)} kg
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exercise Selection */}
          <div className="space-y-2">
            <Label htmlFor="exercise">Add Exercise</Label>
            <Select value={currentExercise} onValueChange={setCurrentExercise}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an exercise" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {commonWorkouts.map((workout) => (
                  <SelectItem key={workout.name} value={workout.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{workout.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {workout.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedWorkoutInfo && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">{selectedWorkoutInfo.name}</div>
              <div className="text-xs text-muted-foreground mb-2">
                {selectedWorkoutInfo.description}
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedWorkoutInfo.muscleGroups.map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sets Table */}
          {currentExercise && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sets & Reps for {currentExercise}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSet}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Set
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden sm:grid grid-cols-4 gap-4 p-3 bg-muted font-medium text-sm">
                  <div>Set</div>
                  <div>Weight (kg)</div>
                  <div>Reps</div>
                  <div>Action</div>
                </div>

                {currentSets.map((set, index) => (
                  <div key={index} className="border-t">
                    {/* Desktop Layout */}
                    <div className="hidden sm:grid grid-cols-4 gap-4 p-3">
                      <div className="flex items-center font-medium">
                        {index + 1}
                      </div>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0"
                        value={set.weight === 0 ? '' : set.weight}
                        onChange={(e) => updateSet(index, 'weight', e.target.value)}
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={set.reps === 0 ? '' : set.reps}
                        onChange={(e) => updateSet(index, 'reps', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSet(index)}
                        disabled={currentSets.length <= 1}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Mobile Layout */}
                    <div className="sm:hidden p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Set {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSet(index)}
                          disabled={currentSets.length <= 1}
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Weight (kg)</label>
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            placeholder="0"
                            value={set.weight === 0 ? '' : set.weight}
                            onChange={(e) => updateSet(index, 'weight', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Reps</label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={set.reps === 0 ? '' : set.reps}
                            onChange={(e) => updateSet(index, 'reps', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Exercise Button */}
              <Button
                type="button"
                onClick={addExercise}
                disabled={!canAddExercise}
                variant={canAddExercise ? "default" : "secondary"}
                size="lg"
                className={`w-full font-semibold py-3 shadow-md transition-all duration-200 ${canAddExercise
                    ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg animate-pulse'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
              >
                <Plus className="h-5 w-5 mr-2" />
                {canAddExercise ? `✓ Add ${currentExercise} to Workout` : 'Enter exercise details to add'}
              </Button>
            </div>
          )}

          {/* Workout Summary */}
          {exercises.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">Workout Summary:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center sm:text-left">
                  <div className="font-medium">Total Exercises</div>
                  <div className="text-muted-foreground">{exercises.length}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-medium">Total Sets</div>
                  <div className="text-muted-foreground">
                    {exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-medium">Total Volume</div>
                  <div className="text-muted-foreground">
                    {exercises.reduce((sum, ex) =>
                      sum + ex.sets.reduce((setSum, set) => setSum + set.weight * set.reps, 0), 0
                    ).toFixed(1)} kg
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Workout Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did the workout feel? Any observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !workoutName || exercises.length === 0}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving workout session...
              </>
            ) : (
              'Save Workout Session'
            )}
          </Button>
        </form>
      </CardContent>
    </Card >
  );
}