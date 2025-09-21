import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, sendWhatsApp, sendAutomatedMessage } from '@/lib/services/twilio';

export async function POST(request: NextRequest) {
  try {
    const { type, to, message, userId, bookingId, templateKey, variables } = await request.json();

    if (!type || (!message && !templateKey)) {
      return NextResponse.json(
        { error: 'Message type and content/template required' },
        { status: 400 }
      );
    }

    let result;

    if (templateKey) {
      // Send automated message using template
      result = await sendAutomatedMessage(
        templateKey,
        userId,
        variables || {},
        undefined,
        bookingId
      );
    } else {
      // Send direct message
      if (!to) {
        return NextResponse.json(
          { error: 'Recipient phone number required for direct messages' },
          { status: 400 }
        );
      }

      if (type === 'sms') {
        result = await sendSMS({
          to,
          message,
          userId,
          bookingId
        });
      } else if (type === 'whatsapp') {
        result = await sendWhatsApp({
          to,
          message,
          userId,
          bookingId
        });
      } else {
        return NextResponse.json(
          { error: 'Unsupported message type' },
          { status: 400 }
        );
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      twilioSid: result.twilioSid
    });

  } catch (error: any) {
    console.error('Message sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}