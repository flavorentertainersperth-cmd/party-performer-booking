-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'performer', 'client');
CREATE TYPE application_status AS ENUM ('pending', 'needs_review', 'approved', 'rejected', 'expired');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'disputed');
CREATE TYPE payment_method AS ENUM ('payid', 'bank_transfer', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'client',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  profile_picture_url TEXT,
  organization_id UUID,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Vetting applications table
CREATE TABLE public.vetting_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  location TEXT NOT NULL,
  performance_type TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  portfolio_urls JSONB DEFAULT '[]',
  documents JSONB DEFAULT '{}',
  status application_status DEFAULT 'pending',
  reviewer_id UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  approval_notes TEXT,
  background_check_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performers table (approved applications)
CREATE TABLE public.performers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.vetting_applications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stage_name TEXT NOT NULL,
  bio TEXT,
  performance_types JSONB DEFAULT '[]',
  service_areas JSONB DEFAULT '[]',
  base_rate DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  availability_calendar JSONB DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  social_media_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours INTEGER NOT NULL,
  location JSONB NOT NULL,
  guest_count INTEGER,
  age_group TEXT,
  special_requirements TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  status booking_status DEFAULT 'pending',
  booking_reference TEXT UNIQUE NOT NULL,
  contract_signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  payid_transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AUD',
  payment_method payment_method NOT NULL,
  payid_identifier TEXT,
  status payment_status DEFAULT 'pending',
  proof_of_payment_url TEXT,
  confirmed_by UUID REFERENCES public.users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  response TEXT,
  response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id UUID,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_vetting_applications_status ON public.vetting_applications(status);
CREATE INDEX idx_vetting_applications_user_id ON public.vetting_applications(user_id);
CREATE INDEX idx_performers_user_id ON public.performers(user_id);
CREATE INDEX idx_performers_featured ON public.performers(featured);
CREATE INDEX idx_performers_rating ON public.performers(rating);
CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_bookings_performer_id ON public.bookings(performer_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_reviews_performer_id ON public.reviews(performer_id);
CREATE INDEX idx_messages_booking_id ON public.messages(booking_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vetting_applications_updated_at BEFORE UPDATE ON public.vetting_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performers_updated_at BEFORE UPDATE ON public.performers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'FE-';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update performer rating
CREATE OR REPLACE FUNCTION update_performer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.performers
  SET
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE performer_id = NEW.performer_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE performer_id = NEW.performer_id
    )
  WHERE id = NEW.performer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_performer_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_performer_rating();

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetting_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Vetting applications policies
CREATE POLICY "Users can view their own applications" ON public.vetting_applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own applications" ON public.vetting_applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their pending applications" ON public.vetting_applications FOR UPDATE USING (
  user_id = auth.uid() AND status = 'pending'
);
CREATE POLICY "Admins can view all applications" ON public.vetting_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Performers policies
CREATE POLICY "Anyone can view approved performers" ON public.performers FOR SELECT USING (true);
CREATE POLICY "Performers can update their own profile" ON public.performers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all performers" ON public.performers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (
  client_id = auth.uid() OR
  performer_id IN (SELECT id FROM public.performers WHERE user_id = auth.uid())
);
CREATE POLICY "Clients can create bookings" ON public.bookings FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (
  client_id = auth.uid() OR
  performer_id IN (SELECT id FROM public.performers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Payments policies
CREATE POLICY "Users can view payments for their bookings" ON public.payments FOR SELECT USING (
  booking_id IN (
    SELECT id FROM public.bookings
    WHERE client_id = auth.uid() OR
    performer_id IN (SELECT id FROM public.performers WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for their bookings" ON public.reviews FOR INSERT WITH CHECK (
  client_id = auth.uid() AND
  booking_id IN (SELECT id FROM public.bookings WHERE client_id = auth.uid())
);
CREATE POLICY "Performers can respond to their reviews" ON public.reviews FOR UPDATE USING (
  performer_id IN (SELECT id FROM public.performers WHERE user_id = auth.uid())
);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default admin user (will be created after auth user is created)
-- This should be run after the first admin signs up through the auth system