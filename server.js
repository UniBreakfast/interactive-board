const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/') req.url = '/index.html';
  try {
    const file = fs.readFileSync('public' + req.url);
    res.writeHead(200);
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
  clients.add(ws);

  // Handle incoming messages
  ws.on('message', (message) => {
    // Broadcast the message to all other clients
    const data = message.toString();
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  // Handle client disconnection
  ws.on('close', () => {
    clients.delete(ws);
  });
});

server.listen(3000, () => {
  console.log('Server running');
});