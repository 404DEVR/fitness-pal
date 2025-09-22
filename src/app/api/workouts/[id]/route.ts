import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workoutSessionId } = await params;
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

    // First, verify the workout session belongs to the current user
    const { data: workoutSession, error: fetchError } = await supabaseAdmin
      .from('workout_sessions')
      .select('user_id')
      .eq('id', workoutSessionId)
      .single();

    if (fetchError || !workoutSession) {
      return NextResponse.json(
        { error: 'Workout session not found' },
        { status: 404 }
      );
    }

    if (workoutSession.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this workout session' },
        { status: 403 }
      );
    }

    // Update the workout session
    const { data: updatedWorkoutSession, error: updateError } = await supabaseAdmin
      .from('workout_sessions')
      .update({
        workout_name,
        exercises,
        notes: notes || null,
        duration_minutes: duration_minutes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workoutSessionId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedWorkoutSession);
  } catch (error) {
    console.error('Update workout session error:', error);
    return NextResponse.json(
      { error: 'Failed to update workout session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workoutSessionId } = await params;

    // First, verify the workout session belongs to the current user
    const { data: workoutSession, error: fetchError } = await supabaseAdmin
      .from('workout_sessions')
      .select('user_id')
      .eq('id', workoutSessionId)
      .single();

    if (fetchError || !workoutSession) {
      return NextResponse.json(
        { error: 'Workout session not found' },
        { status: 404 }
      );
    }

    if (workoutSession.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this workout session' },
        { status: 403 }
      );
    }

    // Delete the workout session
    const { error: deleteError } = await supabaseAdmin
      .from('workout_sessions')
      .delete()
      .eq('id', workoutSessionId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: 'Workout session deleted successfully' });
  } catch (error) {
    console.error('Delete workout session error:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout session' },
      { status: 500 }
    );
  }
}