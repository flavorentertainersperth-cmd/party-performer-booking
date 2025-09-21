# 🗄️ Supabase Database Setup Guide

Complete guide to set up your Supabase backend for Flavor Entertainers Platform.

## Step 1: Create Your Supabase Project

1. **Go to [Supabase](https://supabase.com)** and create a free account
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Create new or select existing
   - Name: `flavor-entertainers-platform`
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your location (Australia East for Australian users)
4. **Click "Create new project"**
5. **Wait 2-3 minutes** for the project to be ready

## Step 2: Get Your Credentials

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy the following values:**
   - **Project URL** (looks like: `https://abcdefg.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role secret key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

3. **Update your `.env.local` file:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Step 3: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Click "New query"**
3. **Copy and paste** the entire contents of `supabase/migrations/001_initial_schema.sql`
4. **Click "Run"** to execute the script
5. **Verify the tables were created** by going to **Table Editor**

You should see these tables:
- ✅ users
- ✅ vetting_applications
- ✅ performers
- ✅ bookings
- ✅ payments
- ✅ reviews
- ✅ messages
- ✅ notifications
- ✅ audit_logs

## Step 4: Configure Storage

1. **Go to Storage** in your Supabase dashboard
2. **Click "Create a new bucket"**
3. **Bucket details:**
   - Name: `performer-files`
   - Public bucket: ✅ **Enabled**
   - File size limit: `50MB`
   - Allowed MIME types: `image/*,video/*,application/pdf`
4. **Click "Create bucket"**

## Step 5: Enable Authentication

1. **Go to Authentication > Settings**
2. **Enable email authentication** (should be enabled by default)
3. **Configure email templates** (optional):
   - Customize the "Confirm your signup" email
   - Customize the "Reset your password" email

### Optional: Enable Google OAuth

1. **Go to Authentication > Providers**
2. **Click on Google**
3. **Enable Google provider**
4. **Get Google OAuth credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins
5. **Enter credentials in Supabase:**
   - Client ID
   - Client Secret
   - Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## Step 6: Configure Row Level Security (RLS)

The database schema already includes RLS policies, but verify they're active:

1. **Go to Authentication > Policies**
2. **Check that policies exist for each table:**
   - users (4 policies)
   - vetting_applications (4 policies)
   - performers (3 policies)
   - bookings (4 policies)
   - payments (2 policies)
   - reviews (3 policies)
   - messages (2 policies)
   - notifications (2 policies)

## Step 7: Test Your Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit `http://localhost:3000`**

3. **Test user registration:**
   - Click "Get Started"
   - Register a new account
   - Check if user appears in `Authentication > Users`

4. **Test database connection:**
   - Try viewing the performers page
   - No errors should appear in console

## Step 8: Production Configuration

When deploying to production:

1. **Update environment variables** in your hosting platform (Vercel/Netlify)
2. **Add production domain** to Supabase:
   - Go to **Authentication > Settings**
   - Add your production URL to **Site URL**
   - Add to **Redirect URLs** if using OAuth
3. **Enable email confirmations** for production
4. **Configure custom SMTP** (optional) for branded emails

## 🔧 Troubleshooting

### Common Issues:

**"Invalid supabaseUrl" error:**
- Check your `.env.local` file has the correct URL
- Restart your development server after updating env vars

**"Row Level Security policy violation" error:**
- Ensure RLS policies are enabled
- Check user authentication status
- Verify user roles are set correctly

**File upload not working:**
- Ensure `performer-files` bucket exists
- Check bucket is set to public
- Verify file size limits

**Authentication not working:**
- Check email provider settings
- Verify redirect URLs match your domain
- Ensure email templates are configured

### Need Help?

- 📖 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)

---

## ✅ Setup Complete!

Once you've completed all steps, your Flavor Entertainers Platform will have:

- ✅ Secure user authentication
- ✅ Complete database with all tables
- ✅ File upload capabilities
- ✅ Row-level security
- ✅ Real-time subscriptions ready
- ✅ Production-ready configuration

🎉 **Your platform is now ready for users!**