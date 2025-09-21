'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { calculateWeightProgress } from '@/lib/calculations';
import { Scale, TrendingDown, TrendingUp, Target } from 'lucide-react';

interface WeightProgressProps {
  user: User;
  onWeightLogged: () => void;
}

export function WeightProgress({ user, onWeightLogged }: WeightProgressProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user.current_weight || !user.target_weight) {
    return null;
  }

  const progress = calculateWeightProgress(user.current_weight, user.target_weight);
  const isLosingWeight = user.target_weight < user.current_weight;
  const isGainingWeight = user.target_weight > user.current_weight;
  const isAtTarget = Math.abs(progress.weightDifference) < 0.5;

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/weight-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight: parseFloat(newWeight),
          notes,
        }),
      });

      if (response.ok) {
        setNewWeight('');
        setNotes('');
        setIsLogging(false);
        onWeightLogged();
      }
    } catch (error) {
      console.error('Failed to log weight:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Weight Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{user.current_weight}kg</div>
            <div className="text-sm text-muted-foreground">Current</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{user.target_weight}kg</div>
            <div className="text-sm text-muted-foreground">Target</div>
          </div>
          <div>
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              {Math.abs(progress.weightDifference).toFixed(1)}kg
              {isLosingWeight && <TrendingDown className="h-4 w-4 text-red-500" />}
              {isGainingWeight && <TrendingUp className="h-4 w-4 text-green-500" />}
              {isAtTarget && <Target className="h-4 w-4 text-blue-500" />}
            </div>
            <div className="text-sm text-muted-foreground">
              {isAtTarget ? 'At Target!' : 'To Go'}
            </div>
          </div>
        </div>

        {!isAtTarget && (
          <>
            <Progress value={progress.progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {progress.progressPercentage.toFixed(1)}%</span>
              <span>ETA: {progress.timeToGoal}</span>
            </div>
          </>
        )}

        <div className="flex justify-center">
          <Badge variant={progress.isOnTrack ? 'default' : 'secondary'}>
            {isAtTarget ? '🎯 Target Achieved!' : 
             progress.isOnTrack ? '✅ On Track' : '⚠️ Adjust Goals'}
          </Badge>
        </div>

        {!isLogging ? (
          <Button 
            onClick={() => setIsLogging(true)} 
            className="w-full"
            variant="outline"
          >
            Log New Weight
          </Button>
        ) : (
          <form onSubmit={handleLogWeight} className="space-y-3">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Enter your current weight"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="How are you feeling? Any observations?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || !newWeight}>
                {isSubmitting ? 'Logging...' : 'Log Weight'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsLogging(false);
                  setNewWeight('');
                  setNotes('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}