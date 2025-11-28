import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { config } from "../lib/config";

interface AuthTokenPayload {
  sub: string; // user id
  role: string;
  exp: number;
}

const bearerPrefix = "bearer ";

function signToken(payload: AuthTokenPayload, secret: string) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token: string, secret: string): AuthTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as AuthTokenPayload;
  if (!parsed?.exp || parsed.exp * 1000 < Date.now()) return null;
  return parsed;
}

export function issueToken(userId: string, role: string) {
  const ttlMinutes = config.auth.tokenTtlMinutes;
  const exp = Math.floor(Date.now() / 1000) + ttlMinutes * 60;
  return signToken({ sub: userId, role, exp }, config.auth.jwtSecret);
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization || "";
  if (authHeader.toLowerCase().startsWith(bearerPrefix)) {
    return authHeader.slice(bearerPrefix.length).trim();
  }
  return null;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const payload = verifyToken(token, config.auth.jwtSecret);
  if (!payload) return res.status(401).json({ message: "Unauthorized" });
  (req as any).user = { id: payload.sub, role: payload.role };
  return next();
}

export function requireRole(role: "ADMIN" | "SALES") {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (role === "ADMIN" && user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

// Minimal login throttling by IP
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 20;

export function rateLimitAuth(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count += 1;
  loginAttempts.set(ip, entry);
  if (entry.count > MAX_ATTEMPTS) {
    return res.status(429).json({ message: "Too many attempts, try again later." });
  }
  next();
}

export function secureHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
}
