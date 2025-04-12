import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import nodemailer from "nodemailer";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateVerificationToken() {
  return randomBytes(32).toString("hex");
}

// Setup Gmail email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "verify.mcbot@gmail.com",
    pass: "ikkf vlqy smcp xzsk", // App password
  },
});

async function sendVerificationEmail(email: string, token: string) {
  const domains = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000";
  const verificationUrl = `http://${domains}/verify?token=${token}`;
  
  try {
    const info = await transporter.sendMail({
      from: '"Minecraft Bot Panel" <verify.mcbot@gmail.com>',
      to: email,
      subject: "Verify your email address",
      text: `Please verify your email address by clicking on the following link: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3949AB;">Minecraft Bot Panel</h2>
          <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #3949AB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Verify Email</a>
          <p style="margin-top: 20px;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; color: #3949AB;">${verificationUrl}</p>
        </div>
      `,
    });
    
    console.log("Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "minecraft-bot-panel-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        if (!user.isVerified) {
          return done(null, false, { message: "Please verify your email before logging in" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Generate verification token
      const verificationToken = generateVerificationToken();
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
      });
      
      // Update user with verification token
      await storage.updateUser(user.id, { verificationToken });
      
      // Send verification email
      await sendVerificationEmail(email, verificationToken);
      
      // Return user but exclude sensitive data
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        ...userWithoutPassword,
        verificationToken,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err: Error | null) => {
        if (err) return next(err);
        
        // Return user but exclude sensitive data
        const { password, verificationToken, ...userWithoutSensitiveData } = user;
        res.status(200).json(userWithoutSensitiveData);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Return user but exclude sensitive data
    const { password, verificationToken, ...userWithoutSensitiveData } = req.user;
    res.json(userWithoutSensitiveData);
  });

  app.get("/api/verify", async (req, res, next) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid verification token" });
      }
      
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      
      // Update user to mark as verified and remove token
      await storage.updateUser(user.id, {
        isVerified: true,
        verificationToken: null,
      });
      
      // Redirect to login page with success message
      res.redirect("/auth?verified=true");
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/resend-verification", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "User is already verified" });
      }
      
      // Generate new verification token
      const verificationToken = generateVerificationToken();
      
      // Update user with new verification token
      await storage.updateUser(user.id, { verificationToken });
      
      // Send verification email
      await sendVerificationEmail(email, verificationToken);
      
      res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
      next(error);
    }
  });
}
