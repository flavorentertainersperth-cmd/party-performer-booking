--
-- 910_reset.sql
-- Reset database to a clean state. Use with caution in development only.

-- Drop rows from dependent tables first due to foreign key constraints
TRUNCATE TABLE public.audit_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.referrals RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.bookings RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vetting_applications RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.performer_services RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.performers RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.clients RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.profiles RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.services RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.blacklist RESTART IDENTITY CASCADE;

-- Remove seeded users from auth.users; keep superuser accounts intact by matching email pattern
DELETE FROM auth.users
WHERE email LIKE 'performer%' OR email LIKE 'client%';

-- Vacuum to reclaim space
VACUUM;