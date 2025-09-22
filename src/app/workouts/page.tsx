'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { WorkoutLogger } from '@/components/workouts/WorkoutLogger';
import { WorkoutProgress } from '@/components/workouts/WorkoutProgress';
import { TodaysWorkouts } from '@/components/workouts/TodaysWorkouts';
import { WorkoutSession } from '@/types';
import { Dumbbell } from 'lucide-react';

export default function WorkoutsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchTodaysWorkouts();
    }
  }, [status, router, refreshTrigger]);

  const fetchTodaysWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts?limit=50'); // Get recent workout sessions
      if (response.ok) {
        const sessions = await response.json();
        setWorkoutSessions(sessions);
      }
    } catch (error) {
      console.error('Failed to fetch workout sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkoutSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading workouts...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 lg:h-8 lg:w-8" />
            Workout Tracker
          </h1>
          <p className="text-muted-foreground">
            Log your workouts and track your progressive overload
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Workout Logger */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <WorkoutLogger onWorkoutSaved={handleWorkoutSaved} />
          </div>

          {/* Progress Charts */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            <WorkoutProgress refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Today's Workouts */}
        <TodaysWorkouts 
          workoutSessions={workoutSessions} 
          onWorkoutUpdated={handleWorkoutSaved}
        />
      </div>
    </div>
  );
}