const WebSocket = require('ws');

const BASE_PORT = 6505;
const MAX_PORT = 6514;
const servers = [];
const clients = [];

function startServer(port) {
  const wss = new WebSocket.Server({ port: port });
  
  wss.on('connection', function(ws) {
    console.log('[MCP Server] New connection on port ' + port);
    clients.push({ port, ws });
    
    ws.on('message', function(message) {
      const msg = message.toString();
      console.log('[MCP Server] Received on port ' + port + ': ' + msg.substring(0, 100) + '...');
      
      try {
        const data = JSON.parse(msg);
        if (data.method === 'ping') {
          ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'pong', params: {} }));
        } else {
          ws.send(JSON.stringify({ 
            jsonrpc: '2.0', 
            id: data.id, 
            result: { message: 'Command received' } 
          }));
        }
      } catch (e) {
        console.log('[MCP Server] Parse error: ' + e.message);
        ws.send(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }));
      }
    });

    ws.on('close', function() {
      console.log('[MCP Server] Connection closed on port ' + port);
      const index = clients.findIndex(c => c.port === port && c.ws === ws);
      if (index > -1) clients.splice(index, 1);
    });

    ws.on('error', function(err) {
      console.log('[MCP Server] Error on port ' + port + ': ' + err.message);
    });
  });

  wss.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      console.log('[MCP Server] Port ' + port + ' is already in use, skipping...');
    } else {
      console.log('[MCP Server] Error starting server on port ' + port + ': ' + err.message);
    }
  });

  wss.on('listening', function() {
    console.log('[MCP Server] Listening on port ' + port);
    servers.push({ port, server: wss });
  });
}

for (let port = BASE_PORT; port <= MAX_PORT; port++) {
  startServer(port);
}

console.log('[MCP Server] Ready - listening on ports ' + BASE_PORT + '-' + MAX_PORT);
