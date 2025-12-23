#!/bin/bash

# 01Blog - Startup Script

echo "🚀 Starting 01Blog Platform..."

# 1. Kill any existing processes on ports 8080 (Spring) and 4200 (Angular)
echo "🧹 Cleaning up existing processes on ports 8080 and 4200..."
fuser -k 8080/tcp > /dev/null 2>&1
fuser -k 4200/tcp > /dev/null 2>&1

# 2. Start Database (Docker)
echo "🐳 Starting Database (Docker)..."
docker-compose up -d db
echo "⏳ Waiting for database to be ready..."
sleep 5 # Simple wait, ideally use a healthcheck loop

# 3. Start Backend (Spring Boot)
echo "☕ Starting Backend (Spring Boot)..."
./mvnw spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!

# 3. Start Frontend (Angular)
echo "🅰️ Starting Frontend (Angular)..."
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!

echo "--------------------------------------------------------"
echo "✅ Applications are starting in the background!"
echo ""
echo "🌐 Frontend: http://localhost:4200"
echo "⚙️  Backend API: http://localhost:8080"
echo ""
echo "📝 Logs are being written to:"
echo "   - backend.log"
echo "   - frontend.log"
echo ""
echo "💡 Press Ctrl+C to stop both processes (if running in foreground)"
echo "   or use 'kill $BACKEND_PID $FRONTEND_PID' to stop them later."
echo "--------------------------------------------------------"

# Handle Ctrl+C to kill background processes
trap "kill $BACKEND_PID $FRONTEND_PID; echo '🛑 Shutdown complete.'; exit" INT

# Keep the script running to monitor background processes
wait
