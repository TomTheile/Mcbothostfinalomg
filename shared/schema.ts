import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  verificationToken: text("verification_token"),
});

export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  serverAddress: text("server_address").notNull(),
  serverPort: integer("server_port").notNull().default(25565),
  status: text("status").notNull().default("disconnected"),
  gameVersion: text("game_version").notNull().default("1.19.2"),
  behavior: text("behavior").notNull().default("passive"),
  autoReconnect: boolean("auto_reconnect").notNull().default(false),
  recordChat: boolean("record_chat").notNull().default(false),
  lastConnection: timestamp("last_connection"),
  lastDisconnection: timestamp("last_disconnection"),
  error: text("error"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertBotSchema = createInsertSchema(bots).pick({
  name: true,
  userId: true,
  serverAddress: true,
  serverPort: true,
  gameVersion: true,
  behavior: true,
  autoReconnect: true,
  recordChat: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
