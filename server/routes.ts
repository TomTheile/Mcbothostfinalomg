import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { connectBot, disconnectBot, getBotStatus, getServerPlayers } from "./mineflayer";
import { insertBotSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Bot management routes
  app.get("/api/bots", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const bots = await storage.getBots(req.user.id);
      res.json(bots);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/bots", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate request body
      const validatedData = insertBotSchema.safeParse({
        ...req.body,
        userId: req.user.id,
      });
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid bot data", errors: validatedData.error });
      }
      
      // Überprüfe, ob der Benutzer das Limit für die Anzahl der Bots erreicht hat
      const existingBots = await storage.getBots(req.user.id);
      
      // Benutzer ohne Abonnement können nur 1 Bot haben
      const isPremium = req.user.isPremium || false; // Default auf false, wenn nicht vorhanden
      const maxBots = isPremium ? 99999 : 1; // Premium-Benutzer haben unbegrenzt Bots
      
      if (existingBots.length >= maxBots) {
        return res.status(403).json({ 
          message: "Bot limit reached", 
          limit: maxBots,
          needsPremium: !isPremium
        });
      }
      
      // Create new bot
      const bot = await storage.createBot(validatedData.data);
      res.status(201).json(bot);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/bots/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const bot = await storage.getBot(parseInt(req.params.id));
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      if (bot.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(bot);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/bots/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const botId = parseInt(req.params.id);
      const bot = await storage.getBot(botId);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      if (bot.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Only allow updating certain fields
      const allowedUpdates = ["name", "serverAddress", "serverPort", "gameVersion", "behavior", "autoReconnect", "recordChat"];
      const updates = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key))
      );
      
      const updatedBot = await storage.updateBot(botId, updates);
      res.json(updatedBot);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/bots/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const botId = parseInt(req.params.id);
      const bot = await storage.getBot(botId);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      if (bot.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // If bot is connected, disconnect it first
      if (bot.status === "connected" || bot.status === "connecting") {
        await disconnectBot(botId).catch(console.error);
      }
      
      await storage.deleteBot(botId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/bots/:id/connect", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const botId = parseInt(req.params.id);
      const bot = await storage.getBot(botId);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      if (bot.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (bot.status === "connected" || bot.status === "connecting") {
        return res.status(400).json({ message: "Bot is already connected or connecting" });
      }
      
      const connectedBot = await connectBot(botId);
      res.json(connectedBot);
    } catch (error: any) {
      next(error);
    }
  });

  app.post("/api/bots/:id/disconnect", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const botId = parseInt(req.params.id);
      const bot = await storage.getBot(botId);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      if (bot.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (bot.status !== "connected" && bot.status !== "connecting") {
        return res.status(400).json({ message: "Bot is not connected" });
      }
      
      const disconnectedBot = await disconnectBot(botId);
      res.json(disconnectedBot);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/bots/:id/status", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const botId = parseInt(req.params.id);
      const bot = await storage.getBot(botId);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      if (bot.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (bot.status !== "connected") {
        return res.json({ status: bot.status, error: bot.error });
      }
      
      const status = await getBotStatus(botId);
      res.json({
        ...status,
        status: bot.status,
        error: bot.error
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/bots/:id/players", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const botId = parseInt(req.params.id);
      const bot = await storage.getBot(botId);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      if (bot.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (bot.status !== "connected") {
        return res.status(400).json({ message: "Bot is not connected" });
      }
      
      const players = getServerPlayers(botId);
      res.json(players);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
