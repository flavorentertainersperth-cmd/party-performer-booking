#!/bin/bash

# Flavor Entertainers Platform Setup Script
# This script sets up the complete platform with all required services

set -e

echo "🎭 Setting up Flavor Entertainers Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js $NODE_VERSION is installed"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Create environment file if it doesn't exist
setup_environment() {
    print_step "Setting up environment variables..."

    if [ ! -f .env.local ]; then
        cp .env.example .env.local 2>/dev/null || cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# PayID Integration (Optional)
PAYID_CLIENT_ID=your-payid-client-id
PAYID_CLIENT_SECRET=your-payid-client-secret
PAYID_ENVIRONMENT=sandbox

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EOF
        print_warning "Created .env.local file. Please update with your actual credentials."
    else
        print_success "Environment file already exists"
    fi
}

# Setup Supabase
setup_supabase() {
    print_step "Setting up Supabase..."

    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        print_warning "Installing Supabase CLI..."
        npm install -g supabase
    fi

    # Initialize Supabase if not already done
    if [ ! -f supabase/config.toml ]; then
        print_step "Initializing Supabase project..."
        supabase init
    fi

    print_success "Supabase setup complete"
    print_warning "Remember to:"
    echo "  1. Create a new project at https://supabase.com"
    echo "  2. Run the database migration: supabase/migrations/001_initial_schema.sql"
    echo "  3. Update your .env.local with the project URL and keys"
}

# Build the project
build_project() {
    print_step "Building the project..."
    npm run build
    print_success "Project built successfully"
}

# Setup Vercel deployment
setup_vercel() {
    print_step "Setting up Vercel deployment..."

    if ! command -v vercel &> /dev/null; then
        print_warning "Installing Vercel CLI..."
        npm install -g vercel
    fi

    print_success "Vercel CLI installed"
    print_warning "To deploy:"
    echo "  1. Run: vercel login"
    echo "  2. Run: vercel --prod"
    echo "  3. Set environment variables in Vercel dashboard"
}

# Create deployment script
create_deploy_script() {
    print_step "Creating deployment script..."

    cat > deploy.sh << 'EOF'
#!/bin/bash
# Quick deployment script for Flavor Entertainers Platform

echo "🚀 Deploying Flavor Entertainers Platform..."

# Build the project
npm run build

# Deploy to Vercel
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Check your Vercel dashboard for the live URL"
EOF

    chmod +x deploy.sh
    print_success "Created deploy.sh script"
}

# Create development script
create_dev_script() {
    print_step "Creating development script..."

    cat > dev.sh << 'EOF'
#!/bin/bash
# Development server script for Flavor Entertainers Platform

echo "🎭 Starting Flavor Entertainers Platform in development mode..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Please set up your environment variables first."
    exit 1
fi

# Start the development server
npm run dev
EOF

    chmod +x dev.sh
    print_success "Created dev.sh script"
}

# Main setup function
main() {
    echo "🎭 Flavor Entertainers Platform Setup"
    echo "======================================"

    check_node
    install_dependencies
    setup_environment
    setup_supabase
    build_project
    setup_vercel
    create_deploy_script
    create_dev_script

    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    print_success "Flavor Entertainers Platform is ready!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update .env.local with your actual credentials"
    echo "2. Set up your Supabase project and run the database migration"
    echo "3. Run './dev.sh' to start development server"
    echo "4. Run './deploy.sh' to deploy to production"
    echo ""
    echo "📖 Documentation: See README.md for detailed instructions"
    echo "🔗 Live Demo: Visit your Vercel URL after deployment"
    echo ""
}

# Run the main function
main