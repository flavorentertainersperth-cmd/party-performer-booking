@echo off
:: Flavor Entertainers Platform Setup Script for Windows
:: This script sets up the complete platform with all required services

echo 🎭 Setting up Flavor Entertainers Platform...
echo ==========================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js version: %NODE_VERSION%

:: Install dependencies
echo 📋 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

:: Create environment file if it doesn't exist
echo 📋 Setting up environment variables...
if not exist .env.local (
    echo Creating .env.local file...
    (
        echo # Supabase Configuration
        echo NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
        echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
        echo.
        echo # Authentication
        echo NEXTAUTH_SECRET=your-nextauth-secret-here
        echo NEXTAUTH_URL=http://localhost:3000
        echo.
        echo # Twilio SMS ^(Optional^)
        echo TWILIO_ACCOUNT_SID=your-twilio-account-sid
        echo TWILIO_AUTH_TOKEN=your-twilio-auth-token
        echo TWILIO_PHONE_NUMBER=your-twilio-phone-number
        echo.
        echo # PayID Integration ^(Optional^)
        echo PAYID_CLIENT_ID=your-payid-client-id
        echo PAYID_CLIENT_SECRET=your-payid-client-secret
        echo PAYID_ENVIRONMENT=sandbox
        echo.
        echo # Cloudinary ^(Optional^)
        echo CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
        echo CLOUDINARY_API_KEY=your-cloudinary-api-key
        echo CLOUDINARY_API_SECRET=your-cloudinary-api-secret
    ) > .env.local
    echo ⚠️  Created .env.local file. Please update with your actual credentials.
) else (
    echo ✅ Environment file already exists
)

:: Build the project
echo 📋 Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Project built successfully

:: Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📋 Installing Vercel CLI...
    call npm install -g vercel
)
echo ✅ Vercel CLI is ready

:: Create deployment script
echo 📋 Creating deployment script...
(
    echo @echo off
    echo echo 🚀 Deploying Flavor Entertainers Platform...
    echo.
    echo :: Build the project
    echo call npm run build
    echo if %%errorlevel%% neq 0 ^(
    echo     echo ❌ Build failed
    echo     pause
    echo     exit /b 1
    echo ^)
    echo.
    echo :: Deploy to Vercel
    echo call vercel --prod
    echo.
    echo echo ✅ Deployment complete!
    echo echo 🔗 Check your Vercel dashboard for the live URL
    echo pause
) > deploy.bat
echo ✅ Created deploy.bat script

:: Create development script
echo 📋 Creating development script...
(
    echo @echo off
    echo echo 🎭 Starting Flavor Entertainers Platform in development mode...
    echo.
    echo :: Check if .env.local exists
    echo if not exist .env.local ^(
    echo     echo ⚠️  .env.local not found. Please set up your environment variables first.
    echo     pause
    echo     exit /b 1
    echo ^)
    echo.
    echo :: Start the development server
    echo call npm run dev
) > dev.bat
echo ✅ Created dev.bat script

:: Create Supabase setup instructions
echo 📋 Creating Supabase setup instructions...
(
    echo # Supabase Database Setup Instructions
    echo.
    echo ## Step 1: Create Supabase Project
    echo 1. Go to https://supabase.com and create a new account
    echo 2. Create a new project
    echo 3. Wait for the project to be ready ^(~2 minutes^)
    echo.
    echo ## Step 2: Get Your Credentials
    echo 1. Go to Settings ^> API in your Supabase dashboard
    echo 2. Copy your Project URL and API keys
    echo 3. Update your .env.local file with these values
    echo.
    echo ## Step 3: Set Up Database
    echo 1. Go to SQL Editor in your Supabase dashboard
    echo 2. Copy and paste the contents of supabase/migrations/001_initial_schema.sql
    echo 3. Run the SQL script to create all tables and security policies
    echo.
    echo ## Step 4: Configure Storage
    echo 1. Go to Storage in your Supabase dashboard
    echo 2. Create a new bucket called 'performer-files'
    echo 3. Set the bucket to public for file access
    echo.
    echo ## Step 5: Enable Authentication
    echo 1. Go to Authentication ^> Settings in your Supabase dashboard
    echo 2. Enable email authentication
    echo 3. Optionally enable Google OAuth for social login
    echo.
    echo Your platform will be ready to use!
) > SUPABASE_SETUP.md
echo ✅ Created Supabase setup instructions

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo ✅ Flavor Entertainers Platform is ready!
echo.
echo 📋 Next Steps:
echo 1. Update .env.local with your actual credentials
echo 2. Follow SUPABASE_SETUP.md to set up your database
echo 3. Run 'dev.bat' to start development server
echo 4. Run 'deploy.bat' to deploy to production
echo.
echo 📖 Documentation: See README.md for detailed instructions
echo 🔗 Platform: http://localhost:3000 after starting dev server
echo.
pause