
import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { Bot } from '@shared/schema';
import { storage } from './storage';

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    // Send initial data
    const sendUpdate = async () => {
      try {
        const bots = await storage.getBots();
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'BOTS_UPDATE', data: bots }));
        }
      } catch (error) {
        console.error('WebSocket update error:', error);
      }
    };

    // Send updates every 2 seconds
    const interval = setInterval(sendUpdate, 2000);

    ws.on('close', () => {
      clearInterval(interval);
      console.log('Client disconnected from WebSocket');
    });
  });

  return wss;
}
