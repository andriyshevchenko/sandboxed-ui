#!/bin/bash

# Start the backend server
echo "Starting SecureVault backend server..."
cd server && node index.js &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Failed to start backend server"
    exit 1
fi

echo "Backend server started successfully (PID: $BACKEND_PID)"
echo "Backend API: http://localhost:3001"

# Start frontend server
echo "Starting frontend server..."
cd ..

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "Building frontend..."
    npm run build
fi

# Serve frontend using http-server or python
if command -v http-server &> /dev/null; then
    echo "Using http-server to serve frontend..."
    npx http-server dist -p 5000 -c-1
elif command -v python3 &> /dev/null; then
    echo "Using Python to serve frontend..."
    cd dist && python3 -m http.server 5000
else
    echo "Error: Neither http-server nor python3 is available"
    echo "Install http-server: npm install -g http-server"
    exit 1
fi
