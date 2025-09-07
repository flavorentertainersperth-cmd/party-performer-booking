--
-- 001_enums_and_helpers.sql
-- Create shared enums and helper functions.

-- Drop existing enums if they exist for idempotent re-run
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'performer_availability') THEN
    DROP TYPE performer_availability;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    DROP TYPE booking_status;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    DROP TYPE payment_status;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_status') THEN
    DROP TYPE referral_status;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vetting_status') THEN
    DROP TYPE vetting_status;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    DROP TYPE user_role;
  END IF;
END $$;

-- Create enums
CREATE TYPE performer_availability AS ENUM ('available', 'unavailable');
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'declined', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'deposit_pending_review', 'deposit_paid');
CREATE TYPE referral_status AS ENUM ('pending', 'paid');
CREATE TYPE vetting_status AS ENUM ('pending', 'approved', 'declined');
CREATE TYPE user_role AS ENUM ('admin', 'performer', 'client');

-- Helper function to get current UTC timestamp
CREATE OR REPLACE FUNCTION current_utc_timestamp()
RETURNS TIMESTAMP WITHOUT TIME ZONE AS $$
BEGIN
  RETURN (now() AT TIME ZONE 'utc');
END;
$$ LANGUAGE plpgsql;