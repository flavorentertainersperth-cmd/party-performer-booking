import { createServerComponentClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient()
})

export async function getUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = createServerSupabaseClient()
  const user = await getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function requireRole(role: 'admin' | 'performer' | 'client') {
  const profile = await getUserProfile()
  if (!profile || profile.role !== role) {
    redirect('/unauthorized')
  }
  return profile
}

export async function requireAdmin() {
  return requireRole('admin')
}

export async function requirePerformer() {
  return requireRole('performer')
}

export async function requireClient() {
  return requireRole('client')
}

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

// Utility functions for checking permissions
export async function canManageApplication(applicationId: string) {
  const profile = await getUserProfile()
  if (!profile) return false

  if (profile.role === 'admin') return true

  const supabase = createServerSupabaseClient()
  const { data: application } = await supabase
    .from('vetting_applications')
    .select('user_id')
    .eq('id', applicationId)
    .single()

  return application?.user_id === profile.id
}

export async function canManageBooking(bookingId: string) {
  const profile = await getUserProfile()
  if (!profile) return false

  if (profile.role === 'admin') return true

  const supabase = createServerSupabaseClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      client_id,
      performer:performers!inner(user_id)
    `)
    .eq('id', bookingId)
    .single()

  return (
    booking?.client_id === profile.id ||
    booking?.performer?.user_id === profile.id
  )
}

export async function canViewPayment(paymentId: string) {
  const profile = await getUserProfile()
  if (!profile) return false

  if (profile.role === 'admin') return true

  const supabase = createServerSupabaseClient()
  const { data: payment } = await supabase
    .from('payments')
    .select(`
      booking:bookings!inner(
        client_id,
        performer:performers!inner(user_id)
      )
    `)
    .eq('id', paymentId)
    .single()

  return (
    payment?.booking?.client_id === profile.id ||
    payment?.booking?.performer?.user_id === profile.id
  )
}