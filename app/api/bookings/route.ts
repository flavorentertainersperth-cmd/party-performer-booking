import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/auth';
import { auditLog } from '@/lib/audit';

// Schema for booking creation
const createBookingSchema = z.object({
  performerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  eventDatetime: z.string(), // ISO string
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createBookingSchema.parse(body);
    const supabase = getSupabaseServerClient();
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clientId = userData.user.id;
    // Fetch service rate
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('rate')
      .eq('id', parsed.serviceId)
      .single();
    if (serviceError || !serviceData) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const depositPercentage = Number(process.env.DEPOSIT_PERCENTAGE ?? '30');
    const rate = Number(serviceData.rate);
    const depositAmount = Number(((rate * depositPercentage) / 100).toFixed(2));
    // Insert booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        performer_id: parsed.performerId,
        client_id: clientId,
        service_id: parsed.serviceId,
        event_datetime: parsed.eventDatetime,
        deposit_amount: depositAmount,
        payment_status: 'pending',
        booking_status: 'pending',
      })
      .select()
      .single();
    if (bookingError || !bookingData) {
      return NextResponse.json({ error: bookingError?.message ?? 'Failed to create booking' }, { status: 500 });
    }
    // Audit log
    await auditLog({
      actorId: clientId,
      action: 'create_booking',
      targetTable: 'bookings',
      targetId: bookingData.id,
      metadata: { performerId: parsed.performerId, serviceId: parsed.serviceId }
    });
    return NextResponse.json(bookingData, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Admin-only endpoint to list bookings. Clients/performers can view their own via RLS.
export async function GET(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = userData.user.user_metadata?.role;
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('paymentStatus');
  try {
    let query = supabase
      .from('bookings')
      .select('id, performer_id, client_id, service_id, event_datetime, deposit_amount, deposit_pending_review, payment_status, booking_status, eta_minutes, eta_note');
    if (statusFilter) {
      query = query.eq('payment_status', statusFilter);
    }
    // Non-admins get their own bookings only due to RLS
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}