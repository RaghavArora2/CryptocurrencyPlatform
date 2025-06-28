import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    ws.isAlive = true;

    // Handle authentication
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth' && data.token) {
          jwt.verify(data.token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
              ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
              ws.close();
            } else {
              ws.userId = decoded.userId;
              ws.send(JSON.stringify({ type: 'auth_success' }));
              logger.info(`WebSocket authenticated for user: ${decoded.userId}`);
            }
          });
        }
      } catch (error) {
        logger.error('WebSocket message error:', error);
      }
    });

    // Handle pong responses
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      logger.info('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
  });

  // Ping clients every 30 seconds to keep connections alive
  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  logger.info('WebSocket server initialized');
}