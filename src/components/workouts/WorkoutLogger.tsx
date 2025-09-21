'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutSet } from '@/types';
import { commonWorkouts, searchWorkouts } from '@/lib/common-workouts';
import { Plus, Trash2, Dumbbell, Loader2 } from 'lucide-react';

interface WorkoutLoggerProps {
  onWorkoutSaved: () => void;
}

export function WorkoutLogger({ onWorkoutSaved }: WorkoutLoggerProps) {
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWorkouts, setFilteredWorkouts] = useState(commonWorkouts);
  const [sets, setSets] = useState<WorkoutSet[]>([
    { setNumber: 1, weight: 0, reps: 0 },
    { setNumber: 2, weight: 0, reps: 0 },
    { setNumber: 3, weight: 0, reps: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const filtered = searchWorkouts(searchQuery);
    setFilteredWorkouts(filtered);
  }, [searchQuery]);

  const addSet = () => {
    setSets(prev => [
      ...prev,
      { setNumber: prev.length + 1, weight: 0, reps: 0 }
    ]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(prev => prev.filter((_, i) => i !== index).map((set, i) => ({
        ...set,
        setNumber: i + 1
      })));
    }
  };

  const updateSet = (index: number, field: 'weight' | 'reps', value: string) => {
    setSets(prev => prev.map((set, i) => 
      i === index 
        ? { ...set, [field]: parseFloat(value) || 0 }
        : set
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkout) return;

    // Validate that at least one set has data
    const validSets = sets.filter(set => set.weight > 0 && set.reps > 0);
    if (validSets.length === 0) {
      setError('Please enter weight and reps for at least one set');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workout_name: selectedWorkout,
          sets: validSets,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save workout');
      }

      // Reset form
      setSelectedWorkout('');
      setSearchQuery('');
      setSets([
        { setNumber: 1, weight: 0, reps: 0 },
        { setNumber: 2, weight: 0, reps: 0 },
        { setNumber: 3, weight: 0, reps: 0 },
      ]);
      setNotes('');
      onWorkoutSaved();
    } catch (error) {
      setError('Failed to save workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWorkoutInfo = commonWorkouts.find(w => w.name === selectedWorkout);

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
          {/* Workout Selection */}
          <div className="space-y-2">
            <Label htmlFor="workout">Select Exercise</Label>
            <div className="space-y-2">
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exercise" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {filteredWorkouts.map((workout) => (
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
          </div>

          {/* Sets Table */}
          {selectedWorkout && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sets & Reps</Label>
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
                <div className="grid grid-cols-4 gap-4 p-3 bg-muted font-medium text-sm">
                  <div>Set</div>
                  <div>Weight (kg)</div>
                  <div>Reps</div>
                  <div>Action</div>
                </div>
                
                {sets.map((set, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t">
                    <div className="flex items-center font-medium">
                      {set.setNumber}
                    </div>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="0"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(index, 'weight', e.target.value)}
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(index, 'reps', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSet(index)}
                      disabled={sets.length <= 1}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Workout Summary */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Workout Summary:</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Total Sets</div>
                    <div className="text-muted-foreground">
                      {sets.filter(s => s.weight > 0 && s.reps > 0).length}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Total Reps</div>
                    <div className="text-muted-foreground">
                      {sets.reduce((sum, set) => sum + (set.reps || 0), 0)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Total Volume</div>
                    <div className="text-muted-foreground">
                      {sets.reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0), 0).toFixed(1)} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="How did the workout feel? Any observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading || !selectedWorkout}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving workout...
              </>
            ) : (
              'Save Workout'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}