-- Twilio and PayID Integration Migration
-- Adds communication and payment features

-- Create communication type enum
CREATE TYPE communication_type AS ENUM (
  'sms',
  'whatsapp',
  'email',
  'push_notification'
);

-- Create message status enum
CREATE TYPE message_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed',
  'read'
);

-- Create payment status enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM (
      'pending',
      'processing',
      'completed',
      'failed',
      'refunded',
      'cancelled'
    );
  END IF;
END$$;

-- Create payment method enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM (
      'payid',
      'bank_transfer',
      'credit_card',
      'digital_wallet',
      'cash'
    );
  END IF;
END$$;

-- Create message logs table
CREATE TABLE public.message_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  message_type communication_type NOT NULL,
  recipient_phone TEXT,
  recipient_email TEXT,
  subject TEXT,
  message_content TEXT NOT NULL,
  template_id TEXT,
  template_variables JSONB DEFAULT '{}',
  twilio_sid TEXT,
  twilio_status TEXT,
  status message_status DEFAULT 'pending',
  error_message TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  payment_method payment_method NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'AUD',
  payid_identifier TEXT, -- PayID email or phone
  payid_name TEXT, -- Name associated with PayID
  bank_reference TEXT,
  transaction_reference TEXT,
  external_transaction_id TEXT,
  status payment_status DEFAULT 'pending',
  fee_amount DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2),
  payment_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  failure_reason TEXT,
  refund_reason TEXT,
  refunded_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PayID accounts table
CREATE TABLE public.payid_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  payid_identifier TEXT NOT NULL, -- email or phone number
  payid_type TEXT NOT NULL, -- 'email' or 'mobile'
  account_name TEXT NOT NULL,
  bank_name TEXT,
  bsb TEXT,
  account_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, payid_identifier)
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  booking_confirmations BOOLEAN DEFAULT true,
  booking_reminders BOOLEAN DEFAULT true,
  payment_notifications BOOLEAN DEFAULT true,
  safety_alerts BOOLEAN DEFAULT true,
  marketing_communications BOOLEAN DEFAULT false,
  sms_phone_number TEXT,
  whatsapp_phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create automated message templates table
CREATE TABLE public.message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_key TEXT NOT NULL UNIQUE,
  message_type communication_type NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Array of variable names
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook logs table for external integrations
CREATE TABLE public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_type TEXT NOT NULL, -- 'twilio', 'payid', 'stripe', etc.
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  headers JSONB,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_message_logs_recipient ON public.message_logs(recipient_id);
CREATE INDEX idx_message_logs_booking ON public.message_logs(booking_id);
CREATE INDEX idx_message_logs_status ON public.message_logs(status);
CREATE INDEX idx_message_logs_type ON public.message_logs(message_type);
CREATE INDEX idx_message_logs_created ON public.message_logs(created_at);

CREATE INDEX idx_payment_transactions_booking ON public.payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_payer ON public.payment_transactions(payer_id);
CREATE INDEX idx_payment_transactions_recipient ON public.payment_transactions(recipient_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_method ON public.payment_transactions(payment_method);
CREATE INDEX idx_payment_transactions_date ON public.payment_transactions(payment_date);

CREATE INDEX idx_payid_accounts_user ON public.payid_accounts(user_id);
CREATE INDEX idx_payid_accounts_identifier ON public.payid_accounts(payid_identifier);
CREATE INDEX idx_payid_accounts_active ON public.payid_accounts(is_active);

CREATE INDEX idx_webhook_logs_type ON public.webhook_logs(webhook_type);
CREATE INDEX idx_webhook_logs_created ON public.webhook_logs(created_at);

-- Enable RLS
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payid_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message logs
CREATE POLICY "Users can view their own messages" ON public.message_logs
  FOR SELECT USING (
    recipient_id = auth.uid() OR
    sender_id = auth.uid()
  );

CREATE POLICY "Users can create messages" ON public.message_logs
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can manage all messages" ON public.message_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for payment transactions
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
  FOR SELECT USING (
    payer_id = auth.uid() OR
    recipient_id = auth.uid()
  );

CREATE POLICY "Users can create payment transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (payer_id = auth.uid());

CREATE POLICY "Users can update their own transactions" ON public.payment_transactions
  FOR UPDATE USING (
    payer_id = auth.uid() OR
    recipient_id = auth.uid()
  );

CREATE POLICY "Admins can manage all transactions" ON public.payment_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for PayID accounts
CREATE POLICY "Users can manage their own PayID accounts" ON public.payid_accounts
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for notification preferences
CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for message templates
CREATE POLICY "All users can view active templates" ON public.message_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.message_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for webhook logs (admin only)
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at triggers
CREATE TRIGGER set_timestamp_message_logs
  BEFORE UPDATE ON public.message_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_payment_transactions
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_payid_accounts
  BEFORE UPDATE ON public.payid_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_notification_preferences
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_message_templates
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default message templates
INSERT INTO public.message_templates (name, template_key, message_type, subject, content, variables) VALUES
('Booking Confirmation SMS', 'booking_confirmation_sms', 'sms', NULL,
 'Hi {{client_name}}! Your booking with {{performer_name}} on {{event_date}} at {{event_time}} has been confirmed. Venue: {{venue_name}}. Total: ${{total_amount}}. Questions? Reply HELP.',
 '["client_name", "performer_name", "event_date", "event_time", "venue_name", "total_amount"]'),

('Booking Reminder SMS', 'booking_reminder_sms', 'sms', NULL,
 'Reminder: Your booking with {{performer_name}} is tomorrow ({{event_date}}) at {{event_time}}. Venue: {{venue_name}}. Payment due: ${{amount_due}}. PayID: {{payid_identifier}}',
 '["performer_name", "event_date", "event_time", "venue_name", "amount_due", "payid_identifier"]'),

('Payment Request WhatsApp', 'payment_request_whatsapp', 'whatsapp', NULL,
 'Hi {{client_name}}! 💫 Payment request for your booking with {{performer_name}} on {{event_date}}.\n\nAmount: ${{amount}}\nPayID: {{payid_identifier}}\nReference: {{reference}}\n\nPay now to confirm your booking! 🎉',
 '["client_name", "performer_name", "event_date", "amount", "payid_identifier", "reference"]'),

('Payment Received SMS', 'payment_received_sms', 'sms', NULL,
 'Payment received! 🎉 Your booking with {{performer_name}} is now confirmed. Date: {{event_date}} at {{event_time}}. See you there!',
 '["performer_name", "event_date", "event_time"]'),

('Safety Check-in WhatsApp', 'safety_checkin_whatsapp', 'whatsapp', NULL,
 '🛡️ SAFETY CHECK-IN\n\n{{performer_name}} has safely arrived at their booking location.\nTime: {{checkin_time}}\nLocation: {{location}}\n\nThis is an automated safety notification.',
 '["performer_name", "checkin_time", "location"]'),

('Emergency Alert SMS', 'emergency_alert_sms', 'sms', NULL,
 '🚨 EMERGENCY ALERT: {{performer_name}} has triggered an emergency check-in. Last known location: {{location}} at {{timestamp}}. Contact immediately: {{performer_phone}}',
 '["performer_name", "location", "timestamp", "performer_phone"]');

-- Create function to send automated messages
CREATE OR REPLACE FUNCTION send_automated_message(
  template_key_input TEXT,
  recipient_user_id UUID,
  sender_user_id UUID DEFAULT NULL,
  booking_id_input UUID DEFAULT NULL,
  template_vars JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  template_record RECORD;
  message_content_final TEXT;
  recipient_record RECORD;
  message_id UUID;
  var_key TEXT;
  var_value TEXT;
BEGIN
  -- Get template
  SELECT * INTO template_record
  FROM public.message_templates
  WHERE template_key = template_key_input AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found: %', template_key_input;
  END IF;

  -- Get recipient details
  SELECT u.*, np.sms_phone_number, np.whatsapp_phone_number, np.email_notifications, np.sms_notifications, np.whatsapp_notifications
  INTO recipient_record
  FROM public.users u
  LEFT JOIN public.notification_preferences np ON u.id = np.user_id
  WHERE u.id = recipient_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient not found: %', recipient_user_id;
  END IF;

  -- Check if user has enabled this notification type
  IF template_record.message_type = 'sms' AND recipient_record.sms_notifications = false THEN
    RETURN NULL; -- User has disabled SMS notifications
  END IF;

  IF template_record.message_type = 'whatsapp' AND recipient_record.whatsapp_notifications = false THEN
    RETURN NULL; -- User has disabled WhatsApp notifications
  END IF;

  -- Replace template variables
  message_content_final := template_record.content;
  FOR var_key, var_value IN SELECT * FROM jsonb_each_text(template_vars)
  LOOP
    message_content_final := REPLACE(message_content_final, '{{' || var_key || '}}', var_value);
  END LOOP;

  -- Insert message log
  INSERT INTO public.message_logs (
    recipient_id,
    sender_id,
    booking_id,
    message_type,
    recipient_phone,
    recipient_email,
    subject,
    message_content,
    template_id,
    template_variables,
    status
  ) VALUES (
    recipient_user_id,
    sender_user_id,
    booking_id_input,
    template_record.message_type,
    CASE
      WHEN template_record.message_type = 'sms' THEN recipient_record.sms_phone_number
      WHEN template_record.message_type = 'whatsapp' THEN recipient_record.whatsapp_phone_number
      ELSE NULL
    END,
    recipient_record.email,
    template_record.subject,
    message_content_final,
    template_record.id::TEXT,
    template_vars,
    'pending'
  ) RETURNING id INTO message_id;

  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process PayID payment
CREATE OR REPLACE FUNCTION create_payid_payment(
  booking_id_input UUID,
  payer_id_input UUID,
  recipient_id_input UUID,
  amount_input DECIMAL(10, 2),
  payid_identifier_input TEXT,
  description_input TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
  fee_amount_calc DECIMAL(10, 2);
  net_amount_calc DECIMAL(10, 2);
  payid_record RECORD;
BEGIN
  -- Validate PayID account
  SELECT * INTO payid_record
  FROM public.payid_accounts
  WHERE user_id = recipient_id_input
    AND payid_identifier = payid_identifier_input
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid PayID account: %', payid_identifier_input;
  END IF;

  -- Calculate fees (2.5% for PayID transactions)
  fee_amount_calc := ROUND(amount_input * 0.025, 2);
  net_amount_calc := amount_input - fee_amount_calc;

  -- Create payment transaction
  INSERT INTO public.payment_transactions (
    booking_id,
    payer_id,
    recipient_id,
    payment_method,
    amount,
    currency,
    payid_identifier,
    payid_name,
    fee_amount,
    net_amount,
    description,
    status,
    due_date
  ) VALUES (
    booking_id_input,
    payer_id_input,
    recipient_id_input,
    'payid',
    amount_input,
    'AUD',
    payid_identifier_input,
    payid_record.account_name,
    fee_amount_calc,
    net_amount_calc,
    description_input,
    'pending',
    NOW() + INTERVAL '24 hours'
  ) RETURNING id INTO transaction_id;

  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.message_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payid_accounts TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
GRANT SELECT ON public.message_templates TO authenticated;
GRANT EXECUTE ON FUNCTION send_automated_message TO authenticated;
GRANT EXECUTE ON FUNCTION create_payid_payment TO authenticated;