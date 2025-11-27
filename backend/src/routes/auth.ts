import { Router } from "express";
import { z } from "zod";
import { config } from "../lib/config";
import { issueToken, rateLimitAuth } from "../middleware/auth";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/login", rateLimitAuth, (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const { email, password } = parsed.data;
  if (
    email.toLowerCase() !== config.auth.userEmail.toLowerCase() ||
    password !== config.auth.userPassword
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = issueToken(email.toLowerCase());
  return res.json({ token, expiresInMinutes: config.auth.tokenTtlMinutes });
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

export default router;
