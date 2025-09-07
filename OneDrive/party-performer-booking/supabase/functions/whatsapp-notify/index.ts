import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Twilio WhatsApp notification function
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  try {
    const { to, message } = await req.json();
    if (!to || !message) {
      return new Response(JSON.stringify({ error: 'Missing to or message' }), { status: 400 });
    }
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
    const from = Deno.env.get('TWILIO_WHATSAPP_FROM')!;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({
      From: from,
      To: to,
      Body: message
    });
    const auth = btoa(`${accountSid}:${authToken}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`
      },
      body: body.toString()
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), { status: res.status });
    }
    return new Response(JSON.stringify({ success: true, sid: data.sid }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});