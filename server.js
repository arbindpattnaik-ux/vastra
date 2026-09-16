const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 8000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vastra-admin-change-me';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ROOT = __dirname;
const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const sessions = new Set();

function send(response, status, body, contentType = 'application/json; charset=utf-8') {
  response.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
  response.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function isAuthenticated(request) {
  const token = (request.headers.authorization || '').replace('Bearer ', '');
  return token && sessions.has(token);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; if (body.length > 2_000_000) reject(new Error('Request too large')); });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/api/products' && request.method === 'GET') {
      return send(response, 200, JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8')));
    }
    if (url.pathname === '/api/login' && request.method === 'POST') {
      const { username, password } = JSON.parse(await readBody(request));
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return send(response, 401, { error: 'Invalid username or password' });
      const token = crypto.randomBytes(24).toString('hex');
      sessions.add(token);
      return send(response, 200, { token });
    }
    if (url.pathname === '/api/products' && request.method === 'PUT') {
      if (!isAuthenticated(request)) return send(response, 401, { error: 'Authentication required' });
      const products = JSON.parse(await readBody(request));
      if (!Array.isArray(products)) return send(response, 400, { error: 'Products must be an array' });
      fs.writeFileSync(path.join(ROOT, 'catalog.json'), `${JSON.stringify(products, null, 2)}\n`);
      return send(response, 200, { ok: true });
    }
    if (request.method !== 'GET') return send(response, 404, { error: 'Not found' });
    const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const filePath = path.resolve(ROOT, `.${requestedPath}`);
    if (!filePath.startsWith(ROOT)) return send(response, 403, { error: 'Forbidden' });
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return send(response, 404, 'Not found', 'text/plain; charset=utf-8');
    send(response, 200, fs.readFileSync(filePath), MIME_TYPES[path.extname(filePath)] || 'application/octet-stream');
  } catch (error) {
    send(response, 400, { error: error.message });
  }
});

server.listen(PORT, () => console.log(`Vastram running at http://localhost:${PORT}`));
