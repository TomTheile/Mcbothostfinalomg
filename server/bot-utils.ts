import { nanoid } from 'nanoid';

/**
 * Generiert einen zufälligen Botnamen
 * @returns Einen zufälligen Bot-Namen
 */
export function generateRandomBotName(): string {
  // Liste von möglichen Namensbestandteilen
  const prefixes = [
    "Bot", "MC", "Mine", "Craft", "Pixel", "Block", "Dig", "Creep", "Steve", "Alex", 
    "Gold", "Iron", "Diamond", "Emerald", "Ruby", "Dirt", "Stone", "Lava", "Water", "Sky"
  ];
  
  const adjectives = [
    "Super", "Awesome", "Cool", "Epic", "Mega", "Pro", "Elite", "Master", "Quick", "Fast",
    "Smart", "Clever", "Brave", "Bold", "Swift", "Tough", "Agile", "Nimble", "Strong", "Wise"
  ];
  
  const suffixes = [
    "Player", "Miner", "Knight", "Warrior", "Hero", "Ninja", "Assassin", "Wizard", "Archer", "Scout",
    "Hunter", "Explorer", "Builder", "Creator", "Crafter", "Adventurer", "Wanderer", "Traveler", "Seeker", "Defender"
  ];

  // Zufällig Teile auswählen
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  // Eine zufällige Zahl hinzufügen (zwischen 1 und 999)
  const randomNum = Math.floor(Math.random() * 999) + 1;
  
  // Verschiedene Formatmöglichkeiten
  const nameFormats = [
    `${prefix}_${adjective}${randomNum}`,
    `${adjective}${prefix}${randomNum}`,
    `${prefix}${randomNum}`,
    `${adjective}_${suffix}${randomNum}`,
    `${prefix}${suffix}${randomNum}`,
    `${suffix}_${randomNum}`
  ];
  
  // Eine zufällige Formatierung auswählen
  const nameFormat = nameFormats[Math.floor(Math.random() * nameFormats.length)];
  
  return nameFormat;
}

/**
 * Generiert eine eindeutige ID für Transaktionen
 * @returns Eine eindeutige ID
 */
export function generateTransactionId(): string {
  return `txn_${nanoid(16)}`;
}

/**
 * Überprüft, ob eine Zeichenkette ein gültiger Minecraft-Servername ist
 * @param address Die zu überprüfende Adresse
 * @returns true wenn gültig, false wenn ungültig
 */
export function isValidMinecraftServer(address: string): boolean {
  // Einfache Überprüfung: mindestens 1 Zeichen, höchstens 253 Zeichen
  // Erlaubt Buchstaben, Zahlen, Punkte, Bindestriche und Unterstriche
  const regex = /^[a-zA-Z0-9._-]{1,253}$/;
  return regex.test(address);
}

/**
 * Prüft, ob ein Port gültig ist (zwischen 1 und 65535)
 * @param port Die zu überprüfende Portnummer
 * @returns true wenn gültig, false wenn ungültig
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port > 0 && port <= 65535;
}