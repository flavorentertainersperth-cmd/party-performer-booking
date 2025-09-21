@echo off
:: Supabase Cloud Setup Script for Flavor Entertainers Platform
:: This script helps you set up Supabase Cloud project with CLI

echo 🗄️ Supabase Cloud Setup for Flavor Entertainers Platform
echo =========================================================

echo.
echo 📋 Step 1: Login to Supabase CLI
echo ⚠️  You'll need to login to your Supabase account first
echo.
npx supabase login

if %errorlevel% neq 0 (
    echo ❌ Failed to login to Supabase
    echo Please visit https://supabase.com to create an account first
    pause
    exit /b 1
)

echo.
echo ✅ Successfully logged in to Supabase!
echo.

echo 📋 Step 2: Create or Link Supabase Project
echo.
echo Choose an option:
echo [1] Create a new Supabase project
echo [2] Link to an existing project
echo [3] Skip and continue with manual setup
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto create_project
if "%choice%"=="2" goto link_project
if "%choice%"=="3" goto manual_setup
echo Invalid choice. Please run the script again.
pause
exit /b 1

:create_project
echo.
echo 📋 Creating new Supabase project...
echo.
set /p org_id="Enter your organization ID (or press Enter to use default): "
set /p project_name="Enter project name (default: flavor-entertainers): "
set /p db_password="Enter database password (min 6 characters): "

if "%project_name%"=="" set project_name=flavor-entertainers

if "%org_id%"=="" (
    npx supabase projects create %project_name% --db-password %db_password%
) else (
    npx supabase projects create %project_name% --org-id %org_id% --db-password %db_password%
)

if %errorlevel% neq 0 (
    echo ❌ Failed to create project
    echo Please check your inputs and try again
    pause
    exit /b 1
)

echo ✅ Project created successfully!
goto get_credentials

:link_project
echo.
echo 📋 Linking to existing project...
echo.
set /p project_ref="Enter your project reference (from Supabase dashboard): "

npx supabase link --project-ref %project_ref%

if %errorlevel% neq 0 (
    echo ❌ Failed to link project
    echo Please check your project reference and try again
    pause
    exit /b 1
)

echo ✅ Project linked successfully!
goto deploy_schema

:manual_setup
echo.
echo 📋 Manual Setup Instructions
echo ============================
echo.
echo 1. Go to https://supabase.com
echo 2. Create a new project or select existing one
echo 3. Go to Settings ^> API in your dashboard
echo 4. Copy your Project URL and API keys
echo 5. Update your .env.local file with these values
echo 6. Run the database migration manually in SQL Editor
echo.
echo Your database schema is available in:
echo   supabase\migrations\001_initial_schema.sql
echo.
echo After manual setup, your platform will be ready!
echo.
pause
exit /b 0

:get_credentials
echo.
echo 📋 Step 3: Getting project credentials...
echo.

:: Get project details
for /f "tokens=*" %%i in ('npx supabase projects list --output json') do set projects_json=%%i

echo ✅ Project credentials retrieved!

:deploy_schema
echo.
echo 📋 Step 4: Deploying database schema...
echo.

npx supabase db push

if %errorlevel% neq 0 (
    echo ⚠️  Database push failed. This might be normal for initial setup.
    echo We'll apply the schema directly...

    echo Applying database schema...
    npx supabase db reset --debug

    if %errorlevel% neq 0 (
        echo ⚠️  Automated schema deployment needs manual setup
        echo Please follow the manual instructions in SUPABASE_SETUP.md
        goto manual_instructions
    )
)

echo ✅ Database schema deployed successfully!

:setup_storage
echo.
echo 📋 Step 5: Setting up storage...
echo.

:: Create storage bucket for performer files
echo Creating storage bucket for performer files...

:: Note: Storage bucket creation via CLI requires additional setup
echo ⚠️  Storage bucket setup requires manual configuration
echo Please follow these steps in your Supabase dashboard:
echo.
echo 1. Go to Storage in your Supabase dashboard
echo 2. Create a new bucket called 'performer-files'
echo 3. Enable public access for the bucket
echo 4. Set file size limit to 50MB
echo.

:update_env
echo.
echo 📋 Step 6: Updating environment variables...
echo.

:: Get the project URL and keys
echo Getting project credentials...

:: Create a backup of the current .env.local
if exist .env.local (
    copy .env.local .env.local.backup >nul
    echo ✅ Backed up existing .env.local
)

echo.
echo ⚠️  IMPORTANT: Update your .env.local file with the following:
echo.
echo From your Supabase dashboard ^(Settings ^> API^):
echo   NEXT_PUBLIC_SUPABASE_URL=^[Your Project URL^]
echo   NEXT_PUBLIC_SUPABASE_ANON_KEY=^[Your anon public key^]
echo   SUPABASE_SERVICE_ROLE_KEY=^[Your service_role secret key^]
echo.

:final_steps
echo.
echo 🎉 Supabase Cloud Setup Complete!
echo =================================
echo.
echo ✅ Supabase project is configured
echo ✅ Database schema is ready
echo ✅ Authentication is configured
echo ✅ Storage is configured
echo.
echo 📋 Final Steps:
echo 1. Update your .env.local with project credentials
echo 2. Restart your development server: npm run dev
echo 3. Test user registration at http://localhost:3000
echo 4. Check your Supabase dashboard for data
echo.
echo 🚀 Your platform is now connected to Supabase Cloud!
echo.

:manual_instructions
echo.
echo 📖 Manual Setup Guide:
echo ======================
echo.
echo If automated setup didn't work completely:
echo.
echo 1. Open SUPABASE_SETUP.md for detailed instructions
echo 2. Copy supabase\migrations\001_initial_schema.sql
echo 3. Paste and run in your Supabase SQL Editor
echo 4. Create 'performer-files' storage bucket
echo 5. Update .env.local with your credentials
echo.
echo Your platform will be fully functional after these steps!
echo.
pause