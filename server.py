import hashlib
import json
import os
import secrets
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent
PORT = int(os.environ.get('PORT', '8000'))
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'vastra-admin-change-me')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
SESSIONS = set()
MIME_TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8'}

class Handler(BaseHTTPRequestHandler):
    def send_json(self, status, data):
        payload = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(payload)

    def read_json(self):
        length = int(self.headers.get('Content-Length', '0'))
        return json.loads(self.rfile.read(length))

    def authenticated(self):
        return self.headers.get('Authorization', '').replace('Bearer ', '') in SESSIONS

    def do_GET(self):
        if self.path == '/api/products':
            self.send_json(200, json.loads((ROOT / 'catalog.json').read_text(encoding='utf-8')))
            return
        file_path = ROOT / ('index.html' if self.path == '/' else self.path.lstrip('/'))
        if not file_path.resolve().is_relative_to(ROOT.resolve()) or not file_path.is_file():
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-Type', MIME_TYPES.get(file_path.suffix, 'application/octet-stream'))
        self.end_headers()
        self.wfile.write(file_path.read_bytes())

    def do_POST(self):
        if self.path != '/api/login':
            self.send_error(404)
            return
        credentials = self.read_json()
        username = credentials.get('username', '')
        password = credentials.get('password', '')
        valid_username = secrets.compare_digest(username.encode(), ADMIN_USERNAME.encode())
        valid_password = secrets.compare_digest(hashlib.sha256(password.encode()).digest(), hashlib.sha256(ADMIN_PASSWORD.encode()).digest())
        if not valid_username or not valid_password:
            self.send_json(401, {'error': 'Invalid username or password'})
            return
        token = secrets.token_hex(24)
        SESSIONS.add(token)
        self.send_json(200, {'token': token})

    def do_PUT(self):
        if self.path != '/api/products' or not self.authenticated():
            self.send_json(401, {'error': 'Authentication required'})
            return
        products = self.read_json()
        if not isinstance(products, list):
            self.send_json(400, {'error': 'Products must be an array'})
            return
        (ROOT / 'catalog.json').write_text(json.dumps(products, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        self.send_json(200, {'ok': True})

    def log_message(self, format, *args):
        return

print(f'Vastram running at http://localhost:{PORT}')
ThreadingHTTPServer(('', PORT), Handler).serve_forever()
