
import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { Bot } from '@shared/schema';
import { storage } from './storage';
import { Express } from 'express';

// Map zum Speichern aktiver Client-Verbindungen pro Benutzer
const clientConnections: Map<number, Set<any>> = new Map();

/**
 * Sendet ein Update an alle verbundenen Clients eines bestimmten Benutzers
 */
export function broadcastToUser(userId: number, data: any) {
  const userClients = clientConnections.get(userId);
  if (!userClients) return;

  const message = JSON.stringify(data);
  userClients.forEach(client => {
    if (client.readyState === client.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('Fehler beim Senden einer Broadcast-Nachricht:', err);
      }
    }
  });
}

/**
 * Sendet ein Update an alle verbundenen Clients
 */
export function broadcastToAll(data: any) {
  const message = JSON.stringify(data);
  
  // Array.from zum Konvertieren des Map-Iterators in ein Array
  Array.from(clientConnections.entries()).forEach(([userId, clients]) => {
    // forEach für jede Client-Menge
    clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        try {
          client.send(message);
        } catch (err) {
          console.error(`Fehler beim Senden einer globalen Broadcast-Nachricht an Benutzer ${userId}:`, err);
        }
      }
    });
  });
}

/**
 * Richtet den WebSocket-Server ein
 * In der Express-Route-Definition, anstatt direkt die HTTP-Server-Instanz zu verwenden
 */
export function setupWebSocket(app: Express, server: Server) {
  // Wir erstellen einen WebSocket-Server, der auf dem Pfad /ws läuft
  // Dies vermeidet Konflikte mit dem Vite-WebSocket, der auf / läuft
  const wss = new WebSocketServer({ 
    noServer: true,
    perMessageDeflate: false
  });

  // Wenn eine Upgrade-Anfrage für /ws kommt, behandeln wir sie
  server.on('upgrade', (request, socket, head) => {
    // Wir prüfen, ob die Anfrage für unseren WebSocket-Pfad bestimmt ist
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    
    // Nur Upgrade für /ws-Pfad durchführen
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  // Verbindungsbehandlung
  wss.on('connection', (ws, req) => {
    console.log('Client mit WebSocket verbunden');
    
    // In einer echten Implementierung würden wir den Benutzer aus der Session extrahieren
    // Für Testzwecke verwenden wir einen festen Benutzer
    const userId = 1; // Test-Benutzer-ID
    
    // Client zur Verbindungsliste hinzufügen
    if (!clientConnections.has(userId)) {
      clientConnections.set(userId, new Set());
    }
    clientConnections.get(userId)?.add(ws);

    // Initialen Zustand senden
    try {
      ws.send(JSON.stringify({ 
        type: 'CONNECTED', 
        message: 'Verbindung hergestellt'
      }));
    } catch (err) {
      console.error('Fehler beim Senden der ersten Nachricht:', err);
    }

    // Benutzer-spezifische Bot-Updates senden
    const sendUpdates = async () => {
      try {
        const bots = await storage.getBots(userId);
          
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ 
            type: 'BOTS_UPDATE', 
            data: bots 
          }));
        }
      } catch (error) {
        console.error('WebSocket Update Fehler:', error);
      }
    };

    // Initial Update senden
    sendUpdates();

    // Weitere Updates alle 5 Sekunden
    const interval = setInterval(sendUpdates, 5000);

    // Verbindung schließen
    ws.on('close', () => {
      clearInterval(interval);
      
      // Client aus der Verbindungsliste entfernen
      const userClients = clientConnections.get(userId);
      if (userClients) {
        userClients.delete(ws);
        if (userClients.size === 0) {
          clientConnections.delete(userId);
        }
      }
      
      console.log('Client vom WebSocket getrennt');
    });

    // Nachrichten vom Client verarbeiten
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Nachricht vom Client erhalten:', data);
        
        // Hier können spezifische Aktionen basierend auf dem Nachrichtentyp ausgeführt werden
        // z.B. könnte der Client einen Bot-Befehl senden
      } catch (error) {
        console.error('Fehler beim Verarbeiten der Client-Nachricht:', error);
      }
    });
  });

  // WebSocket-Endpunkt für Client-Zugriff hinzufügen
  app.get('/api/ws-info', (req, res) => {
    res.json({
      wsEndpoint: '/ws',
      supportedActions: ['BOTS_UPDATE']
    });
  });

  return wss;
}
