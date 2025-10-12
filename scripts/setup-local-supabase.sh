#!/bin/bash

# LaunchBird Local Supabase Setup Script
# This script automates the setup of local Supabase for development

set -e  # Exit on error

echo "🚀 LaunchBird Local Supabase Setup"
echo "===================================="
echo ""

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please install and start Docker Desktop:"
    echo "  https://www.docker.com/products/docker-desktop"
    echo ""
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check if Supabase CLI is installed
echo "🔧 Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed!"
    echo ""
    echo "Installing Supabase CLI..."
    brew install supabase/tap/supabase
else
    echo "✅ Supabase CLI is installed ($(supabase --version))"
fi
echo ""

# Create .env.local if it doesn't exist
echo "📝 Setting up environment variables..."
if [ ! -f .env.local ]; then
    cat > .env.local << 'EOF'
# Supabase Local Development Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NODE_ENV=development
NEXT_PUBLIC_DISABLE_AUTH=false
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
EOF
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi
echo ""

# Start Supabase
echo "🎯 Starting Supabase..."
echo "   (First time may take 2-3 minutes to download Docker images)"
echo ""
supabase start
echo ""

# Wait a moment for services to be ready
sleep 2

# Display connection info
echo ""
echo "✅ Local Supabase is ready!"
echo ""
echo "📊 Access Points:"
echo "   API URL:    http://localhost:54321"
echo "   Studio URL: http://localhost:54323"
echo "   DB URL:     postgresql://postgres:postgres@localhost:54322/postgres"
echo ""
echo "🔐 Create test user for authentication:"
echo "   supabase auth create --email admin@launchbird.dev --password admin123"
echo ""
echo "📈 Optional: Open Supabase Studio"
echo "   open http://localhost:54323"
echo ""
echo "🚀 Start your Next.js app:"
echo "   npm run dev"
echo ""
echo "📚 Full documentation: LOCAL_SUPABASE_SETUP.md"
echo ""

