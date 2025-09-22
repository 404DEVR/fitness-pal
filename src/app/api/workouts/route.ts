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
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseAdmin
      .from('workout_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (workoutName) {
      query = query.eq('workout_name', workoutName);
    }

    const { data: workoutSessions, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(workoutSessions);
  } catch (error) {
    console.error('Get workout sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workout_name, exercises, notes, duration_minutes } = await request.json();

    if (!workout_name || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: 'Workout name and exercises are required' },
        { status: 400 }
      );
    }

    // Validate exercises data
    for (const exercise of exercises) {
      if (!exercise.name || !exercise.sets || !Array.isArray(exercise.sets) || exercise.sets.length === 0) {
        return NextResponse.json(
          { error: 'Each exercise must have a name and at least one set' },
          { status: 400 }
        );
      }

      for (const set of exercise.sets) {
        if (!set.weight || !set.reps || set.weight <= 0 || set.reps <= 0) {
          return NextResponse.json(
            { error: 'All sets must have valid weight and reps' },
            { status: 400 }
          );
        }
      }
    }

    // Insert workout session as a single row
    const workoutSessionData = {
      user_id: session.user.id,
      workout_name,
      exercises,
      notes: notes || null,
      duration_minutes: duration_minutes || null,
    };

    const { data: savedWorkoutSession, error } = await supabaseAdmin
      .from('workout_sessions')
      .insert(workoutSessionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Workout session saved successfully',
      workoutSession: savedWorkoutSession
    });
  } catch (error) {
    console.error('Create workout session error:', error);
    return NextResponse.json(
      { error: 'Failed to save workout session' },
      { status: 500 }
    );
  }
}