import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/auth';
import { auditLog } from '@/lib/audit';

const verifySchema = z.object({
  bookingId: z.string().uuid(),
  etaMinutes: z.number().int().positive().optional(),
  etaNote: z.string().max(255).optional(),
  referralOverrideFee: z.number().positive().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifySchema.parse(body);
    const supabase = getSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check admin role
    const role = userData.user.user_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Get booking details
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('id, performer_id, deposit_amount, payment_status')
      .eq('id', parsed.bookingId)
      .single();
    if (bookingError || !bookingData) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (bookingData.payment_status === 'deposit_paid') {
      return NextResponse.json({ error: 'Deposit already paid' }, { status: 400 });
    }
    // Update booking payment status and eta fields
    const { data: updateData, error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'deposit_paid',
        deposit_pending_review: false,
        deposit_paid_at: new Date().toISOString(),
        eta_minutes: parsed.etaMinutes ?? null,
        eta_note: parsed.etaNote ?? null
      })
      .eq('id', parsed.bookingId)
      .select('id, performer_id, deposit_amount')
      .single();
    if (updateError || !updateData) {
      return NextResponse.json({ error: updateError?.message ?? 'Failed to update booking' }, { status: 500 });
    }
    // Create referral row if applicable
    const referralPercentage = Number(process.env.REFERRAL_PERCENTAGE ?? '10');
    const calculatedFee = Number(((updateData.deposit_amount * referralPercentage) / 100).toFixed(2));
    const feeToUse = parsed.referralOverrideFee ?? calculatedFee;
    // Only create referral if fee > 0
    let referralData = null;
    if (feeToUse > 0) {
      const { data: referralInsert, error: referralError } = await supabase
        .from('referrals')
        .insert({
          booking_id: parsed.bookingId,
          performer_id: updateData.performer_id,
          fee: calculatedFee,
          override_fee: parsed.referralOverrideFee ?? null,
          status: 'pending'
        })
        .select()
        .single();
      if (!referralError) {
        referralData = referralInsert;
      }
    }
    // Audit log
    await auditLog({
      actorId: userData.user.id,
      action: 'verify_payid',
      targetTable: 'bookings',
      targetId: parsed.bookingId,
      metadata: { etaMinutes: parsed.etaMinutes, etaNote: parsed.etaNote, referralFee: feeToUse }
    });
    return NextResponse.json({ booking: updateData, referral: referralData }, { status: 200 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}