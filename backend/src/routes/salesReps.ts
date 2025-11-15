import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

const repSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  active: z.boolean().optional(),
});

router.get("/", async (_req, res) => {
  const reps = await prisma.salesRep.findMany({ orderBy: { name: "asc" } });
  res.json(reps);
});

router.post("/", async (req, res, next) => {
  try {
    const payload = repSchema.parse(req.body);
    const rep = await prisma.salesRep.create({
      data: {
        name: payload.name,
        phone: payload.phone,
        email: payload.email || null,
        active: payload.active ?? true,
      },
    });
    res.status(201).json(rep);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const payload = repSchema.parse(req.body);
    const rep = await prisma.salesRep.update({
      where: { id: req.params.id },
      data: {
        name: payload.name,
        phone: payload.phone,
        email: payload.email || null,
        active: payload.active ?? true,
      },
    });
    res.json(rep);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/quotes", async (req, res, next) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { repId: req.params.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(quotes.map((q) => ({
      id: q.id,
      createdAt: q.createdAt,
      customerName: q.customerName,
      jobName: q.jobName,
      total: q.total,
      status: q.status,
    })));
  } catch (err) {
    next(err);
  }
});

export default router;
