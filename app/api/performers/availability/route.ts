import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/auth';
import { auditLog } from '@/lib/audit';

const availabilitySchema = z.object({
  availabilityStatus: z.enum(['available', 'unavailable'])
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = availabilitySchema.parse(body);
    const supabase = getSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const performerId = userData.user.id;
    const { data: updateData, error: updateError } = await supabase
      .from('performers')
      .update({ availability_status: parsed.availabilityStatus })
      .eq('id', performerId)
      .select('id, availability_status')
      .single();
    if (updateError || !updateData) {
      return NextResponse.json({ error: updateError?.message ?? 'Failed to update availability' }, { status: 500 });
    }
    await auditLog({
      actorId: performerId,
      action: 'toggle_availability',
      targetTable: 'performers',
      targetId: performerId,
      metadata: { status: parsed.availabilityStatus }
    });
    return NextResponse.json(updateData, { status: 200 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}