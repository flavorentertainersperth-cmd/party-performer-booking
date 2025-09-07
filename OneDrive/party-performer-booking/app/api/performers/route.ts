import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/auth';

export async function GET(request: Request) {
  const supabase = getSupabaseServerClient();
  const url = new URL(request.url);
  const availability = url.searchParams.get('availability');
  try {
    let query = supabase
      .from('performers')
      .select('id, stage_name, availability_status');
    if (availability) {
      query = query.eq('availability_status', availability);
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}