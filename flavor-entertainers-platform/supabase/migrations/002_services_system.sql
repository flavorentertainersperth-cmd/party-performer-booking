-- Services System Migration
-- Adds comprehensive services and categories for Flavor Entertainers Platform

-- Create service categories enum
CREATE TYPE service_category AS ENUM (
  'waitressing',
  'lap_dance',
  'strip_show'
);

-- Create rate type enum
CREATE TYPE rate_type AS ENUM (
  'per_hour',
  'flat_rate',
  'per_person'
);

-- Create services table
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category service_category NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_rate DECIMAL(10,2) NOT NULL,
  rate_type rate_type NOT NULL DEFAULT 'flat_rate',
  min_duration_minutes INTEGER,
  booking_notes TEXT,
  is_private_only BOOLEAN DEFAULT false,
  age_restricted BOOLEAN DEFAULT false,
  requires_special_license BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performer_services junction table
CREATE TABLE public.performer_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performer_id UUID NOT NULL REFERENCES public.performers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  custom_rate DECIMAL(10,2), -- Performer can override base rate
  is_available BOOLEAN DEFAULT true,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(performer_id, service_id)
);

-- Insert service categories and services
INSERT INTO public.services (category, name, description, base_rate, rate_type, min_duration_minutes, booking_notes, is_private_only, age_restricted) VALUES

-- Waitressing Services
('waitressing', 'Clothed (Public Bar)', 'Fully clothed. Suitable for licensed venues.', 35.00, 'per_hour', 60, 'Public bar service', false, false),
('waitressing', 'Skimpy (Public Bar)', 'Bikini or skimpy outfit service in public venues.', 50.00, 'per_hour', 60, 'Public bar service', false, true),
('waitressing', 'Clothed (Private)', 'Fully clothed service for private events.', 90.00, 'per_hour', 60, 'Private events only', true, false),
('waitressing', 'Skimpy / Lingerie (Private)', 'Sexy skimpy or lingerie outfit, engaging service.', 110.00, 'per_hour', 60, 'Private events only', true, true),
('waitressing', 'Topless (Private)', 'Topless waitress for cheeky and bold events.', 160.00, 'per_hour', 60, 'Private events only', true, true),
('waitressing', 'Nude (Private)', 'Fully nude waitress, boldest adult entertainment.', 260.00, 'per_hour', 60, 'Private events only', true, true),

-- Lap Dance Services
('lap_dance', 'Private Lap Dance', '1 song, 1-on-1 dance in private space.', 100.00, 'flat_rate', 3, 'Minimum rate', true, true),
('lap_dance', 'Public Lap Dance', 'Lap dance in front of others, charged per person.', 100.00, 'per_person', 3, 'Becomes strip show; e.g., 3 viewers = $300', false, true),

-- Strip Show Services
('strip_show', 'Hot Classic Strip (HCS)', 'Classic strip show, full of tease and heat.', 400.00, 'flat_rate', 15, 'Minimum charge', true, true),
('strip_show', 'Deluxe Hot Classic Strip (DHCS)', 'Enhanced classic strip with deluxe elements.', 450.00, 'flat_rate', 20, 'Minimum charge', true, true),
('strip_show', 'Toy Show (TOY)', 'Nude strip show including toy play.', 500.00, 'flat_rate', 20, 'Explicit content', true, true),
('strip_show', 'PVC Show (PVC)', 'Pearls Vibrator and cream show', 550.00, 'flat_rate', 30, 'Optional themed outfits', true, true),
('strip_show', 'XXX Show', 'This wild show includes explicit toy play, seductive body interaction, and a full fantasy experience designed to leave your audience breathless.', 850.00, 'flat_rate', 40, 'Premium adult entertainment', true, true),
('strip_show', 'Greek Show', 'Our most exclusive and provocative act — a deluxe full nude strip that includes "Greek" anal toy play. This show delivers intense, adult-only fantasy fulfillment with high-impact visuals and unforgettable performance energy.', 900.00, 'flat_rate', 40, 'Optional themed outfits', true, true),
('strip_show', 'Duo Show (DUO)', 'Two entertainers in explicit fantasy performance.', 0.00, 'flat_rate', 40, 'Enquire for pricing - Premium duo act', true, true);

-- Update display order for logical grouping
UPDATE public.services SET display_order =
  CASE name
    -- Waitressing (1-10)
    WHEN 'Clothed (Public Bar)' THEN 1
    WHEN 'Skimpy (Public Bar)' THEN 2
    WHEN 'Clothed (Private)' THEN 3
    WHEN 'Skimpy / Lingerie (Private)' THEN 4
    WHEN 'Topless (Private)' THEN 5
    WHEN 'Nude (Private)' THEN 6
    -- Lap Dance (11-20)
    WHEN 'Private Lap Dance' THEN 11
    WHEN 'Public Lap Dance' THEN 12
    -- Strip Shows (21-30)
    WHEN 'Hot Classic Strip (HCS)' THEN 21
    WHEN 'Deluxe Hot Classic Strip (DHCS)' THEN 22
    WHEN 'Toy Show (TOY)' THEN 23
    WHEN 'PVC Show (PVC)' THEN 24
    WHEN 'XXX Show' THEN 25
    WHEN 'Greek Show' THEN 26
    WHEN 'Duo Show (DUO)' THEN 27
    ELSE 99
  END;

-- Add indexes for performance
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_display_order ON public.services(display_order);
CREATE INDEX idx_performer_services_performer ON public.performer_services(performer_id);
CREATE INDEX idx_performer_services_service ON public.performer_services(service_id);
CREATE INDEX idx_performer_services_available ON public.performer_services(is_available);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performer_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services (public read)
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for performer_services
CREATE POLICY "Performer services viewable by everyone" ON public.performer_services
  FOR SELECT USING (is_available = true);

CREATE POLICY "Performers can manage their own services" ON public.performer_services
  FOR ALL USING (
    performer_id IN (
      SELECT id FROM public.performers
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all performer services" ON public.performer_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to get services by category
CREATE OR REPLACE FUNCTION get_services_by_category(category_filter service_category DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  category service_category,
  name VARCHAR(100),
  description TEXT,
  base_rate DECIMAL(10,2),
  rate_type rate_type,
  min_duration_minutes INTEGER,
  booking_notes TEXT,
  is_private_only BOOLEAN,
  age_restricted BOOLEAN,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.category,
    s.name,
    s.description,
    s.base_rate,
    s.rate_type,
    s.min_duration_minutes,
    s.booking_notes,
    s.is_private_only,
    s.age_restricted,
    s.display_order
  FROM public.services s
  WHERE s.is_active = true
    AND (category_filter IS NULL OR s.category = category_filter)
  ORDER BY s.display_order, s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get performer's available services
CREATE OR REPLACE FUNCTION get_performer_services(performer_uuid UUID)
RETURNS TABLE (
  service_id UUID,
  service_name VARCHAR(100),
  category service_category,
  description TEXT,
  rate DECIMAL(10,2),
  rate_type rate_type,
  min_duration_minutes INTEGER,
  booking_notes TEXT,
  is_private_only BOOLEAN,
  age_restricted BOOLEAN,
  special_notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as service_id,
    s.name as service_name,
    s.category,
    s.description,
    COALESCE(ps.custom_rate, s.base_rate) as rate,
    s.rate_type,
    s.min_duration_minutes,
    s.booking_notes,
    s.is_private_only,
    s.age_restricted,
    ps.special_notes
  FROM public.services s
  INNER JOIN public.performer_services ps ON s.id = ps.service_id
  WHERE ps.performer_id = performer_uuid
    AND ps.is_available = true
    AND s.is_active = true
  ORDER BY s.display_order, s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at triggers
CREATE TRIGGER set_timestamp_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_performer_services
  BEFORE UPDATE ON public.performer_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for service statistics
CREATE VIEW service_stats AS
SELECT
  s.category,
  s.name,
  COUNT(ps.performer_id) as performer_count,
  AVG(COALESCE(ps.custom_rate, s.base_rate)) as avg_rate,
  MIN(COALESCE(ps.custom_rate, s.base_rate)) as min_rate,
  MAX(COALESCE(ps.custom_rate, s.base_rate)) as max_rate
FROM public.services s
LEFT JOIN public.performer_services ps ON s.id = ps.service_id AND ps.is_available = true
WHERE s.is_active = true
GROUP BY s.id, s.category, s.name, s.display_order
ORDER BY s.display_order;

-- Grant permissions
GRANT SELECT ON service_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_services_by_category TO authenticated;
GRANT EXECUTE ON FUNCTION get_performer_services TO authenticated;