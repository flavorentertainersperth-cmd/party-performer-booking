import { supabase } from '@/lib/supabaseClient';

/**
 * Writes an audit log entry to the `audit_logs` table.
 * Always catches and logs internal errors so that auditing does not break the application flow.
 */
export async function auditLog({
  actorId,
  action,
  targetTable,
  targetId,
  metadata
}: {
  actorId: string | null;
  action: string;
  targetTable: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabase.from('audit_logs').insert({
      actor_id: actorId,
      action,
      target_table: targetTable,
      target_id: targetId,
      metadata: metadata ?? {},
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to write audit log', err);
  }
}