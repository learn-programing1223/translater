#!/bin/bash

# Simple script to run the TechBot frontend

echo "🚀 Starting TechBot Server..."
echo ""
echo "Choose an option:"
echo "1) Open directly in browser (no server needed)"
echo "2) Run with Python 3 server (port 8000)"
echo "3) Run with Python 2 server (port 8000)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "Opening frontend.html directly in your default browser..."
        open frontend.html
        ;;
    2)
        echo "Starting Python 3 server on http://localhost:8000"
        echo "Press Ctrl+C to stop the server"
        open http://localhost:8000/frontend.html &
        python3 -m http.server 8000
        ;;
    3)
        echo "Starting Python 2 server on http://localhost:8000"
        echo "Press Ctrl+C to stop the server"
        open http://localhost:8000/frontend.html &
        python -m SimpleHTTPServer 8000
        ;;
    *)
        echo "Invalid choice. Opening directly in browser..."
        open frontend.html
        ;;
esac