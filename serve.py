#!/usr/bin/env python3
"""
Simple HTTP server for serving the TechBot frontend
Usage: python3 serve.py
"""

import http.server
import socketserver
import os
import webbrowser
from threading import Timer

PORT = 8000  # Changed from 8080 to 8000
HOST = "127.0.0.1"  # Using IP instead of localhost

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers to prevent caching during development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

def open_browser():
    """Open the browser after a short delay"""
    webbrowser.open(f'http://{HOST}:{PORT}/frontend.html')

def main():
    # Change to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        # Allow port reuse
        socketserver.TCPServer.allow_reuse_address = True
        
        with socketserver.TCPServer((HOST, PORT), MyHTTPRequestHandler) as httpd:
            print(f"🚀 TechBot Server running at http://{HOST}:{PORT}")
            print(f"📄 Open http://{HOST}:{PORT}/frontend.html in your browser")
            print("📛 Press Ctrl+C to stop the server")
            
            # Open browser after 1 second
            Timer(1, open_browser).start()
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n👋 Server stopped.")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use!")
            print("Try one of these options:")
            print(f"1. Kill the process using port {PORT}: lsof -ti:{PORT} | xargs kill -9")
            print("2. Use a different port by editing PORT in serve.py")
            print("3. Simply open the HTML file directly: open frontend.html")
        else:
            print(f"❌ Error starting server: {e}")
            print("Try opening the HTML file directly: open frontend.html")

if __name__ == "__main__":
    main()