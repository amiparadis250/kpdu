@echo off
echo 🚀 Starting KMPDU E-Voting Backend with Auto-Restart...

REM Check if .env exists
if not exist .env (
    echo ❌ .env file not found. Please create one based on README.md
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npm run db:generate

REM Start development server with auto-restart
echo 🎯 Starting development server with auto-restart...
echo 📝 Server will auto-restart on file changes
echo 🌐 API Documentation: http://localhost:5000/api-docs
echo 💾 Database Studio: npm run db:studio
echo.
npm run dev