import { NextRequest, NextResponse } from 'next/server';
import { validatePayID } from '@/lib/services/payid';

export async function POST(request: NextRequest) {
  try {
    const { payidIdentifier } = await request.json();

    if (!payidIdentifier) {
      return NextResponse.json(
        { error: 'PayID identifier required' },
        { status: 400 }
      );
    }

    const validation = await validatePayID(payidIdentifier);

    return NextResponse.json({
      success: validation.isValid,
      ...validation
    });

  } catch (error: any) {
    console.error('PayID validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}