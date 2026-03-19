from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from urllib.parse import urlparse, parse_qs

STATUS_FILE = 'data/status.json'

def get_status():
    if not os.path.exists(STATUS_FILE):
        return {"is_open": True, "closed_message": "Temporarily Closed"}
    with open(STATUS_FILE, 'r') as f:
        return json.load(f)

def save_status(status):
    with open(STATUS_FILE, 'w') as f:
        json.dump(status, f, indent=4)

class BarbershopHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        if self.path == '/':
            self.serve_file('templates/index.html', 'text/html')
        elif self.path.startswith('/static/'):
            content_type = 'text/css' if self.path.endswith('.css') else 'application/javascript'
            self.serve_file(self.path[1:], content_type)
        elif self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(get_status()).encode())
        else:
            self.send_error(404)

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)

        if self.path == '/api/status':
            status = get_status()
            if 'is_open' in data:
                status['is_open'] = data['is_open']
            if 'closed_message' in data:
                status['closed_message'] = data['closed_message']
            save_status(status)
            self.send_json({"success": True, "status": status})
        elif self.path == '/api/book':
            bank = data.get('bank', 'kicb')
            payment_url = f"https://mock-payment-gateway.com/{bank}?amount=400&to=AminURJ"
            self.send_json({
                "success": True, 
                "message": "Redirecting...", 
                "payment_url": payment_url
            })
        else:
            self.send_error(404)

    def serve_file(self, file_path, content_type):
        try:
            with open(file_path, 'rb') as f:
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.end_headers()
                self.wfile.write(f.read())
        except FileNotFoundError:
            self.send_error(404)

    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 5000), BarbershopHandler)
    print("Server running on port 5000...")
    server.serve_forever()
