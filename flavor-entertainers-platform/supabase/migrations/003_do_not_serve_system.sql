-- Do Not Serve System Migration
-- Adds safety and protection features for performers

-- Create report type enum
CREATE TYPE report_type AS ENUM (
  'inappropriate_behavior',
  'non_payment',
  'safety_concern',
  'harassment',
  'boundary_violation',
  'intoxication',
  'other'
);

-- Create report status enum
CREATE TYPE report_status AS ENUM (
  'pending',
  'under_review',
  'verified',
  'dismissed',
  'resolved'
);

-- Create Do Not Serve registry table
CREATE TABLE public.do_not_serve_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  reported_by UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  report_type report_type NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE,
  description TEXT NOT NULL,
  evidence_urls JSONB DEFAULT '[]',
  severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 5) DEFAULT 3,
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incident reports table (for tracking specific incidents)
CREATE TABLE public.incident_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dns_entry_id UUID REFERENCES public.do_not_serve_registry(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  incident_type report_type NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location_details TEXT,
  witness_information TEXT,
  description TEXT NOT NULL,
  evidence_files JSONB DEFAULT '[]',
  police_report_filed BOOLEAN DEFAULT false,
  police_report_number TEXT,
  medical_attention_required BOOLEAN DEFAULT false,
  immediate_action_taken TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  status report_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safety alerts table
CREATE TABLE public.safety_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 5) DEFAULT 2,
  target_audience TEXT[] DEFAULT ARRAY['performers'], -- performers, clients, admins
  location_specific TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performer safety preferences table
CREATE TABLE public.performer_safety_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE NOT NULL,
  enable_dns_notifications BOOLEAN DEFAULT true,
  enable_safety_alerts BOOLEAN DEFAULT true,
  enable_location_sharing BOOLEAN DEFAULT false,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  safety_check_interval INTEGER DEFAULT 60, -- minutes
  auto_check_in_required BOOLEAN DEFAULT false,
  blocked_areas JSONB DEFAULT '[]',
  preferred_venues JSONB DEFAULT '[]',
  safety_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(performer_id)
);

-- Create performer check-ins table (for safety tracking)
CREATE TABLE public.performer_check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  check_in_type TEXT NOT NULL, -- arrival, departure, safety_check, emergency
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  notes TEXT,
  is_safe BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_dns_registry_client_email ON public.do_not_serve_registry(client_email);
CREATE INDEX idx_dns_registry_status ON public.do_not_serve_registry(status);
CREATE INDEX idx_dns_registry_active ON public.do_not_serve_registry(is_active);
CREATE INDEX idx_dns_registry_severity ON public.do_not_serve_registry(severity_level);
CREATE INDEX idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX idx_incident_reports_type ON public.incident_reports(incident_type);
CREATE INDEX idx_safety_alerts_active ON public.safety_alerts(is_active);
CREATE INDEX idx_safety_alerts_audience ON public.safety_alerts USING GIN(target_audience);
CREATE INDEX idx_performer_checkins_performer ON public.performer_check_ins(performer_id);
CREATE INDEX idx_performer_checkins_booking ON public.performer_check_ins(booking_id);

-- Enable RLS
ALTER TABLE public.do_not_serve_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performer_safety_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performer_check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Do Not Serve registry
CREATE POLICY "Performers can view DNS entries" ON public.do_not_serve_registry
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.performers p ON u.id = p.user_id
      WHERE u.id = auth.uid() AND u.role = 'performer'
    )
  );

CREATE POLICY "Performers can create DNS entries" ON public.do_not_serve_registry
  FOR INSERT WITH CHECK (
    reported_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.performers p ON u.id = p.user_id
      WHERE u.id = auth.uid() AND u.role = 'performer'
    )
  );

CREATE POLICY "Admins can manage all DNS entries" ON public.do_not_serve_registry
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for incident reports
CREATE POLICY "Users can view their own incident reports" ON public.incident_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Performers can create incident reports" ON public.incident_reports
  FOR INSERT WITH CHECK (
    reporter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.performers p ON u.id = p.user_id
      WHERE u.id = auth.uid() AND u.role = 'performer'
    )
  );

CREATE POLICY "Admins can manage all incident reports" ON public.incident_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for safety alerts
CREATE POLICY "All users can view active safety alerts" ON public.safety_alerts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage safety alerts" ON public.safety_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for performer safety preferences
CREATE POLICY "Performers can manage their own safety preferences" ON public.performer_safety_preferences
  FOR ALL USING (
    performer_id IN (
      SELECT id FROM public.performers
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for performer check-ins
CREATE POLICY "Performers can manage their own check-ins" ON public.performer_check_ins
  FOR ALL USING (
    performer_id IN (
      SELECT id FROM public.performers
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all check-ins" ON public.performer_check_ins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at triggers
CREATE TRIGGER set_timestamp_dns_registry
  BEFORE UPDATE ON public.do_not_serve_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_incident_reports
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_safety_alerts
  BEFORE UPDATE ON public.safety_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_performer_safety_preferences
  BEFORE UPDATE ON public.performer_safety_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if client is on DNS registry
CREATE OR REPLACE FUNCTION check_dns_status(client_email_input TEXT)
RETURNS TABLE (
  is_listed BOOLEAN,
  entry_count INTEGER,
  highest_severity INTEGER,
  latest_incident TIMESTAMP WITH TIME ZONE,
  active_reports INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE WHEN COUNT(*) > 0 THEN true ELSE false END as is_listed,
    COUNT(*)::INTEGER as entry_count,
    COALESCE(MAX(severity_level), 0)::INTEGER as highest_severity,
    MAX(incident_date) as latest_incident,
    COUNT(CASE WHEN status IN ('pending', 'under_review', 'verified') THEN 1 END)::INTEGER as active_reports
  FROM public.do_not_serve_registry
  WHERE client_email = client_email_input
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get safety statistics
CREATE OR REPLACE FUNCTION get_safety_statistics()
RETURNS TABLE (
  total_dns_entries INTEGER,
  active_dns_entries INTEGER,
  pending_reports INTEGER,
  this_month_incidents INTEGER,
  high_severity_cases INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.do_not_serve_registry) as total_dns_entries,
    (SELECT COUNT(*)::INTEGER FROM public.do_not_serve_registry WHERE is_active = true) as active_dns_entries,
    (SELECT COUNT(*)::INTEGER FROM public.incident_reports WHERE status = 'pending') as pending_reports,
    (SELECT COUNT(*)::INTEGER FROM public.incident_reports
     WHERE created_at >= DATE_TRUNC('month', NOW())) as this_month_incidents,
    (SELECT COUNT(*)::INTEGER FROM public.do_not_serve_registry
     WHERE severity_level >= 4 AND is_active = true) as high_severity_cases;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.do_not_serve_registry TO authenticated;
GRANT SELECT ON public.incident_reports TO authenticated;
GRANT SELECT ON public.safety_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION check_dns_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_safety_statistics TO authenticated;