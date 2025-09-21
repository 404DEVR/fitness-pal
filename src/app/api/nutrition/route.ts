import { NextRequest, NextResponse } from 'next/server';
import { getNutritionInfo } from '@/lib/nutrition';

export async function POST(request: NextRequest) {
  try {
    const { foodDescription } = await request.json();

    if (!foodDescription) {
      return NextResponse.json(
        { error: 'Food description is required' },
        { status: 400 }
      );
    }

    const nutrition = await getNutritionInfo(foodDescription);

    return NextResponse.json(nutrition);
  } catch (error) {
    console.error('Nutrition API error:', error);
    return NextResponse.json(
      { error: 'Failed to get nutrition information' },
      { status: 500 }
    );
  }
}