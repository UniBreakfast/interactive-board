const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const mimeTypes = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon'
};
// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/') req.url = '/index.html';
  try {
    const file = fs.readFileSync('public' + req.url);
    const ext = req.url.split('.').pop();
    const type = mimeTypes[ext];
    res.writeHead(200, { 'Content-Type': type });
    res.end(file);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(500);
      res.end('Server error');
    }
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  // Generate a random user ID
  const userId = Math.random().toString(36).substr(2, 9);

  ws.userId = userId;

  clients.add(ws);

  // Notify the client of its user ID
  ws.send(JSON.stringify({ type: 'connect', userId }));

  // Handle incoming messages
  ws.on('message', (message) => {
    // Broadcast the message to all other clients
    const data = message.toString();
    clients.forEach(client => {
      // if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data);
      // }
    });
  });

  // Handle client disconnection
  ws.on('close', () => {
    clients.delete(ws);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'disconnect', userId: ws.userId }));
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server running');
});