import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/auth';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('services')
    .select('id, name, rate, unit')
    .order('name');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? [], { status: 200 });
}