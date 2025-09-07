import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/auth';
import { auditLog } from '@/lib/audit';

const markPaidSchema = z.object({
  referralId: z.string().uuid(),
  receiptUrl: z.string().url().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = markPaidSchema.parse(body);
    const supabase = getSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = userData.user.user_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { data: referralData, error: refError } = await supabase
      .from('referrals')
      .select('id, status')
      .eq('id', parsed.referralId)
      .single();
    if (refError || !referralData) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }
    if (referralData.status === 'paid') {
      return NextResponse.json({ error: 'Referral already paid' }, { status: 400 });
    }
    const { data: updateData, error: updateError } = await supabase
      .from('referrals')
      .update({ status: 'paid', paid_at: new Date().toISOString(), receipt_url: parsed.receiptUrl ?? null })
      .eq('id', parsed.referralId)
      .select('id, status, paid_at, receipt_url')
      .single();
    if (updateError || !updateData) {
      return NextResponse.json({ error: updateError?.message ?? 'Failed to update referral' }, { status: 500 });
    }
    await auditLog({
      actorId: userData.user.id,
      action: 'mark_referral_paid',
      targetTable: 'referrals',
      targetId: parsed.referralId,
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