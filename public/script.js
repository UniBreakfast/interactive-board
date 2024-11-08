const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(protocol + '://' + window.location.host);
const cursors = new Map();

let userId;

// Handle WebSocket connection
ws.onopen = () => {
  // Track mouse movement
  document.addEventListener('mousemove', (e) => {
    const data = {
      type: 'mousemove',
      userId: userId,
      x: e.clientX,
      y: e.clientY
    };
    ws.send(JSON.stringify(data));
  });
};


// Handle incoming messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'mousemove') {
    // Create or update cursor for other users
    if (!cursors.has(data.userId)) {
      const cursor = document.createElement('div');
      cursor.className = 'cursor';
      document.body.appendChild(cursor);
      cursors.set(data.userId, cursor);
    }

    const cursor = cursors.get(data.userId);
    cursor.style.left = data.x + 'px';
    cursor.style.top = data.y + 'px';
  } else if (data.type === 'connect') {
    userId = data.userId;
  } else if (data.type === 'disconnect') {
    if (cursors.has(data.userId)) {
      cursors.get(data.userId).remove();
      cursors.delete(data.userId);
    }
  }
};

// Clean up disconnected users
ws.onclose = () => {
  cursors.forEach(cursor => cursor.remove());
  cursors.clear();
};