import { Router } from "express";
import { z } from "zod";
import { config } from "../lib/config";
import { prisma } from "../lib/prisma";
import { issueToken, rateLimitAuth } from "../middleware/auth";
import bcrypt from "bcryptjs";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/login", rateLimitAuth, (req, res) => {
  (async () => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const { email, password } = parsed.data;
    const normalized = email.toLowerCase();

    let user = await prisma.user.findUnique({ where: { email: normalized } });

    // Bootstrap: if no user row exists and env creds match, create an ADMIN user.
    if (!user && normalized === config.auth.userEmail.toLowerCase() && password === config.auth.userPassword) {
      const hash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: { email: normalized, passwordHash: hash, role: "ADMIN" },
      });
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = issueToken(user.id, user.role);
    res.cookie("auth", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: config.auth.tokenTtlMinutes * 60 * 1000,
    });
    return res.json({ role: user.role, expiresInMinutes: config.auth.tokenTtlMinutes });
  })().catch((err) => {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("auth");
  res.json({ message: "Logged out" });
});

router.get("/me", (req, res) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  res.json({ id: user.id, role: user.role });
});

export default router;
