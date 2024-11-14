const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(protocol + '://' + window.location.host);
const cursors = new Map();

let userId;
window.onmouseout = (event) => {
  if (!event.relatedTarget && userId) {
    ws.send(JSON.stringify({ type: 'hide', userId }));
  }
}

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
    updateCursorPosition(cursor, data);
  } else if (data.type === 'hide') {
    if (cursors.has(data.userId)) {
      cursors.get(data.userId).style.display = 'none';
    }
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

function updateCursorPosition(cursor, data) {
  const size = 4 + (76 * data.y / window.innerHeight);

  cursor.style.left = data.x + 'px';
  cursor.style.top = data.y + 'px';
  cursor.style.display = 'block';

  cursor.style.width = size + 'px';
  cursor.style.height = size + 'px';

}
