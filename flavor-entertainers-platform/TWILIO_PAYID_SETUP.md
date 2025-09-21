# Twilio & PayID Integration Setup Guide

This guide covers the configuration and setup of Twilio SMS/WhatsApp messaging and PayID payment workflows for the Flavor Entertainers platform.

## 🚀 Features Implemented

### Twilio Integration
- ✅ **SMS Messaging** - Send booking confirmations, reminders, and notifications
- ✅ **WhatsApp Messaging** - Rich messaging with emojis and formatting
- ✅ **Message Templates** - Pre-built templates for common scenarios
- ✅ **Delivery Tracking** - Real-time status updates and delivery confirmations
- ✅ **Webhook Handling** - Automatic status updates from Twilio
- ✅ **Message Logging** - Full audit trail of all communications

### PayID Integration
- ✅ **PayID Account Management** - Register and manage performer PayID accounts
- ✅ **Payment Requests** - Generate PayID payment requests for bookings
- ✅ **Fee Calculation** - Automatic fee calculation (2.5% for PayID)
- ✅ **Payment Tracking** - Full payment lifecycle management
- ✅ **Payment Instructions** - Generate clear payment instructions for clients
- ✅ **Multi-Account Support** - Support for multiple PayID accounts per user

### Notification System
- ✅ **Notification Preferences** - Granular control over notification types
- ✅ **Multi-Channel Delivery** - Email, SMS, WhatsApp, and browser notifications
- ✅ **Smart Routing** - Respect user preferences and delivery channel availability
- ✅ **Automated Workflows** - Trigger notifications based on booking events

## 📋 Database Schema

### New Tables Added
1. **`message_logs`** - Stores all sent messages with delivery status
2. **`payment_transactions`** - Tracks payment requests and status
3. **`payid_accounts`** - Manages user PayID account details
4. **`notification_preferences`** - Stores user notification settings
5. **`message_templates`** - Pre-built message templates
6. **`webhook_logs`** - Logs external webhook calls

### Key Functions
- `send_automated_message()` - Send templated messages
- `create_payid_payment()` - Create PayID payment requests

## 🔧 Environment Setup

### Required Environment Variables

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_WEBHOOK_TOKEN=your_webhook_verification_token

# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Twilio Account Setup

1. **Create Twilio Account**
   - Sign up at [twilio.com](https://twilio.com)
   - Verify your account and get Account SID and Auth Token

2. **Phone Number Setup**
   - Purchase a phone number in Twilio Console
   - Configure webhook URL: `https://yourdomain.com/api/webhooks/twilio`

3. **WhatsApp Setup**
   - Enable WhatsApp Sandbox in Twilio Console
   - For production: Apply for WhatsApp Business API approval
   - Configure WhatsApp webhook URL

4. **Webhook Configuration**
   ```
   Webhook URL: https://yourdomain.com/api/webhooks/twilio
   HTTP Method: POST
   Status Callback: Enable
   ```

## 📱 Message Templates

### Pre-built Templates

1. **Booking Confirmation SMS**
   ```
   Hi {{client_name}}! Your booking with {{performer_name}} on {{event_date}} at {{event_time}} has been confirmed. Venue: {{venue_name}}. Total: ${{total_amount}}. Questions? Reply HELP.
   ```

2. **Payment Request WhatsApp**
   ```
   Hi {{client_name}}! 💫 Payment request for your booking with {{performer_name}} on {{event_date}}.

   Amount: ${{amount}}
   PayID: {{payid_identifier}}
   Reference: {{reference}}

   Pay now to confirm your booking! 🎉
   ```

3. **Safety Check-in**
   ```
   🛡️ SAFETY CHECK-IN

   {{performer_name}} has safely arrived at their booking location.
   Time: {{checkin_time}}
   Location: {{location}}

   This is an automated safety notification.
   ```

### Adding Custom Templates

```typescript
import { supabase } from '@/lib/supabase';

await supabase.from('message_templates').insert({
  name: 'Custom Template Name',
  template_key: 'custom_template_key',
  message_type: 'sms', // or 'whatsapp'
  subject: 'Optional subject for email',
  content: 'Your message with {{variables}}',
  variables: ['variable1', 'variable2'],
  is_active: true
});
```

## 💳 PayID Setup

### PayID Account Registration

```typescript
import { createPayIDAccount } from '@/lib/services/payid';

const result = await createPayIDAccount(
  userId,
  'performer@example.com', // PayID identifier
  'Performer Name',
  'Commonwealth Bank',
  '123456',
  '1234567890'
);
```

### Creating Payment Requests

```typescript
import { createPaymentRequest } from '@/lib/services/payid';

const payment = await createPaymentRequest({
  bookingId: 'booking-uuid',
  payerId: 'client-uuid',
  recipientId: 'performer-uuid',
  amount: 250.00,
  description: 'Entertainment services for birthday party'
});
```

### Payment Status Updates

```typescript
import { updatePaymentStatus } from '@/lib/services/payid';

// Called when payment is received
await updatePaymentStatus(
  paymentId,
  'completed',
  'external-transaction-id',
  new Date(),
  null // no failure reason
);
```

## 🔄 Automated Workflows

### Booking Confirmation Flow
1. Client makes booking → Booking created in database
2. Payment request generated → PayID payment created
3. SMS sent to client → Payment instructions delivered
4. Client pays → Webhook updates payment status
5. Confirmation sent → Both client and performer notified

### Safety Check-in Flow
1. Performer arrives → Location check-in submitted
2. Emergency contact notified → WhatsApp message sent
3. Admin dashboard updated → Real-time safety status

### Payment Reminder Flow
1. 24 hours before booking → Automated reminder sent
2. Payment overdue → Follow-up reminder sent
3. Payment received → Confirmation and booking details sent

## 🛠️ API Endpoints

### Message API
```typescript
// Send direct message
POST /api/messages/send
{
  "type": "sms",
  "to": "+61400000000",
  "message": "Your message here",
  "userId": "user-uuid",
  "bookingId": "booking-uuid"
}

// Send templated message
POST /api/messages/send
{
  "templateKey": "booking_confirmation_sms",
  "userId": "user-uuid",
  "bookingId": "booking-uuid",
  "variables": {
    "client_name": "John Doe",
    "performer_name": "Sarah",
    "event_date": "2024-03-15"
  }
}
```

### PayID API
```typescript
// Create payment request
POST /api/payments/payid
{
  "bookingId": "booking-uuid",
  "payerId": "client-uuid",
  "recipientId": "performer-uuid",
  "amount": 250.00,
  "description": "Entertainment services"
}

// Validate PayID
POST /api/payments/payid/validate
{
  "payidIdentifier": "performer@example.com"
}

// Get user's PayID accounts
GET /api/payments/payid?userId=user-uuid
```

## 🎛️ React Components

### PayID Setup Component
```typescript
import { PayIDSetup } from '@/components/payments/payid-setup';

function PerformerSettings() {
  return (
    <PayIDSetup onSetupComplete={() => console.log('PayID configured!')} />
  );
}
```

### Notification Preferences
```typescript
import { NotificationPreferences } from '@/components/notifications/notification-preferences';

function UserSettings() {
  return <NotificationPreferences />;
}
```

## 📊 Usage Examples

### Send Booking Confirmation
```typescript
import { sendAutomatedMessage } from '@/lib/services/twilio';

await sendAutomatedMessage(
  'booking_confirmation_sms',
  clientUserId,
  {
    client_name: 'John Doe',
    performer_name: 'Sarah',
    event_date: '2024-03-15',
    event_time: '7:00 PM',
    venue_name: 'The Grand Ballroom',
    total_amount: '250.00'
  },
  performerUserId,
  bookingId
);
```

### Process PayID Payment
```typescript
import { createPaymentRequest, generatePaymentInstructions } from '@/lib/services/payid';

// Create payment request
const { paymentId } = await createPaymentRequest({
  bookingId,
  payerId: clientId,
  recipientId: performerId,
  amount: 250.00
});

// Generate instructions for client
const instructions = generatePaymentInstructions(
  'performer@example.com',
  250.00,
  `BOOKING-${bookingId}`,
  'Sarah Smith'
);

// Send instructions via SMS
await sendSMS({
  to: clientPhone,
  message: `Payment Instructions:\n\n${instructions}`,
  userId: clientId,
  bookingId
});
```

## 🔒 Security Considerations

### Webhook Security
- Verify Twilio webhook signatures
- Use HTTPS for all webhook endpoints
- Implement rate limiting on webhook endpoints

### PayID Security
- Validate PayID format before processing
- Store sensitive banking details encrypted
- Implement fraud detection for large amounts

### Data Protection
- Anonymize message logs after 90 days
- Encrypt phone numbers at rest
- Implement GDPR-compliant data deletion

## 🐛 Troubleshooting

### Common Issues

1. **Messages not sending**
   - Check Twilio credentials
   - Verify phone number format (+61 for Australia)
   - Check message template variables

2. **PayID validation failing**
   - Ensure PayID is registered with bank
   - Check identifier format (email/mobile)
   - Verify NPP API connectivity

3. **Webhooks not working**
   - Check webhook URL accessibility
   - Verify SSL certificate
   - Check webhook logs in database

### Debug Mode
```typescript
// Enable debug logging
process.env.DEBUG_TWILIO = 'true';
process.env.DEBUG_PAYID = 'true';
```

## 📈 Monitoring & Analytics

### Message Statistics
```typescript
import { getMessageStats } from '@/lib/services/twilio';

const stats = await getMessageStats(
  userId,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

console.log(`Sent: ${stats.sent}, Delivered: ${stats.delivered}`);
```

### Payment Analytics
```typescript
import { getUserPaymentHistory } from '@/lib/services/payid';

const { payments, total } = await getUserPaymentHistory(userId, 50, 0);
```

## 🚀 Deployment Checklist

- [ ] Twilio account configured and verified
- [ ] Phone number purchased and webhook configured
- [ ] WhatsApp Business API approved (for production)
- [ ] Environment variables set in production
- [ ] Database migrations deployed
- [ ] Webhook endpoints tested
- [ ] PayID test transactions completed
- [ ] Message templates reviewed and approved
- [ ] Security configurations verified
- [ ] Monitoring and alerting set up

## 📞 Support

For issues with this integration:
1. Check the webhook logs in the `webhook_logs` table
2. Review message delivery status in `message_logs`
3. Verify PayID account status in `payid_accounts`
4. Contact Twilio support for messaging issues
5. Contact your bank for PayID problems

---

This integration provides a complete communication and payment workflow for the Flavor Entertainers platform. The system is designed to be reliable, secure, and scalable for production use.