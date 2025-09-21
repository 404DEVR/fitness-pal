import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Supabase using admin client
    const { supabaseAdmin } = await import('@/lib/supabase');
    const { data: user, error: supabaseError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name,
        password_hash: hashedPassword,
      })
      .select()
      .single();

    if (supabaseError) {
      if (supabaseError.code === '23505') {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { error: 'Failed to create account' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      message: 'Account created successfully',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}