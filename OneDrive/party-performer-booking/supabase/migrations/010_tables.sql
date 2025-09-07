--
-- 010_tables.sql
-- Create core tables for the performer booking platform.

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles table extends auth.users with roles and contact info
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  display_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp()
);

-- Performers table contains performer-specific info
CREATE TABLE IF NOT EXISTS public.performers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  availability_status performer_availability NOT NULL DEFAULT 'unavailable',
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp()
);

-- Services are generic service types offered by performers
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rate NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp()
);

-- Association between performers and services. Allows override of rate.
CREATE TABLE IF NOT EXISTS public.performer_services (
  id SERIAL PRIMARY KEY,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  rate_override NUMERIC(10,2),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp(),
  UNIQUE (performer_id, service_id)
);

-- Clients table referencing auth.users
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp()
);

-- Bookings table linking performers, clients and services
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  deposit_amount NUMERIC(10,2) NOT NULL,
  deposit_pending_review BOOLEAN NOT NULL DEFAULT false,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  booking_status booking_status NOT NULL DEFAULT 'pending',
  deposit_receipt_url TEXT,
  deposit_paid_at TIMESTAMP WITHOUT TIME ZONE,
  eta_minutes INTEGER,
  eta_note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp()
);

-- Referrals table to track referral payouts
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE,
  fee NUMERIC(10,2) NOT NULL,
  override_fee NUMERIC(10,2),
  status referral_status NOT NULL DEFAULT 'pending',
  receipt_url TEXT,
  paid_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp()
);

-- Vetting applications table for performer vetting
CREATE TABLE IF NOT EXISTS public.vetting_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE,
  status vetting_status NOT NULL DEFAULT 'pending',
  application_data JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp()
);

-- Blacklist table for blocked entities
CREATE TABLE IF NOT EXISTS public.blacklist (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp()
);

-- Audit logs for tracking user actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id UUID,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT current_utc_timestamp()
);