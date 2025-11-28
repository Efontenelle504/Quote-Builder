import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireRole } from "../middleware/auth";
import bcrypt from "bcryptjs";

const router = Router();

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "SALES"]).default("SALES"),
});

const updateSchema = z.object({
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "SALES"]).optional(),
});

router.use(requireRole("ADMIN"));

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: "asc" },
  });
  res.json(users);
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }
  const { email, password, role } = parsed.data;
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: hash,
      role,
    },
    select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  res.status(201).json(user);
});

router.put("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }
  const data: any = {};
  if (parsed.data.role) data.role = parsed.data.role;
  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  res.json(user);
});

router.delete("/:id", async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;

