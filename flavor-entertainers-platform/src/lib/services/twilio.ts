import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio Sandbox number

if (!accountSid || !authToken) {
  console.warn('Twilio credentials not configured. SMS/WhatsApp features will be disabled.');
}

let twilioClient: any = null;

try {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
} catch (error) {
  console.warn('Twilio client initialization failed:', error);
  twilioClient = null;
}

// Initialize Supabase client for service-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export interface SendSMSParams {
  to: string;
  message: string;
  userId?: string;
  bookingId?: string;
  templateId?: string;
}

export interface SendWhatsAppParams {
  to: string;
  message: string;
  userId?: string;
  bookingId?: string;
  templateId?: string;
}

export interface MessageResponse {
  success: boolean;
  messageId?: string;
  twilioSid?: string;
  error?: string;
}

/**
 * Send SMS message via Twilio
 */
export async function sendSMS({
  to,
  message,
  userId,
  bookingId,
  templateId
}: SendSMSParams): Promise<MessageResponse> {
  if (!twilioClient || !twilioPhoneNumber) {
    console.error('Twilio not configured for SMS');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    // Format phone number for international use
    const formattedPhone = formatPhoneNumber(to);

    // Send SMS via Twilio
    const message_instance = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone
    });

    // Log message in database
    const { data: messageLog, error: dbError } = await supabase
      .from('message_logs')
      .insert({
        recipient_id: userId || null,
        booking_id: bookingId || null,
        message_type: 'sms',
        recipient_phone: formattedPhone,
        message_content: message,
        template_id: templateId || null,
        twilio_sid: message_instance.sid,
        twilio_status: message_instance.status,
        status: 'sent'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error logging SMS message:', dbError);
    }

    return {
      success: true,
      messageId: messageLog?.id,
      twilioSid: message_instance.sid
    };

  } catch (error: any) {
    console.error('Error sending SMS:', error);

    // Log failed message
    if (userId) {
      await supabase
        .from('message_logs')
        .insert({
          recipient_id: userId,
          booking_id: bookingId || null,
          message_type: 'sms',
          recipient_phone: to,
          message_content: message,
          template_id: templateId || null,
          status: 'failed',
          error_message: error.message
        });
    }

    return {
      success: false,
      error: error.message || 'Failed to send SMS'
    };
  }
}

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsApp({
  to,
  message,
  userId,
  bookingId,
  templateId
}: SendWhatsAppParams): Promise<MessageResponse> {
  if (!twilioClient) {
    console.error('Twilio not configured for WhatsApp');
    return { success: false, error: 'WhatsApp service not configured' };
  }

  try {
    // Format phone number for WhatsApp
    const formattedPhone = `whatsapp:${formatPhoneNumber(to)}`;

    // Send WhatsApp message via Twilio
    const message_instance = await twilioClient.messages.create({
      body: message,
      from: whatsappNumber,
      to: formattedPhone
    });

    // Log message in database
    const { data: messageLog, error: dbError } = await supabase
      .from('message_logs')
      .insert({
        recipient_id: userId || null,
        booking_id: bookingId || null,
        message_type: 'whatsapp',
        recipient_phone: to,
        message_content: message,
        template_id: templateId || null,
        twilio_sid: message_instance.sid,
        twilio_status: message_instance.status,
        status: 'sent'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error logging WhatsApp message:', dbError);
    }

    return {
      success: true,
      messageId: messageLog?.id,
      twilioSid: message_instance.sid
    };

  } catch (error: any) {
    console.error('Error sending WhatsApp:', error);

    // Log failed message
    if (userId) {
      await supabase
        .from('message_logs')
        .insert({
          recipient_id: userId,
          booking_id: bookingId || null,
          message_type: 'whatsapp',
          recipient_phone: to,
          message_content: message,
          template_id: templateId || null,
          status: 'failed',
          error_message: error.message
        });
    }

    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    };
  }
}

/**
 * Send automated message using template
 */
export async function sendAutomatedMessage(
  templateKey: string,
  recipientUserId: string,
  variables: Record<string, string> = {},
  senderUserId?: string,
  bookingId?: string
): Promise<MessageResponse> {
  try {
    // Get template and recipient info
    const { data: template } = await supabase
      .from('message_templates')
      .select('*')
      .eq('template_key', templateKey)
      .eq('is_active', true)
      .single();

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    const { data: recipient } = await supabase
      .from('users')
      .select(`
        *,
        notification_preferences (*)
      `)
      .eq('id', recipientUserId)
      .single();

    if (!recipient) {
      return { success: false, error: 'Recipient not found' };
    }

    // Check notification preferences
    const prefs = recipient.notification_preferences?.[0];
    if (template.message_type === 'sms' && prefs?.sms_notifications === false) {
      return { success: false, error: 'SMS notifications disabled' };
    }
    if (template.message_type === 'whatsapp' && prefs?.whatsapp_notifications === false) {
      return { success: false, error: 'WhatsApp notifications disabled' };
    }

    // Replace template variables
    let messageContent = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      messageContent = messageContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Get recipient phone number
    const phoneNumber = template.message_type === 'sms'
      ? prefs?.sms_phone_number
      : prefs?.whatsapp_phone_number;

    if (!phoneNumber) {
      return { success: false, error: 'No phone number configured' };
    }

    // Send message
    if (template.message_type === 'sms') {
      return await sendSMS({
        to: phoneNumber,
        message: messageContent,
        userId: recipientUserId,
        bookingId,
        templateId: template.id
      });
    } else if (template.message_type === 'whatsapp') {
      return await sendWhatsApp({
        to: phoneNumber,
        message: messageContent,
        userId: recipientUserId,
        bookingId,
        templateId: template.id
      });
    }

    return { success: false, error: 'Unsupported message type' };

  } catch (error: any) {
    console.error('Error sending automated message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle Twilio webhook for message status updates
 */
export async function handleTwilioWebhook(webhookData: any) {
  try {
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = webhookData;

    if (!MessageSid) {
      console.error('No MessageSid in webhook data');
      return;
    }

    // Update message status in database
    const updateData: any = {
      twilio_status: MessageStatus,
      status: mapTwilioStatusToInternal(MessageStatus),
      updated_at: new Date().toISOString()
    };

    if (MessageStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    if (ErrorCode || ErrorMessage) {
      updateData.error_message = ErrorMessage;
      updateData.status = 'failed';
    }

    await supabase
      .from('message_logs')
      .update(updateData)
      .eq('twilio_sid', MessageSid);

    console.log(`Updated message ${MessageSid} status to ${MessageStatus}`);

  } catch (error) {
    console.error('Error handling Twilio webhook:', error);
  }
}

/**
 * Get message delivery statistics
 */
export async function getMessageStats(userId?: string, dateFrom?: Date, dateTo?: Date) {
  let query = supabase
    .from('message_logs')
    .select('message_type, status, created_at');

  if (userId) {
    query = query.eq('recipient_id', userId);
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom.toISOString());
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo.toISOString());
  }

  const { data: messages } = await query;

  if (!messages) return null;

  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.status === 'sent').length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    failed: messages.filter(m => m.status === 'failed').length,
    sms: messages.filter(m => m.message_type === 'sms').length,
    whatsapp: messages.filter(m => m.message_type === 'whatsapp').length
  };

  return stats;
}

// Helper functions
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Add country code if not present (assuming Australian numbers)
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `+61${cleaned.slice(1)}`;
  } else if (cleaned.length === 9) {
    return `+61${cleaned}`;
  } else if (cleaned.startsWith('61')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('+')) {
    return cleaned;
  }

  return `+${cleaned}`;
}

function mapTwilioStatusToInternal(twilioStatus: string): string {
  switch (twilioStatus) {
    case 'queued':
    case 'accepted':
      return 'pending';
    case 'sent':
      return 'sent';
    case 'delivered':
    case 'read':
      return 'delivered';
    case 'failed':
    case 'undelivered':
      return 'failed';
    default:
      return 'pending';
  }
}

// Export types
export type { Database } from '@/lib/types/database';