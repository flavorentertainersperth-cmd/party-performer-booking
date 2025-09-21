import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const createClientComponentClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client
export const createServerComponentClient = () => {
  if (typeof window !== 'undefined') {
    // Client-side fallback
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  // This will be replaced in server components with proper cookie handling
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Admin client with service role key
export const createAdminClient = () =>
  createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'performer' | 'client'
          first_name: string | null
          last_name: string | null
          phone: string | null
          date_of_birth: string | null
          profile_picture_url: string | null
          organization_id: string | null
          email_verified: boolean
          phone_verified: boolean
          created_at: string
          updated_at: string
          metadata: any
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'performer' | 'client'
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          profile_picture_url?: string | null
          organization_id?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
          metadata?: any
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'performer' | 'client'
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          profile_picture_url?: string | null
          organization_id?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
          metadata?: any
        }
      }
      vetting_applications: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          phone: string
          date_of_birth: string
          location: string
          performance_type: string
          experience_years: number
          portfolio_urls: any
          documents: any
          status: 'pending' | 'needs_review' | 'approved' | 'rejected' | 'expired'
          reviewer_id: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          approval_notes: string | null
          background_check_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          phone: string
          date_of_birth: string
          location: string
          performance_type: string
          experience_years: number
          portfolio_urls?: any
          documents?: any
          status?: 'pending' | 'needs_review' | 'approved' | 'rejected' | 'expired'
          reviewer_id?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          approval_notes?: string | null
          background_check_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          phone?: string
          date_of_birth?: string
          location?: string
          performance_type?: string
          experience_years?: number
          portfolio_urls?: any
          documents?: any
          status?: 'pending' | 'needs_review' | 'approved' | 'rejected' | 'expired'
          reviewer_id?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          approval_notes?: string | null
          background_check_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      performers: {
        Row: {
          id: string
          application_id: string
          user_id: string
          stage_name: string
          bio: string | null
          performance_types: any
          service_areas: any
          base_rate: number | null
          hourly_rate: number | null
          availability_calendar: any
          rating: number | null
          total_reviews: number
          featured: boolean
          verified: boolean
          social_media_links: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          user_id: string
          stage_name: string
          bio?: string | null
          performance_types?: any
          service_areas?: any
          base_rate?: number | null
          hourly_rate?: number | null
          availability_calendar?: any
          rating?: number | null
          total_reviews?: number
          featured?: boolean
          verified?: boolean
          social_media_links?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          user_id?: string
          stage_name?: string
          bio?: string | null
          performance_types?: any
          service_areas?: any
          base_rate?: number | null
          hourly_rate?: number | null
          availability_calendar?: any
          rating?: number | null
          total_reviews?: number
          featured?: boolean
          verified?: boolean
          social_media_links?: any
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          performer_id: string
          event_type: string
          event_description: string | null
          event_date: string
          duration_hours: number
          location: any
          guest_count: number | null
          age_group: string | null
          special_requirements: string | null
          total_amount: number
          deposit_amount: number | null
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'disputed'
          booking_reference: string
          contract_signed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          performer_id: string
          event_type: string
          event_description?: string | null
          event_date: string
          duration_hours: number
          location: any
          guest_count?: number | null
          age_group?: string | null
          special_requirements?: string | null
          total_amount: number
          deposit_amount?: number | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'disputed'
          booking_reference: string
          contract_signed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          performer_id?: string
          event_type?: string
          event_description?: string | null
          event_date?: string
          duration_hours?: number
          location?: any
          guest_count?: number | null
          age_group?: string | null
          special_requirements?: string | null
          total_amount?: number
          deposit_amount?: number | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'disputed'
          booking_reference?: string
          contract_signed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          payid_transaction_id: string | null
          amount: number
          currency: string
          payment_method: 'payid' | 'bank_transfer' | 'cash'
          payid_identifier: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          proof_of_payment_url: string | null
          confirmed_by: string | null
          confirmed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          payid_transaction_id?: string | null
          amount: number
          currency?: string
          payment_method: 'payid' | 'bank_transfer' | 'cash'
          payid_identifier?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          proof_of_payment_url?: string | null
          confirmed_by?: string | null
          confirmed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          payid_transaction_id?: string | null
          amount?: number
          currency?: string
          payment_method?: 'payid' | 'bank_transfer' | 'cash'
          payid_identifier?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          proof_of_payment_url?: string | null
          confirmed_by?: string | null
          confirmed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          category: 'waitressing' | 'lap_dance' | 'strip_show'
          name: string
          description: string | null
          base_rate: number
          rate_type: 'per_hour' | 'flat_rate' | 'per_person'
          min_duration_minutes: number | null
          booking_notes: string | null
          is_private_only: boolean
          age_restricted: boolean
          requires_special_license: boolean
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: 'waitressing' | 'lap_dance' | 'strip_show'
          name: string
          description?: string | null
          base_rate: number
          rate_type?: 'per_hour' | 'flat_rate' | 'per_person'
          min_duration_minutes?: number | null
          booking_notes?: string | null
          is_private_only?: boolean
          age_restricted?: boolean
          requires_special_license?: boolean
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: 'waitressing' | 'lap_dance' | 'strip_show'
          name?: string
          description?: string | null
          base_rate?: number
          rate_type?: 'per_hour' | 'flat_rate' | 'per_person'
          min_duration_minutes?: number | null
          booking_notes?: string | null
          is_private_only?: boolean
          age_restricted?: boolean
          requires_special_license?: boolean
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      performer_services: {
        Row: {
          id: string
          performer_id: string
          service_id: string
          custom_rate: number | null
          is_available: boolean
          special_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          performer_id: string
          service_id: string
          custom_rate?: number | null
          is_available?: boolean
          special_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          performer_id?: string
          service_id?: string
          custom_rate?: number | null
          is_available?: boolean
          special_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}