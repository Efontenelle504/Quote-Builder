import fs from "fs";
import path from "path";
import { Router } from "express";
import { z } from "zod";
import { config } from "../lib/config";
import { prisma } from "../lib/prisma";
import { quoteService } from "../services/quoteService";

const router = Router();

const areaSchema = z.object({
  name: z.string().min(1),
  squares: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  include: z.boolean(),
});

const deckSchema = z.object({
  include: z.boolean(),
  estSheets: z.number().optional(),
  sheetPrice: z.number().optional(),
  freeSheets: z.number().optional(),
});

const quoteSchema = z.object({
  company: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      site: z.string().optional(),
    })
    .optional(),
  rep: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  customer: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  jobName: z.string().optional(),
  systemSlug: z.string().optional(),
  systemName: z.string().optional(),
  fortified: z.boolean().optional(),
  applyPreset: z.boolean().optional(),
  showDisclaimer: z.boolean().optional(),
  disclaimerText: z.string().optional(),
  taxRate: z.number().optional(),
  deck: deckSchema.optional(),
  areas: z.array(areaSchema).min(1),
  notes: z.string().optional(),
  scopeIntroOverride: z.string().optional(),
  scopeBulletsOverride: z.array(z.string()).optional(),
  componentsOverride: z.array(z.string()).optional(),
  warrantyOverride: z.string().optional(),
  pricingOverride: z.array(z.string()).optional(),
  altPlyText: z.string().optional(),
  syncOnSave: z.boolean().optional(),
});

router.get("/", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const quotes = await quoteService.list(limit);
  res.json(quotes);
});

router.get("/:id", async (req, res, next) => {
  try {
    const quote = await quoteService.get(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.json(quote);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = quoteSchema.parse(req.body);
    const quote = await quoteService.create(payload);
    res.status(201).json(quote);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/sync", async (req, res, next) => {
  try {
    const quote = await quoteService.sync(req.params.id);
    res.json(quote);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/pdf", async (req, res, next) => {
  try {
    const quote = await prisma.quote.findUnique({ where: { id: req.params.id } });
    if (!quote || !quote.pdfPath) {
      return res.status(404).json({ message: "PDF not found" });
    }
    const pdfPath = path.join(config.storageDir, quote.pdfPath);
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: "PDF missing on disk" });
    }
    res.sendFile(pdfPath);
  } catch (err) {
    next(err);
  }
});

export default router;
