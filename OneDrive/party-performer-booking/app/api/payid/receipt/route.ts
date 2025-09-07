import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/auth';
import { auditLog } from '@/lib/audit';

const receiptSchema = z.object({
  bookingId: z.string().uuid(),
  receiptUrl: z.string().url()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = receiptSchema.parse(body);
    const supabase = getSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Ensure client owns booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('id, client_id')
      .eq('id', parsed.bookingId)
      .single();
    if (bookingError || !bookingData) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (bookingData.client_id !== userData.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Update booking: deposit_pending_review = true, payment_status = deposit_pending_review
    const { data: updateData, error: updateError } = await supabase
      .from('bookings')
      .update({
        deposit_receipt_url: parsed.receiptUrl,
        deposit_pending_review: true,
        payment_status: 'deposit_pending_review'
      })
      .eq('id', parsed.bookingId)
      .select('id, payment_status, deposit_pending_review, deposit_receipt_url')
      .single();
    if (updateError || !updateData) {
      return NextResponse.json({ error: updateError?.message ?? 'Failed to update booking' }, { status: 500 });
    }
    await auditLog({
      actorId: userData.user.id,
      action: 'upload_receipt',
      targetTable: 'bookings',
      targetId: parsed.bookingId,
      metadata: { receiptUrl: parsed.receiptUrl }
    });
    return NextResponse.json(updateData, { status: 200 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}