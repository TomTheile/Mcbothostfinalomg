
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
      const bots = await storage.getBots();
      ws.send(JSON.stringify({ type: 'BOTS_UPDATE', data: bots }));
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
