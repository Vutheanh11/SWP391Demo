#!/usr/bin/env python3
"""
HTTP Server for ElectroMove Admin Dashboard with API Proxy
Serves static files and proxies API calls t        print        print(f"📍 Server running at: http://localhost:{PORT}")
        print(f"🔐 Login Page: http://localhost:{PORT}/login.html")
        print(f"🔗 Admin Dashboard: http://localhost:{PORT}/admin.html")
        print(f"🔌 API Proxy: http://localhost:{PORT}/api/customers")
        print(f"🔋 Stations API: http://localhost:{PORT}/api/stations")
        print(f"💰 Price Table API: http://localhost:{PORT}/api/pricetable")
        print(f"⚡ Sessions API: http://localhost:{PORT}/api/sessions")
        print(f"🚗 Vehicles API: http://localhost:{PORT}/api/vehicles")
        print(f"❤️  Health Check: http://localhost:{PORT}/api/health")
        print("=" * 70)erver running at: http://localhost:{PORT}")
        print(f"🔐 Login Page: http://localhost:{PORT}/login.html")
        print(f"🔗 Admin Dashboard: http://localhost:{PORT}/admin.html")
        print(f"🔌 API Proxy: http://localhost:{PORT}/api/customers")
        print(f"🔋 Stations API: http://localhost:{PORT}/api/stations")
        print(f"💰 Price Table API: http://localhost:{PORT}/api/pricetable")
        print(f"❤️  Health Check: http://localhost:{PORT}/api/health")
        print("=" * 70) CORS issues
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import urllib.request
import urllib.parse
import json
from pathlib import Path

PORT = 3000
DIRECTORY = Path(__file__).parent
API_BASE_URL = "https://swp391.up.railway.app"

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        # Handle API proxy requests
        if self.path.startswith('/api/'):
            self.handle_api_request()
            return
            
        # Redirect root path to login.html
        if self.path == '/' or self.path == '':
            self.send_response(302)
            self.send_header('Location', '/index.html')
            self.end_headers()
            return
        
        # Call parent method for static files
        super().do_GET()
    
    def handle_api_request(self):
        """Proxy API requests to the external API"""
        try:
            # Extract the API endpoint from the path
            api_path = self.path.replace('/api', '')
            
            # Map local API paths to external API
            if api_path == '/customers' or api_path == '/customer':
                # External API updated to /api/customer (singular)
                external_url = f"{API_BASE_URL}/api/customer"
            elif api_path == '/stations' or api_path == '/chargingstations':
                # New external stations endpoint
                external_url = f"{API_BASE_URL}/api/chargingstation/all"
            elif api_path == '/pricetable' or api_path == '/prices':
                # Price table endpoint
                external_url = f"{API_BASE_URL}/api/pricetable"
            elif api_path == '/pricetable':
                # Price table endpoint for Price Management
                external_url = f"{API_BASE_URL}/api/pricetable"
            elif api_path == '/sessions' or api_path == '/chargingsessions':
                # Charging sessions endpoint for Reports
                external_url = f"{API_BASE_URL}/api/chargingsession/all"
            elif api_path == '/vehicles':
                # Vehicles endpoint for Reports
                external_url = f"{API_BASE_URL}/api/vehicle/all"
            elif api_path == '/health':
                # Health check for our proxy
                self.send_json_response({"status": "ok", "message": "API proxy is working"})
                return
            else:
                self.send_error(404, "API endpoint not found")
                return
            
            print(f"[API Proxy] Fetching: {external_url}")
            
            # Make request to external API
            with urllib.request.urlopen(external_url) as response:
                data = response.read()
                
            # Send successful response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(data)
            
            print(f"[API Proxy] Successfully proxied: {external_url}")
            
        except urllib.error.HTTPError as e:
            print(f"[API Proxy] HTTP Error {e.code}: {e.reason}")
            self.send_json_response({
                "error": f"API Error: {e.code} - {e.reason}",
                "external_url": external_url
            }, status_code=e.code)
            
        except urllib.error.URLError as e:
            print(f"[API Proxy] URL Error: {e.reason}")
            self.send_json_response({
                "error": f"Connection Error: {e.reason}",
                "external_url": external_url
            }, status_code=503)
            
        except Exception as e:
            print(f"[API Proxy] Unexpected Error: {str(e)}")
            self.send_json_response({
                "error": f"Server Error: {str(e)}",
                "external_url": external_url
            }, status_code=500)
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with proper headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def end_headers(self):
        # Add CORS headers to allow API calls
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight CORS requests
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        # Custom log format
        print(f"[Server] {format % args}")

def main():
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print("=" * 70)
        print("ElectroMove Login & Admin Server with API Proxy")
        print("=" * 70)
        print(f"📍 Server running at: http://localhost:{PORT}")
        print(f"🔗 Admin Dashboard: http://localhost:{PORT}/admin.html")
        print(f"🔗 Login Page: http://localhost:{PORT}/index.html")
        print(f"🔌 API Proxy: http://localhost:{PORT}/api/customers")
        print(f"🔋 Stations API: http://localhost:{PORT}/api/stations")
        print(f"💰 Price API: http://localhost:{PORT}/api/pricetable")
        print(f"❤️  Health Check: http://localhost:{PORT}/api/health")
        print("=" * 70)
        print(f"External API: {API_BASE_URL}")
        print("Press Ctrl+C to stop the server")
        print("=" * 70)
        
        # Automatically open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}/index.html')
            print("🌐 Opening browser...")
        except:
            print("⚠️  Please manually open: http://localhost:{PORT}/index.html")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped by user")
            print("Goodbye!")

if __name__ == "__main__":
    main()