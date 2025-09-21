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
      .from('workouts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (workoutName) {
      query = query.eq('workout_name', workoutName);
    }

    const { data: workouts, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
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

    const { workout_name, sets, notes } = await request.json();

    if (!workout_name || !sets || !Array.isArray(sets) || sets.length === 0) {
      return NextResponse.json(
        { error: 'Workout name and sets are required' },
        { status: 400 }
      );
    }

    // Validate sets data
    for (const set of sets) {
      if (!set.weight || !set.reps || set.weight <= 0 || set.reps <= 0) {
        return NextResponse.json(
          { error: 'All sets must have valid weight and reps' },
          { status: 400 }
        );
      }
    }

    // Insert all sets for this workout session
    const workoutData = sets.map((set: any, index: number) => ({
      user_id: session.user.id,
      workout_name,
      set_number: index + 1,
      weight: parseFloat(set.weight),
      reps: parseInt(set.reps),
      notes: notes || null,
    }));

    const { data: savedWorkouts, error } = await supabaseAdmin
      .from('workouts')
      .insert(workoutData)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Workout saved successfully',
      workouts: savedWorkouts
    });
  } catch (error) {
    console.error('Create workout error:', error);
    return NextResponse.json(
      { error: 'Failed to save workout' },
      { status: 500 }
    );
  }
}