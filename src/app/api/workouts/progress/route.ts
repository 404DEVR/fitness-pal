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

    if (!workoutName) {
      return NextResponse.json(
        { error: 'Workout name is required' },
        { status: 400 }
      );
    }

    // Get workout history for progress tracking
    const { data: workouts, error } = await supabaseAdmin
      .from('workouts')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('workout_name', workoutName)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Group by date and calculate metrics
    const progressData = workouts.reduce((acc: any, workout) => {
      const date = new Date(workout.created_at).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          maxWeight: 0,
          totalVolume: 0,
          totalReps: 0,
          sets: [],
        };
      }

      acc[date].maxWeight = Math.max(acc[date].maxWeight, workout.weight);
      acc[date].totalVolume += workout.weight * workout.reps;
      acc[date].totalReps += workout.reps;
      acc[date].sets.push({
        setNumber: workout.set_number,
        weight: workout.weight,
        reps: workout.reps,
      });

      return acc;
    }, {});

    // Convert to array and sort by date
    const progressArray = Object.values(progressData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      workout_name: workoutName,
      progress: progressArray,
      totalSessions: progressArray.length,
    });
  } catch (error) {
    console.error('Get workout progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout progress' },
      { status: 500 }
    );
  }
}