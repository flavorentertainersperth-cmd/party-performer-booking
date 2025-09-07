# Party Performer Booking Platform

This repository contains the complete source code for a performer booking platform built with **Next.js App Router**, **Supabase**, and **Supabase Edge Functions**. The platform allows clients to find and book performers, performers to manage their availability and bookings, and administrators to verify payments and handle referrals. The system uses **PayID** for payments (no credit card processors) and integrates with **Twilio** to send WhatsApp and SMS notifications via Supabase Edge Functions.

## Project Structure

The repository is organised as follows:

```
├── app/                     # Next.js pages, API routes and components
│   ├── api/                 # REST API handlers with zod validation and audit logging
│   ├── components/          # Reusable React components (PerformerGrid, BookingWizard, etc.)
│   ├── dashboard/           # Role‑specific dashboards (admin, performer, client)
│   ├── legal/               # Terms, privacy, content policy pages
│   ├── performer/[id]/      # Dynamic performer profile pages
│   ├── book/                # Booking wizard page
│   └── styles/              # Global CSS
├── lib/                     # Shared library code (supabase client, auth helpers, audit logging)
├── supabase/
│   ├── migrations/          # SQL migrations (enums, tables, policies, storage)
│   ├── seed/                # Idempotent seed scripts and reset script
│   └── functions/           # Supabase Edge Functions (WhatsApp, SMS, PayID verify)
├── .env.example             # Environment variable template
├── package.json             # Node dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── next.config.js           # Next.js configuration
└── README.md                # This file
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed and authenticated (`supabase login`)
- [Vercel CLI](https://vercel.com/docs/cli) (optional for local testing)
- Twilio account credentials for WhatsApp and SMS notifications

### Installation

Clone the repository and install dependencies:

```bash
git clone <your‑repo>
cd party-performer-booking
npm install
```

Copy the `.env.example` file to `.env` and fill in the required values. At minimum you need Supabase keys, PayID details, Twilio credentials, and deposit/referral percentages.

```bash
cp .env.example .env
```

### Supabase Setup

1. Authenticate and link the project:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

2. Run database migrations:

   ```bash
   supabase migration up
   ```

3. Seed the database with sample data (optional, for development/testing):

   ```bash
   supabase db reset --seed supabase/seed/900_seed.sql
   ```

4. Set secrets for Edge Functions. You must provide Twilio and Supabase service role keys:

   ```bash
   supabase secrets set \
     TWILIO_ACCOUNT_SID=<your-twilio-account-sid> \
     TWILIO_AUTH_TOKEN=<your-twilio-auth-token> \
     TWILIO_SMS_FROM=<your-twilio-sms-from> \
     TWILIO_WHATSAPP_FROM=<your-twilio-whatsapp-from> \
     SUPABASE_URL=<your-supabase-url> \
     SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

5. Deploy the Edge Functions:

   ```bash
   supabase functions deploy whatsapp-notify
   supabase functions deploy sms-notify
   supabase functions deploy payid-verify
   ```

### Running Locally

Start the development server with the Supabase emulator running:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Deployment

Deploy the Next.js app to Vercel:

1. Import the repository into your Vercel dashboard.
2. During setup, add all environment variables from your `.env` file. At minimum set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DEPOSIT_PERCENTAGE`
   - `REFERRAL_PERCENTAGE`
   - `NEXT_PUBLIC_PAYID_NAME`
   - `NEXT_PUBLIC_PAYID_IDENTIFIER`
   - `NEXT_PUBLIC_DEPOSIT_PERCENTAGE`
3. Build and deploy.

Supabase Edge Functions are deployed separately using `supabase functions deploy` and do not need Vercel.

## Health Checks

After deployment, you can check the health of the API and functions using `curl`:

- **API endpoints** (replace domain accordingly):

  ```bash
  # List performers
  curl https://<your-app-domain>/api/performers

  # Create a booking (requires auth; use a valid JWT)
  curl -X POST https://<your-app-domain>/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"performerId":"<uuid>","serviceId":"<uuid>","eventDatetime":"2025-12-31T18:00:00"}'
  ```

- **Edge Functions**:

  ```bash
  # Send WhatsApp message
  curl -X POST https://<project-ref>.functions.supabase.co/whatsapp-notify \
    -H "Content-Type: application/json" \
    -d '{"to":"whatsapp:+61400000000","message":"Test message"}'

  # Send SMS message
  curl -X POST https://<project-ref>.functions.supabase.co/sms-notify \
    -H "Content-Type: application/json" \
    -d '{"to":"+61400000000","message":"Test SMS"}'

  # Verify PayID (service role key required; call from server)
  curl -X POST https://<project-ref>.functions.supabase.co/payid-verify \
    -H "Content-Type: application/json" \
    -d '{"bookingId":"<uuid>"}'
  ```

## Smoke Test

Perform the following end‑to‑end smoke test after deployment to ensure the system works correctly:

1. **Toggle availability**: Log in as a performer and navigate to the Performer Dashboard. Toggle your availability status and verify that it updates in the UI and database.
2. **Create booking**: Log in as a client, go to `/book`, select an event date/time, choose an available performer and a service, and submit. A booking should be created with `deposit_amount` equal to `service.rate * DEPOSIT_PERCENTAGE%`.
3. **Upload PayID receipt**: In the final step of the booking wizard, enter a fake receipt URL and submit. The booking should change to `payment_status = deposit_pending_review` and `deposit_pending_review = true`.
4. **Admin verify & ETA**: Log in as an admin and open the Admin Dashboard. The pending deposit should appear. Enter an ETA (e.g., 60 minutes) and an optional note, then verify. The booking should update to `payment_status = deposit_paid`, `deposit_pending_review = false`, and `eta_minutes`/`eta_note` set accordingly. A referral row should be created with a fee equal to `REFERRAL_PERCENTAGE%` of the deposit or the override you provide.
5. **Notifications** (optional): Trigger the WhatsApp and SMS functions manually or integrate them into your workflows to send booking confirmations.
6. **Mark referral paid** (optional): As an admin, call the `/api/admin/referrals/mark-paid` endpoint with a referral ID and optional receipt URL. The referral should update to `status = paid` and record the payment.

## Accessibility & Responsiveness

The UI uses semantic HTML, labelled form controls, and responsive CSS grid layouts to ensure accessibility and usability across devices. All interactive elements provide appropriate labels and error messages.

## Security & RLS

- **Strict Typing & Validation**: All API routes use TypeScript and validate input with **zod**.
- **Row Level Security**: RLS is enabled on all tables with policies that restrict access to the record owner or admin. By default, no rows are returned unless explicitly allowed. See `supabase/migrations/020_policies.sql` for policy definitions and comments outlining isolation guarantees.
- **Storage**: Performer photos are stored in a public bucket; all sensitive uploads (IDs, receipts) reside in a private bucket with RLS ensuring only the owner or admin can access them.
- **Audit Logging**: Every API action writes an entry to the `audit_logs` table. This enables tamper‑evident tracking of operations.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss improvements.