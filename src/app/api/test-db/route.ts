import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Test basic connection
    const { data: basicTest, error: basicError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    // Test admin connection
    const { data: adminTest, error: adminError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    return NextResponse.json({
      message: 'Database connection test',
      basicConnection: {
        success: !basicError,
        error: basicError?.message || null,
        data: basicTest
      },
      adminConnection: {
        success: !adminError,
        error: adminError?.message || null,
        data: adminTest
      },
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}