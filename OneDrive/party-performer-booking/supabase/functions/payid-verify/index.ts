import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// This function simulates verifying a PayID deposit. After basic checks, it marks the booking as deposit_paid.
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'Missing bookingId' }), { status: 400 });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const client = createClient(supabaseUrl, serviceRoleKey);
    // Mark booking as deposit_paid
    const { data, error } = await client
      .from('bookings')
      .update({ payment_status: 'deposit_paid', deposit_pending_review: false, deposit_paid_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select('id, performer_id, deposit_amount')
      .single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    // Return success
    return new Response(JSON.stringify({ success: true, booking: data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});