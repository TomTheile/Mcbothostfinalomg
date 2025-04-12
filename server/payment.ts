import { Express } from "express";
import { storage } from "./storage";
import { generateTransactionId } from "./bot-utils";

// PayPal-Email-Adresse für Zahlungen
const PAYPAL_EMAIL = "TurboKid@outlook.de";

// Premium-Plan-Preise (in EUR)
const PREMIUM_PRICES = {
  monthly: 4.99,
  yearly: 39.99,
  lifetime: 99.99
};

// Interface für Transaktion
interface Transaction {
  id: string;
  userId: number;
  amount: number;
  planType: 'monthly' | 'yearly' | 'lifetime';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt: Date | null;
}

// Speicherung von Transaktionen im Speicher (in einer realen Anwendung würde dies in einer Datenbank gespeichert)
const transactions = new Map<string, Transaction>();

/**
 * Erstellt eine neue Transaktion für einen Benutzer
 */
function createTransaction(userId: number, planType: 'monthly' | 'yearly' | 'lifetime'): Transaction {
  const amount = PREMIUM_PRICES[planType];
  const id = generateTransactionId();
  
  const transaction: Transaction = {
    id,
    userId,
    amount,
    planType,
    status: 'pending',
    createdAt: new Date(),
    completedAt: null
  };
  
  transactions.set(id, transaction);
  return transaction;
}

/**
 * Aktualisiert den Status einer Transaktion
 */
function updateTransactionStatus(
  transactionId: string, 
  status: 'pending' | 'completed' | 'failed',
  completedAt: Date | null = null
): Transaction | null {
  const transaction = transactions.get(transactionId);
  if (!transaction) return null;
  
  transaction.status = status;
  if (completedAt) {
    transaction.completedAt = completedAt;
  }
  
  transactions.set(transactionId, transaction);
  return transaction;
}

/**
 * Verarbeitet eine abgeschlossene Zahlung für einen Benutzer
 */
async function processCompletedPayment(userId: number, planType: 'monthly' | 'yearly' | 'lifetime'): Promise<boolean> {
  try {
    // Aktualisiere den Benutzer auf Premium
    const user = await storage.getUser(userId);
    if (!user) return false;
    
    // Festlegen der Premium-Dauer basierend auf dem Plan
    let premiumUntil: Date | null = null;
    
    const now = new Date();
    if (planType === 'monthly') {
      // 1 Monat Premium
      premiumUntil = new Date(now.setMonth(now.getMonth() + 1));
    } else if (planType === 'yearly') {
      // 1 Jahr Premium
      premiumUntil = new Date(now.setFullYear(now.getFullYear() + 1));
    } else if (planType === 'lifetime') {
      // Lebenslang Premium (null = unbegrenzt)
      premiumUntil = null;
    }
    
    // Aktualisiere den Benutzer
    await storage.updateUser(userId, {
      isPremium: true,
      premiumUntil
    });
    
    return true;
  } catch (error) {
    console.error("Fehler bei der Verarbeitung der abgeschlossenen Zahlung:", error);
    return false;
  }
}

/**
 * Richtet die Zahlungsrouten ein
 */
export function setupPaymentRoutes(app: Express) {
  // Informationen über Premium-Pläne abrufen
  app.get("/api/premium/plans", (req, res) => {
    res.json({
      plans: [
        {
          id: "monthly",
          name: "Monatlich",
          price: PREMIUM_PRICES.monthly,
          description: "1 Monat Premium-Zugang mit unbegrenzten Bots"
        },
        {
          id: "yearly",
          name: "Jährlich",
          price: PREMIUM_PRICES.yearly,
          description: "1 Jahr Premium-Zugang mit unbegrenzten Bots (33% Rabatt)"
        },
        {
          id: "lifetime",
          name: "Lebenslang",
          price: PREMIUM_PRICES.lifetime,
          description: "Lebenslanger Premium-Zugang mit unbegrenzten Bots"
        }
      ],
      paypalEmail: PAYPAL_EMAIL
    });
  });
  
  // Neue Transaktion erstellen
  app.post("/api/premium/transactions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { planType } = req.body;
      
      // Validiere den Plan-Typ
      if (!planType || !["monthly", "yearly", "lifetime"].includes(planType)) {
        return res.status(400).json({ 
          message: "Ungültiger Plan-Typ",
          validTypes: ["monthly", "yearly", "lifetime"]
        });
      }
      
      // Erstelle eine neue Transaktion
      const transaction = createTransaction(req.user.id, planType);
      
      res.status(201).json({
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          planType: transaction.planType,
          status: transaction.status
        },
        paymentInfo: {
          paypalEmail: PAYPAL_EMAIL,
          amount: transaction.amount,
          currency: "EUR",
          description: `Premium-Abonnement (${planType}) für ${req.user.username}`,
          reference: transaction.id
        }
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Eine Transaktion abschließen (normalerweise würde dies über einen Webhook von PayPal aufgerufen)
  // Zu Testzwecken simulieren wir dies mit einer einfachen API
  app.post("/api/premium/transactions/:id/complete", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const transactionId = req.params.id;
      const transaction = transactions.get(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaktion nicht gefunden" });
      }
      
      if (transaction.userId !== req.user.id) {
        return res.status(403).json({ message: "Zugriff verweigert" });
      }
      
      if (transaction.status === 'completed') {
        return res.status(400).json({ message: "Transaktion bereits abgeschlossen" });
      }
      
      // Aktualisiere die Transaktion als abgeschlossen
      const updatedTransaction = updateTransactionStatus(transactionId, 'completed', new Date());
      
      // Verarbeite die Zahlung und aktiviere Premium für den Benutzer
      const success = await processCompletedPayment(req.user.id, transaction.planType);
      
      if (!success) {
        return res.status(500).json({ message: "Fehler bei der Aktivierung des Premium-Status" });
      }
      
      res.json({
        transaction: {
          id: updatedTransaction?.id,
          status: updatedTransaction?.status,
          completedAt: updatedTransaction?.completedAt
        },
        premiumStatus: {
          isPremium: true,
          planType: transaction.planType
        }
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Premium-Status des aktuellen Benutzers abrufen
  app.get("/api/premium/status", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { isPremium, premiumUntil } = req.user;
      
      let status = "free";
      if (isPremium) {
        status = !premiumUntil ? "lifetime" : "subscription";
      }
      
      res.json({
        isPremium: isPremium || false,
        status,
        premiumUntil,
        maxBots: isPremium ? 999999 : 1
      });
    } catch (error) {
      next(error);
    }
  });
}