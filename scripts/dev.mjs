import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, normalize } from 'node:path';

const PORT = 3000;
const ROOT = process.cwd();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const server = createServer((req, res) => {
  let pathname = decodeURIComponent(req.url.split('?')[0] || '/');
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = normalize(join(ROOT, pathname));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  let body;
  try {
    body = readFileSync(file);
  } catch {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
  res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream' });
  res.end(body);
});

server.listen(PORT, () => console.log(`http://localhost:${PORT}`));