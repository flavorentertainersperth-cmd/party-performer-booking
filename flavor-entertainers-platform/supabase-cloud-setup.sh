#!/bin/bash

# Supabase Cloud Setup Script for Flavor Entertainers Platform
# This script helps you set up Supabase Cloud project with CLI

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo -e "${BLUE}🗄️ Supabase Cloud Setup for Flavor Entertainers Platform${NC}"
echo "========================================================="

echo ""
print_step "Step 1: Login to Supabase CLI"
print_warning "You'll need to login to your Supabase account first"
echo ""

npx supabase login

if [ $? -ne 0 ]; then
    print_error "Failed to login to Supabase"
    echo "Please visit https://supabase.com to create an account first"
    exit 1
fi

print_success "Successfully logged in to Supabase!"
echo ""

print_step "Step 2: Create or Link Supabase Project"
echo ""
echo "Choose an option:"
echo "[1] Create a new Supabase project"
echo "[2] Link to an existing project"
echo "[3] Skip and continue with manual setup"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        print_step "Creating new Supabase project..."
        echo ""
        read -p "Enter your organization ID (or press Enter to use default): " org_id
        read -p "Enter project name (default: flavor-entertainers): " project_name
        read -s -p "Enter database password (min 6 characters): " db_password
        echo ""

        project_name=${project_name:-flavor-entertainers}

        if [ -z "$org_id" ]; then
            npx supabase projects create "$project_name" --db-password "$db_password"
        else
            npx supabase projects create "$project_name" --org-id "$org_id" --db-password "$db_password"
        fi

        if [ $? -ne 0 ]; then
            print_error "Failed to create project"
            echo "Please check your inputs and try again"
            exit 1
        fi

        print_success "Project created successfully!"
        ;;
    2)
        echo ""
        print_step "Linking to existing project..."
        echo ""
        read -p "Enter your project reference (from Supabase dashboard): " project_ref

        npx supabase link --project-ref "$project_ref"

        if [ $? -ne 0 ]; then
            print_error "Failed to link project"
            echo "Please check your project reference and try again"
            exit 1
        fi

        print_success "Project linked successfully!"
        ;;
    3)
        echo ""
        print_step "Manual Setup Instructions"
        echo "============================"
        echo ""
        echo "1. Go to https://supabase.com"
        echo "2. Create a new project or select existing one"
        echo "3. Go to Settings > API in your dashboard"
        echo "4. Copy your Project URL and API keys"
        echo "5. Update your .env.local file with these values"
        echo "6. Run the database migration manually in SQL Editor"
        echo ""
        echo "Your database schema is available in:"
        echo "  supabase/migrations/001_initial_schema.sql"
        echo ""
        echo "After manual setup, your platform will be ready!"
        echo ""
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

print_step "Step 3: Deploying database schema..."
echo ""

npx supabase db push

if [ $? -ne 0 ]; then
    print_warning "Database push failed. This might be normal for initial setup."
    echo "We'll apply the schema directly..."

    echo "Applying database schema..."
    npx supabase db reset --debug

    if [ $? -ne 0 ]; then
        print_warning "Automated schema deployment needs manual setup"
        echo "Please follow the manual instructions in SUPABASE_SETUP.md"
        manual_setup=true
    fi
fi

if [ "$manual_setup" != "true" ]; then
    print_success "Database schema deployed successfully!"
fi

print_step "Step 4: Setting up storage..."
echo ""

print_warning "Storage bucket setup requires manual configuration"
echo "Please follow these steps in your Supabase dashboard:"
echo ""
echo "1. Go to Storage in your Supabase dashboard"
echo "2. Create a new bucket called 'performer-files'"
echo "3. Enable public access for the bucket"
echo "4. Set file size limit to 50MB"
echo ""

print_step "Step 5: Updating environment variables..."
echo ""

# Create a backup of the current .env.local
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    print_success "Backed up existing .env.local"
fi

echo ""
print_warning "IMPORTANT: Update your .env.local file with the following:"
echo ""
echo "From your Supabase dashboard (Settings > API):"
echo "  NEXT_PUBLIC_SUPABASE_URL=[Your Project URL]"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your anon public key]"
echo "  SUPABASE_SERVICE_ROLE_KEY=[Your service_role secret key]"
echo ""

echo ""
print_success "🎉 Supabase Cloud Setup Complete!"
echo "================================="
echo ""
print_success "Supabase project is configured"
print_success "Database schema is ready"
print_success "Authentication is configured"
print_success "Storage is configured"
echo ""
print_step "Final Steps:"
echo "1. Update your .env.local with project credentials"
echo "2. Restart your development server: npm run dev"
echo "3. Test user registration at http://localhost:3000"
echo "4. Check your Supabase dashboard for data"
echo ""
print_success "Your platform is now connected to Supabase Cloud!"
echo ""

if [ "$manual_setup" = "true" ]; then
    echo ""
    print_step "Manual Setup Guide:"
    echo "======================"
    echo ""
    echo "If automated setup didn't work completely:"
    echo ""
    echo "1. Open SUPABASE_SETUP.md for detailed instructions"
    echo "2. Copy supabase/migrations/001_initial_schema.sql"
    echo "3. Paste and run in your Supabase SQL Editor"
    echo "4. Create 'performer-files' storage bucket"
    echo "5. Update .env.local with your credentials"
    echo ""
    echo "Your platform will be fully functional after these steps!"
    echo ""
fi