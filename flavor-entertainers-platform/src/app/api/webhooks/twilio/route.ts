import { NextRequest, NextResponse } from 'next/server';
import { handleTwilioWebhook } from '@/lib/services/twilio';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Verify Twilio webhook signature (optional but recommended)
    const twilioSignature = request.headers.get('x-twilio-signature');
    const webhookToken = process.env.TWILIO_WEBHOOK_TOKEN;

    // Parse form data from Twilio webhook
    const formData = await request.formData();
    const webhookData: any = {};

    for (const [key, value] of formData.entries()) {
      webhookData[key] = value;
    }

    // Log webhook for debugging
    await supabase.from('webhook_logs').insert({
      webhook_type: 'twilio',
      endpoint: '/api/webhooks/twilio',
      method: 'POST',
      headers: Object.fromEntries(request.headers.entries()),
      payload: webhookData,
      response_status: 200,
      processing_time_ms: 0
    });

    // Handle the webhook
    await handleTwilioWebhook(webhookData);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Twilio webhook error:', error);

    // Log error
    await supabase.from('webhook_logs').insert({
      webhook_type: 'twilio',
      endpoint: '/api/webhooks/twilio',
      method: 'POST',
      headers: Object.fromEntries(request.headers.entries()),
      response_status: 500,
      error_message: error.message,
      processing_time_ms: 0
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}