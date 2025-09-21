# Flavor Entertainers Platform

A production-ready, full-stack platform for booking vetted professional performers in Australia. Built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## 🌟 Features

### ✅ Completed Core Features

- **Authentication System** - Role-based access (Admin, Performer, Client) with Google OAuth
- **Vetting Application System** - Comprehensive performer onboarding with document uploads
- **Performer Listings** - Advanced search, filtering, and booking system
- **Database Schema** - Complete PostgreSQL schema with Row Level Security
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Modern UI Components** - Custom component library built with Radix UI

### 🚧 In Progress

- **Booking Management** - Full booking lifecycle with calendar integration
- **Payment Processing** - PayID integration for Australian payments
- **SMS Notifications** - Twilio integration for automated messaging
- **Admin Dashboard** - Analytics and management interface

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - App Router with Server Components
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Forms with validation
- **Zustand** - State management
- **TanStack Query** - Server state management

### Backend
- **Supabase** - Authentication, Database, Storage, Realtime
- **PostgreSQL** - Database with Row Level Security
- **Edge Functions** - Serverless functions

### Integrations
- **PayID** - Australian payment system
- **Twilio** - SMS notifications
- **Cloudinary** - Media storage and optimization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Twilio account (for SMS)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/flavor-entertainers-platform.git
   cd flavor-entertainers-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.local` and update with your credentials:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Twilio
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number

   # PayID
   PAYID_CLIENT_ID=your-payid-client-id
   PAYID_CLIENT_SECRET=your-payid-client-secret
   PAYID_ENVIRONMENT=sandbox

   # App
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Run the SQL migration in your Supabase dashboard
   # File: supabase/migrations/001_initial_schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── performers/        # Performer listing
│   ├── vetting/          # Vetting application
│   └── page.tsx          # Homepage
├── components/           # React components
│   ├── auth/            # Authentication forms
│   ├── performers/      # Performer components
│   ├── ui/              # UI component library
│   └── vetting/         # Vetting forms
├── lib/                 # Utilities and configurations
│   ├── auth.ts         # Authentication helpers
│   ├── supabase.ts     # Supabase client
│   └── utils.ts        # Utility functions
└── middleware.ts       # Next.js middleware
```

## 🗄️ Database Schema

### Core Tables
- **users** - User profiles with role-based access
- **vetting_applications** - Performer application system
- **performers** - Approved performer profiles
- **bookings** - Event booking management
- **payments** - PayID payment tracking
- **reviews** - Rating and feedback system
- **messages** - In-app communication
- **notifications** - System notifications

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure file uploads with Supabase Storage

## 🎨 Design System

### Brand Colors
- Primary Purple: `#8B5CF6`
- Primary Pink: `#EC4899`
- Dark variants available

### Components
- Built with Radix UI primitives
- Fully accessible (WCAG 2.1 AA)
- Dark mode support
- Responsive design

## 🔐 Security Features

- **Authentication** - Supabase Auth with OAuth
- **Authorization** - Role-based access control
- **Data Protection** - Row Level Security
- **File Security** - Signed uploads and access
- **API Security** - Rate limiting and validation

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npx vercel --prod
   ```

2. **Environment Variables**
   Set all environment variables in Vercel dashboard

3. **Domain Setup**
   Configure custom domain in Vercel

### Database Migration
Run the SQL migration in your Supabase dashboard:
```sql
-- File: supabase/migrations/001_initial_schema.sql
```

## 📞 Support

### Contact Information
- **Email**: support@flavor-entertainers.com.au
- **Phone**: +61 2 8000 0000
- **Business Hours**: Mon-Fri 9AM-5PM AEST

---

**Flavor Entertainers** - Australia's Premier Entertainment Booking Platform
Built with ❤️ for the entertainment industry
