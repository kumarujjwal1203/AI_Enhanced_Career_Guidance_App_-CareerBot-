#!/bin/bash

# CareerBot Backend Quick Start Script

echo "🚀 CareerBot Backend Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check if MongoDB is installed
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "⚠️  MongoDB CLI not found"
    echo "Please ensure MongoDB is installed and running"
    echo ""
    echo "Install on macOS: brew install mongodb-community"
    echo "Install on Linux: https://docs.mongodb.com/manual/installation/"
    echo ""
fi

# Check if MongoDB is running
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running"
        echo "Start it with: brew services start mongodb-community (macOS)"
        echo "Or: sudo systemctl start mongod (Linux)"
        echo ""
    fi
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found, it should have been created"
    exit 1
fi

echo "✅ Configuration found (.env)"
echo ""

# Start the server
echo "🚀 Starting backend server..."
echo ""
echo "Server will run on: http://localhost:3000"
echo "Health check: http://localhost:3000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
