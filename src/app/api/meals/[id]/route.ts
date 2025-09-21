import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: mealId } = await params;

    // First, verify the meal belongs to the current user
    const { data: meal, error: fetchError } = await supabaseAdmin
      .from('meals')
      .select('user_id')
      .eq('id', mealId)
      .single();

    if (fetchError || !meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    if (meal.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this meal' },
        { status: 403 }
      );
    }

    // Delete the meal
    const { error: deleteError } = await supabaseAdmin
      .from('meals')
      .delete()
      .eq('id', mealId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: mealId } = await params;
    const updateData = await request.json();

    // First, verify the meal belongs to the current user
    const { data: meal, error: fetchError } = await supabaseAdmin
      .from('meals')
      .select('user_id')
      .eq('id', mealId)
      .single();

    if (fetchError || !meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    if (meal.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this meal' },
        { status: 403 }
      );
    }

    // Update the meal
    const { data: updatedMeal, error: updateError } = await supabaseAdmin
      .from('meals')
      .update(updateData)
      .eq('id', mealId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedMeal);
  } catch (error) {
    console.error('Update meal error:', error);
    return NextResponse.json(
      { error: 'Failed to update meal' },
      { status: 500 }
    );
  }
}