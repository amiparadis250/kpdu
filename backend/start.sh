#!/bin/bash

echo "🚀 Starting KMPDU E-Voting Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Start development server
echo "🎯 Starting development server..."
npm run dev