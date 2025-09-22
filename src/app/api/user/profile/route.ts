import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from '@/lib/calculations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist yet, return basic info from session
      return NextResponse.json({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        // No profile data yet
      });
    }

    if (error) {
      throw error;
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData = await request.json();

    // Calculate nutrition targets if we have the required data
    let nutritionTargets = {};
    
    if (profileData.current_weight && profileData.height && profileData.age && 
        profileData.gender && profileData.activity_level && profileData.fitness_goal) {
      
      const bmr = calculateBMR(
        profileData.current_weight,
        profileData.height,
        profileData.age,
        profileData.gender
      );
      
      const tdee = calculateTDEE(bmr, profileData.activity_level);
      const targetCalories = calculateTargetCalories(
        tdee, 
        profileData.fitness_goal,
        profileData.current_weight,
        profileData.target_weight
      );
      const macros = calculateMacros(targetCalories, profileData.fitness_goal);
      
      nutritionTargets = {
        target_calories: targetCalories,
        target_protein: macros.protein,
        target_carbs: macros.carbs,
        target_fat: macros.fat,
      };
    }

    // First, check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    let user;
    let error;

    if (existingUser) {
      // User exists, update them
      const result = await supabaseAdmin
        .from('users')
        .update({
          ...profileData,
          ...nutritionTargets,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)
        .select()
        .single();
      
      user = result.data;
      error = result.error;
    } else {
      // User doesn't exist, create them (for Google OAuth users)
      const result = await supabaseAdmin
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          ...profileData,
          ...nutritionTargets,
        })
        .select()
        .single();
      
      user = result.data;
      error = result.error;
    }

    if (error) {
      throw error;
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}