import { createBot, Bot as MineflayerBot } from 'mineflayer';
import { storage } from './storage';
import { Bot } from '@shared/schema';

// Map to keep track of all active bots
const activeBots = new Map<number, MineflayerBot>();

/**
 * Connects a bot to a Minecraft server
 */
export async function connectBot(botId: number): Promise<Bot | undefined> {
  try {
    // Get bot configuration from storage
    const botConfig = await storage.getBot(botId);
    if (!botConfig) {
      throw new Error('Bot not found');
    }

    // Check if bot is already connected
    if (activeBots.has(botId)) {
      throw new Error('Bot is already connected');
    }

    // Update bot status to connecting
    await storage.updateBot(botId, {
      status: 'connecting'
    });

    // Create a new Mineflayer bot
    const bot = createBot({
      host: botConfig.serverAddress,
      port: botConfig.serverPort,
      username: botConfig.name,
      version: botConfig.gameVersion,
      auth: 'offline', // Using offline mode (no premium account)
    });

    // Set up event handlers
    bot.once('spawn', async () => {
      const updatedBot = await storage.updateBot(botId, {
        status: 'connected',
        lastConnection: new Date(),
        error: null
      });
      console.log(`Bot ${botConfig.name} connected to ${botConfig.serverAddress}:${botConfig.serverPort}`);
      return updatedBot;
    });

    bot.on('end', async (reason) => {
      console.log(`Bot ${botConfig.name} disconnected: ${reason}`);
      const updatedBot = await storage.updateBot(botId, {
        status: 'disconnected',
        lastDisconnection: new Date(),
        error: reason || null
      });

      // Remove from active bots
      activeBots.delete(botId);

      // If auto-reconnect is enabled, try to reconnect
      if (botConfig.autoReconnect) {
        setTimeout(() => {
          connectBot(botId).catch(console.error);
        }, 5000); // Wait 5 seconds before reconnecting
      }

      return updatedBot;
    });

    bot.on('error', async (err) => {
      console.error(`Bot ${botConfig.name} error:`, err);
      await storage.updateBot(botId, {
        status: 'error',
        error: err.message
      });

      // Remove from active bots
      activeBots.delete(botId);
    });

    // Add chat logging if enabled
    if (botConfig.recordChat) {
      // This would normally save to a database, but for now we'll just log to console
      bot.on('message', (message) => {
        console.log(`[${botConfig.name}] Chat: ${message.toString()}`);
      });
    }

    // Save the bot to active bots
    activeBots.set(botId, bot);

    // Return the updated bot configuration
    return await storage.getBot(botId);
  } catch (error: any) {
    console.error(`Error connecting bot ${botId}:`, error);
    await storage.updateBot(botId, {
      status: 'error',
      error: error.message
    });

    // Remove from active bots if it was added
    activeBots.delete(botId);
    throw error;
  }
}

/**
 * Disconnects a bot from a Minecraft server
 */
export async function disconnectBot(botId: number): Promise<Bot | undefined> {
  try {
    const bot = activeBots.get(botId);
    if (!bot) {
      throw new Error('Bot is not connected');
    }

    // End the bot connection
    bot.quit('Manually disconnected');
    activeBots.delete(botId);

    // Update bot status
    return await storage.updateBot(botId, {
      status: 'disconnected',
      lastDisconnection: new Date()
    });
  } catch (error: any) {
    console.error(`Error disconnecting bot ${botId}:`, error);
    throw error;
  }
}

/**
 * Gets information about a bot's connection status
 */
export async function getBotStatus(botId: number): Promise<{
  online: boolean;
  playerCount?: number;
  health?: number;
  position?: { x: number; y: number; z: number };
}> {
  const bot = activeBots.get(botId);
  if (!bot || !bot.player) {
    return { online: false };
  }

  // Get information about the bot's current state
  return {
    online: true,
    playerCount: Object.keys(bot.players || {}).length,
    health: bot.health,
    position: bot.entity ? {
      x: Math.round(bot.entity.position.x * 100) / 100,
      y: Math.round(bot.entity.position.y * 100) / 100,
      z: Math.round(bot.entity.position.z * 100) / 100
    } : undefined
  };
}

/**
 * Gets a list of players on the server
 */
export function getServerPlayers(botId: number): string[] {
  const bot = activeBots.get(botId);
  if (!bot || !bot.players) {
    return [];
  }

  return Object.keys(bot.players);
}

/**
 * Cleanup function to disconnect all bots when the server shuts down
 */
export function cleanupBots(): void {
  for (const [botId, bot] of activeBots.entries()) {
    try {
      bot.quit('Server shutting down');
      console.log(`Disconnected bot ${botId} due to server shutdown`);
    } catch (error) {
      console.error(`Error disconnecting bot ${botId} during shutdown:`, error);
    }
  }
  activeBots.clear();
}

// Ensure bots are disconnected when the process exits
process.on('SIGINT', () => {
  cleanupBots();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupBots();
  process.exit(0);
});
