import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/auth';
import { auditLog } from '@/lib/audit';

const decisionSchema = z.object({
  bookingId: z.string().uuid(),
  decision: z.enum(['approved', 'declined'])
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = decisionSchema.parse(body);
    const supabase = getSupabaseServerClient();
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const performerId = userData.user.id;
    // Check booking belongs to performer
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('id, performer_id, booking_status')
      .eq('id', parsed.bookingId)
      .single();
    if (bookingError || !bookingData) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (bookingData.performer_id !== performerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Update booking status
    const { data: updateData, error: updateError } = await supabase
      .from('bookings')
      .update({ booking_status: parsed.decision })
      .eq('id', parsed.bookingId)
      .select('id, booking_status')
      .single();
    if (updateError || !updateData) {
      return NextResponse.json({ error: updateError?.message ?? 'Failed to update booking' }, { status: 500 });
    }
    // Audit
    await auditLog({
      actorId: performerId,
      action: 'booking_decision',
      targetTable: 'bookings',
      targetId: parsed.bookingId,
      metadata: { decision: parsed.decision }
    });
    return NextResponse.json(updateData, { status: 200 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}