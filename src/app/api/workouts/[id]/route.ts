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

    const { id: workoutId } = await params;
    const { weight, reps, notes } = await request.json();

    if (!weight || !reps || weight <= 0 || reps <= 0) {
      return NextResponse.json(
        { error: 'Valid weight and reps are required' },
        { status: 400 }
      );
    }

    // First, verify the workout belongs to the current user
    const { data: workout, error: fetchError } = await supabaseAdmin
      .from('workouts')
      .select('user_id')
      .eq('id', workoutId)
      .single();

    if (fetchError || !workout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    if (workout.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this workout' },
        { status: 403 }
      );
    }

    // Update the workout
    const { data: updatedWorkout, error: updateError } = await supabaseAdmin
      .from('workouts')
      .update({
        weight: parseFloat(weight),
        reps: parseInt(reps),
        notes: notes || null,
      })
      .eq('id', workoutId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedWorkout);
  } catch (error) {
    console.error('Update workout error:', error);
    return NextResponse.json(
      { error: 'Failed to update workout' },
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

    const { id: workoutId } = await params;

    // First, verify the workout belongs to the current user
    const { data: workout, error: fetchError } = await supabaseAdmin
      .from('workouts')
      .select('user_id')
      .eq('id', workoutId)
      .single();

    if (fetchError || !workout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    if (workout.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this workout' },
        { status: 403 }
      );
    }

    // Delete the workout
    const { error: deleteError } = await supabaseAdmin
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    );
  }
}