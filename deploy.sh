#!/bin/bash

# AssessForge Quick Deployment Script
# This script demonstrates various deployment options

set -e

echo "🚀 AssessForge Deployment Options"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo
echo "Select deployment method:"
echo "1) Docker (recommended)"
echo "2) Traditional Node.js"
echo "3) PM2 Process Manager"
echo "4) Check deployment readiness"
echo "5) Test health endpoint"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🐳 Docker Deployment"
        echo "===================="
        if command_exists docker; then
            echo "Building Docker image..."
            docker build -t assessforge .
            echo "Starting container..."
            docker run -d -p 3000:3000 --name assessforge-app assessforge
            echo "✅ AssessForge is running at http://localhost:3000"
            echo "📊 Health check: http://localhost:3000/api/health"
        else
            echo "❌ Docker is not installed. Please install Docker first."
        fi
        ;;
    2)
        echo "🟢 Traditional Node.js Deployment"
        echo "================================="
        echo "Installing dependencies..."
        npm ci --only=production
        echo "Building application..."
        npm run build
        echo "Starting production server..."
        echo "✅ Run 'npm start' to start the server"
        echo "📊 Health check will be available at http://localhost:3000/api/health"
        ;;
    3)
        echo "⚡ PM2 Process Manager Deployment"
        echo "================================"
        if command_exists pm2; then
            npm ci --only=production
            npm run build
            pm2 start ecosystem.config.js
            echo "✅ AssessForge is running with PM2"
            echo "📊 Check status: pm2 status"
            echo "📊 Health check: http://localhost:3000/api/health"
        else
            echo "❌ PM2 is not installed. Installing..."
            npm install -g pm2
            echo "✅ PM2 installed. Run this script again."
        fi
        ;;
    4)
        echo "🔍 Deployment Readiness Check"
        echo "============================"
        
        # Check Node.js version
        if command_exists node; then
            NODE_VERSION=$(node -v | sed 's/v//')
            echo "✅ Node.js: $NODE_VERSION"
            if [[ "$NODE_VERSION" < "18.17.0" ]]; then
                echo "⚠️  Warning: Node.js 18.17.0 or higher recommended"
            fi
        else
            echo "❌ Node.js not found"
        fi
        
        # Check npm
        if command_exists npm; then
            echo "✅ npm: $(npm -v)"
        else
            echo "❌ npm not found"
        fi
        
        # Check package.json
        if [ -f "package.json" ]; then
            echo "✅ package.json exists"
        else
            echo "❌ package.json not found"
        fi
        
        # Check dependencies
        if [ -d "node_modules" ]; then
            echo "✅ Dependencies installed"
        else
            echo "⚠️  Dependencies not installed. Run 'npm install'"
        fi
        
        # Check if built
        if [ -d ".next" ]; then
            echo "✅ Application built"
        else
            echo "⚠️  Application not built. Run 'npm run build'"
        fi
        
        echo
        echo "📋 Requirements Summary:"
        echo "- Node.js 18.17.0+ ✅"
        echo "- No database required ✅"
        echo "- No file storage required ✅"
        echo "- Memory: 512MB minimum, 1GB recommended"
        echo "- Storage: ~200MB for application files"
        ;;
    5)
        echo "🏥 Testing Health Endpoint"
        echo "========================="
        if command_exists curl; then
            echo "Testing health endpoint..."
            if curl -f -s http://localhost:3000/api/health > /dev/null; then
                echo "✅ Health endpoint is working"
                curl -s http://localhost:3000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:3000/api/health
            else
                echo "❌ Health endpoint not responding. Is the server running?"
                echo "💡 Start the server with: npm start"
            fi
        else
            echo "❌ curl not found. Please install curl or test manually:"
            echo "   Visit: http://localhost:3000/api/health"
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo
echo "📚 For complete deployment guide, see: DEPLOYMENT.md"
echo "🌐 Application URL: http://localhost:3000"
echo "💻 AssessForge - Stateless, Database-free, Ready to Deploy!"