import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../lib/config";

interface AuthTokenPayload {
  sub: string; // user id
  role: string;
}

const bearerPrefix = "bearer ";

export function issueToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role } as AuthTokenPayload, config.auth.jwtSecret, {
    expiresIn: `${config.auth.tokenTtlMinutes}m`,
  });
}

function extractToken(req: Request): string | null {
  // Prefer cookie, fallback to Authorization header
  const cookieToken = (req as any).cookies?.auth as string | undefined;
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.authorization || "";
  if (authHeader.toLowerCase().startsWith(bearerPrefix)) {
    return authHeader.slice(bearerPrefix.length).trim();
  }
  return null;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, config.auth.jwtSecret) as AuthTokenPayload;
    (req as any).user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
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
