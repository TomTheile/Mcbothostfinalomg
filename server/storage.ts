import { bots, users, type User, type InsertUser, type Bot, type InsertBot } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  getBots(userId: number): Promise<Bot[]>;
  getBot(id: number): Promise<Bot | undefined>;
  createBot(bot: InsertBot): Promise<Bot>;
  updateBot(id: number, botData: Partial<Bot>): Promise<Bot | undefined>;
  deleteBot(id: number): Promise<boolean>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bots: Map<number, Bot>;
  sessionStore: session.Store;
  currentUserId: number;
  currentBotId: number;

  constructor() {
    this.users = new Map();
    this.bots = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.currentUserId = 1;
    this.currentBotId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      verificationToken: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getBots(userId: number): Promise<Bot[]> {
    return Array.from(this.bots.values()).filter(
      (bot) => bot.userId === userId,
    );
  }

  async getBot(id: number): Promise<Bot | undefined> {
    return this.bots.get(id);
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const id = this.currentBotId++;
    const bot: Bot = {
      ...insertBot,
      id,
      status: "disconnected",
      lastConnection: null,
      lastDisconnection: null,
      error: null
    };
    this.bots.set(id, bot);
    return bot;
  }

  async updateBot(id: number, botData: Partial<Bot>): Promise<Bot | undefined> {
    const bot = this.bots.get(id);
    if (!bot) return undefined;
    
    const updatedBot = { ...bot, ...botData };
    this.bots.set(id, updatedBot);
    return updatedBot;
  }

  async deleteBot(id: number): Promise<boolean> {
    return this.bots.delete(id);
  }
}

export const storage = new MemStorage();
