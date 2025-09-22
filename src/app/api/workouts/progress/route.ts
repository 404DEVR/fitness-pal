import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workoutName = searchParams.get('workout');
    const exerciseName = searchParams.get('exercise');

    if (!workoutName) {
      return NextResponse.json(
        { error: 'Workout name is required' },
        { status: 400 }
      );
    }

    // Get workout sessions for progress tracking
    const { data: workoutSessions, error } = await supabaseAdmin
      .from('workout_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('workout_name', workoutName)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Process progress data from workout sessions
    const progressData = workoutSessions.map(session => {
      const date = new Date(session.created_at).toISOString().split('T')[0];
      
      let sessionData: any = {
        date,
        sessionId: session.id,
        totalVolume: 0,
        maxWeight: 0,
        totalReps: 0,
        exercises: [],
      };

      // Process each exercise in the session
      session.exercises.forEach((exercise: any) => {
        // If specific exercise requested, filter for it
        if (exerciseName && exercise.name !== exerciseName) {
          return;
        }

        let exerciseVolume = 0;
        let exerciseMaxWeight = 0;
        let exerciseTotalReps = 0;

        exercise.sets.forEach((set: any) => {
          exerciseVolume += set.weight * set.reps;
          exerciseMaxWeight = Math.max(exerciseMaxWeight, set.weight);
          exerciseTotalReps += set.reps;
        });

        sessionData.totalVolume += exerciseVolume;
        sessionData.maxWeight = Math.max(sessionData.maxWeight, exerciseMaxWeight);
        sessionData.totalReps += exerciseTotalReps;

        sessionData.exercises.push({
          name: exercise.name,
          sets: exercise.sets,
          volume: exerciseVolume,
          maxWeight: exerciseMaxWeight,
          totalReps: exerciseTotalReps,
        });
      });

      return sessionData;
    }).filter(session => 
      // If specific exercise requested, only include sessions that have it
      !exerciseName || session.exercises.length > 0
    );

    return NextResponse.json({
      workout_name: workoutName,
      exercise_name: exerciseName || null,
      progress: progressData,
      totalSessions: progressData.length,
    });
  } catch (error) {
    console.error('Get workout progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout progress' },
      { status: 500 }
    );
  }
}