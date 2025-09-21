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
    const limit = parseInt(searchParams.get('limit') || '30');

    const { data: weightLogs, error } = await supabaseAdmin
      .from('weight_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('logged_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json(weightLogs);
  } catch (error) {
    console.error('Get weight logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weight logs' },
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

    const { weight, notes } = await request.json();

    if (!weight || weight <= 0) {
      return NextResponse.json(
        { error: 'Valid weight is required' },
        { status: 400 }
      );
    }

    const { data: weightLog, error } = await supabaseAdmin
      .from('weight_logs')
      .insert({
        user_id: session.user.id,
        weight: parseFloat(weight),
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Also update the user's current weight
    await supabaseAdmin
      .from('users')
      .update({
        current_weight: parseFloat(weight),
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    return NextResponse.json(weightLog);
  } catch (error) {
    console.error('Create weight log error:', error);
    return NextResponse.json(
      { error: 'Failed to log weight' },
      { status: 500 }
    );
  }
}