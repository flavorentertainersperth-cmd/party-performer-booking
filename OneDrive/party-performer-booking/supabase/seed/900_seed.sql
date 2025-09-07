--
-- 900_seed.sql
-- Seed initial data for the performer booking platform. Designed to be idempotent.

-- Seed services
INSERT INTO public.services (id, name, rate, unit, description)
VALUES
  (gen_random_uuid(), 'DJ', 200.00, 'hour', 'Disc jockey performance'),
  (gen_random_uuid(), 'Singer', 250.00, 'hour', 'Live singing performance'),
  (gen_random_uuid(), 'Dancer', 150.00, 'hour', 'Choreographed dance routine'),
  (gen_random_uuid(), 'Magician', 300.00, 'hour', 'Magic show'),
  (gen_random_uuid(), 'Fire Breather', 350.00, 'hour', 'Fire breathing act'),
  (gen_random_uuid(), 'Acrobat', 280.00, 'hour', 'Acrobatic performance'),
  (gen_random_uuid(), 'Comedian', 220.00, 'hour', 'Stand-up comedy'),
  (gen_random_uuid(), 'MC', 180.00, 'hour', 'Master of ceremonies'),
  (gen_random_uuid(), 'Bartender', 120.00, 'hour', 'Mixology service'),
  (gen_random_uuid(), 'Face Painter', 100.00, 'hour', 'Face painting for events'),
  (gen_random_uuid(), 'Photographer', 200.00, 'hour', 'Event photography'),
  (gen_random_uuid(), 'Videographer', 220.00, 'hour', 'Event videography'),
  (gen_random_uuid(), 'Clown', 130.00, 'hour', 'Clowning performance'),
  (gen_random_uuid(), 'Stilt Walker', 160.00, 'hour', 'Stilt walking act'),
  (gen_random_uuid(), 'Drummer', 210.00, 'hour', 'Live drumming')
ON CONFLICT DO NOTHING;

-- Seed users, profiles, performers and clients
-- We'll generate 50 performers and 20 clients with deterministic ids.
DO
$$
DECLARE
  i INTEGER;
  u_id UUID;
BEGIN
  FOR i IN 1..50 LOOP
    u_id := md5(('performer_' || i)::text)::uuid;
    -- Insert into auth.users
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, phone, confirmed_at, app_metadata, user_metadata, created_at, updated_at)
    VALUES (u_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', concat('performer', i, '@example.com'), crypt('password', gen_salt('bf')), now(), NULL, now(), '{"provider":"email"}', '{"role":"performer"}', now(), now())
    ON CONFLICT (id) DO NOTHING;
    -- Insert profile
    INSERT INTO public.profiles (id, role, display_name, phone_number)
    VALUES (u_id, 'performer', concat('Performer ', i), '040000000' || i)
    ON CONFLICT (id) DO NOTHING;
    -- Insert performer
    INSERT INTO public.performers (id, stage_name, availability_status, bio, photo_url)
    VALUES (u_id, concat('Stage Performer ', i), 'available', concat('Biography for performer ', i), NULL)
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
  FOR i IN 1..20 LOOP
    u_id := md5(('client_' || i)::text)::uuid;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, phone, confirmed_at, app_metadata, user_metadata, created_at, updated_at)
    VALUES (u_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', concat('client', i, '@example.com'), crypt('password', gen_salt('bf')), now(), NULL, now(), '{"provider":"email"}', '{"role":"client"}', now(), now())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.profiles (id, role, display_name, phone_number)
    VALUES (u_id, 'client', concat('Client ', i), '041100000' || i)
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.clients (id)
    VALUES (u_id)
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END;
$$;

-- Seed performer_services associations randomly
INSERT INTO public.performer_services (performer_id, service_id, rate_override)
SELECT p.id, s.id, NULL
FROM public.performers p
JOIN public.services s ON s.id IN (SELECT id FROM public.services LIMIT 5) -- assign first five services to each performer
ON CONFLICT (performer_id, service_id) DO NOTHING;

-- Seed bookings with varied statuses
DO
$$
DECLARE
  booking_id UUID;
  performer UUID;
  client UUID;
  service UUID;
  i INTEGER;
  rate NUMERIC(10,2);
  deposit NUMERIC(10,2);
  dep_percent NUMERIC(5,2) := (select COALESCE(NULLIF(current_setting('app.deposit_percentage', true), '')::numeric, 30)::numeric);
BEGIN
  -- We'll create 25 bookings
  FOR i IN 1..25 LOOP
    -- pick performer and client deterministically
    performer := md5(('performer_' || ((i % 50) + 1))::text)::uuid;
    client := md5(('client_' || ((i % 20) + 1))::text)::uuid;
    -- pick service
    SELECT rate INTO rate FROM public.services LIMIT 1 OFFSET (i % 15);
    SELECT id INTO service FROM public.services LIMIT 1 OFFSET (i % 15);
    deposit := (rate * 0.30);
    booking_id := gen_random_uuid();
    INSERT INTO public.bookings (id, performer_id, client_id, service_id, event_datetime, deposit_amount, deposit_pending_review, payment_status, booking_status)
    VALUES (booking_id, performer, client, service, now() + (i || ' days')::interval, deposit, false,
      CASE WHEN i % 5 = 0 THEN 'deposit_paid' WHEN i % 3 = 0 THEN 'deposit_pending_review' ELSE 'pending' END,
      CASE WHEN i % 4 = 0 THEN 'approved' WHEN i % 6 = 0 THEN 'declined' ELSE 'pending' END)
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END;
$$;

-- Seed vetting applications for some performers
INSERT INTO public.vetting_applications (id, performer_id, status, application_data)
SELECT gen_random_uuid(), p.id, 'pending', '{"portfolio":"http://example.com/portfolio"}'::jsonb
FROM public.performers p
WHERE p.id IN (SELECT id FROM public.performers LIMIT 12)
ON CONFLICT DO NOTHING;

-- Seed blacklist entries
INSERT INTO public.blacklist (entity_type, entity_id, reason)
VALUES
  ('performer', (SELECT id FROM public.performers OFFSET 1 LIMIT 1)::text, 'Breached contract'),
  ('client', (SELECT id FROM public.clients OFFSET 2 LIMIT 1)::text, 'No-show'),
  ('phone', '+61412345678', 'Spam'),
  ('email', 'banned@example.com', 'Fraud'),
  ('ip', '203.0.113.42', 'Abuse')
ON CONFLICT DO NOTHING;

-- Seed a few referral records for demonstration
INSERT INTO public.referrals (booking_id, performer_id, fee, status)
SELECT b.id, b.performer_id, b.deposit_amount * 0.10, 'pending'
FROM public.bookings b
WHERE b.id IN (SELECT id FROM public.bookings LIMIT 5)
ON CONFLICT DO NOTHING;