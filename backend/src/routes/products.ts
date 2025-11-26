import { Router } from "express";
import { z } from "zod";
import { productService } from "../services/productService";

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  unitPrice: z.number().nonnegative().optional(),
  warrantyText: z.string().optional(),
  scopeIntro: z.string().optional(),
  scopeBullets: z.array(z.string()).optional(),
  componentBullets: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^https?:\/\//i.test(val) || val.startsWith("data:");
  }, { message: "Invalid image URL" }),
  isCustom: z.boolean().optional(),
  ownerEmail: z.string().email().optional(),
  createdBy: z.string().optional(),
  isApproved: z.boolean().optional(),
});

router.get("/", async (req, res) => {
  const includeUnapproved = req.query.includeUnapproved === "true";
  const ownerEmail = typeof req.query.ownerEmail === "string" ? req.query.ownerEmail : undefined;
  const products = await productService.list({ includeUnapproved, ownerEmail });
  res.json(products);
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = productSchema.parse(req.body);
    const product = await productService.create(parsed);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const parsed = productSchema.parse(req.body);
    const product = await productService.update(req.params.id, parsed);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await productService.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
