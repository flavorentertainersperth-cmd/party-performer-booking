import { cookies } from 'next/headers';
import { createServerClient, User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Helper to retrieve a Supabase auth client using server-side cookies
export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies
  });
}

export async function requireRole(role: 'admin' | 'performer' | 'client'): Promise<User> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Not authenticated');
  }
  const user = data.user;
  const userRole = user.user_metadata?.role;
  if (userRole !== role) {
    throw new Error('Access denied');
  }
  return user;
}