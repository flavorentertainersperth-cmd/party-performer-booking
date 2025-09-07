--
-- 040_eta_referrals.sql
-- Add ETA fields and referral override capabilities. This file may run safely multiple times.

-- Add eta fields to bookings if missing
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS eta_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS eta_note TEXT;

-- Add override_fee and paid_at to referrals if missing
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS override_fee NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITHOUT TIME ZONE;

-- Add payment_status deposit_paid_at to bookings if missing
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMP WITHOUT TIME ZONE;