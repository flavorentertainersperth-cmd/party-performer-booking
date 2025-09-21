import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  createPaymentRequest,
  updatePaymentStatus,
  validatePayID,
  createPayIDAccount,
  getUserPayIDAccounts
} from '@/lib/services/payid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create PayID payment request
export async function POST(request: NextRequest) {
  try {
    const { bookingId, payerId, recipientId, amount, description } = await request.json();

    if (!bookingId || !payerId || !recipientId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await createPaymentRequest({
      bookingId,
      payerId,
      recipientId,
      amount,
      description
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId
    });

  } catch (error: any) {
    console.error('PayID payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get PayID accounts for user
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const accounts = await getUserPayIDAccounts(userId);

    return NextResponse.json({
      success: true,
      accounts
    });

  } catch (error: any) {
    console.error('Get PayID accounts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}