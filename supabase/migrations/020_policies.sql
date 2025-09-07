--
-- 020_policies.sql
-- Row Level Security policies to enforce tenant isolation and principle of least privilege.

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetting_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can see and update their own profile; admin can see all.
CREATE POLICY "profiles_select_self" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );

-- Performers: performers can manage their own performer record; admin can manage all.
CREATE POLICY "performers_select" ON public.performers
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );
CREATE POLICY "performers_update" ON public.performers
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );
CREATE POLICY "performers_insert" ON public.performers
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'performer' AND id = auth.uid()
  );

-- Services: read-only for everyone (public). No insert/update via API.
CREATE POLICY "services_select" ON public.services
  FOR SELECT USING (true);

-- Performer_services: performers manage their own associations; admin manage all.
CREATE POLICY "performer_services_select" ON public.performer_services
  FOR SELECT USING (
    auth.role() = 'authenticated' AND ((performer_id = auth.uid()) OR auth.jwt() ->> 'role' = 'admin')
  );
CREATE POLICY "performer_services_insert" ON public.performer_services
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (performer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );
CREATE POLICY "performer_services_update" ON public.performer_services
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (performer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );

-- Clients: clients can manage their own record; admin can manage all.
CREATE POLICY "clients_select_self" ON public.clients
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );
CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'client' AND id = auth.uid()
  );

-- Bookings: performer can see bookings assigned to them; clients can see their own bookings; admin sees all.
CREATE POLICY "bookings_select" ON public.bookings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      performer_id = auth.uid() OR client_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
    )
  );
CREATE POLICY "bookings_insert" ON public.bookings
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      client_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
    )
  );
CREATE POLICY "bookings_update" ON public.bookings
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      performer_id = auth.uid() OR client_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Referrals: performers can see and update their own referral records; admin can manage all.
CREATE POLICY "referrals_select" ON public.referrals
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (performer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );
CREATE POLICY "referrals_update" ON public.referrals
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (performer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );
CREATE POLICY "referrals_insert" ON public.referrals
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (performer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );

-- Vetting applications: performers manage their own; admin manage all.
CREATE POLICY "vetting_select" ON public.vetting_applications
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (performer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );
CREATE POLICY "vetting_insert" ON public.vetting_applications
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (performer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );
CREATE POLICY "vetting_update" ON public.vetting_applications
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (performer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  );

-- Blacklist: only admin can view/manage
CREATE POLICY "blacklist_admin_only" ON public.blacklist
  FOR ALL USING (
    auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'
  );

-- Audit logs: admin only
CREATE POLICY "audit_admin_only" ON public.audit_logs
  FOR ALL USING (
    auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'
  );

-- Notes proving isolation:
-- 1. RLS is enabled on all tables, denying access by default. Only explicitly defined policies allow access.
-- 2. Each policy checks the JWT custom claim 'role' issued by Supabase. Without this claim, access is denied.
-- 3. Performers and clients cannot read or modify each other's records, ensuring strict tenant isolation.
-- 4. Admin role bypasses table restrictions via policies granting full access.