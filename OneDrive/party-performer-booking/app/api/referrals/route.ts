import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/auth';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const performerId = userData.user.id;
  const { data, error } = await supabase
    .from('referrals')
    .select('id, booking_id, fee, override_fee, status, paid_at, receipt_url')
    .eq('performer_id', performerId)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? [], { status: 200 });
}