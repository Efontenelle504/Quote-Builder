import { Router } from "express";
import { z } from "zod";
import { config } from "../lib/config";
import { aiService } from "../services/aiService";

const router = Router();

const rewriteSchema = z.object({
  section: z.enum(["scope", "components", "warranty", "notes"]),
  systemName: z.string().optional(),
  totalSquares: z.number().nonnegative(),
  currentText: z.string().optional(),
  currentList: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

router.post("/rewrite", async (req, res, next) => {
  if (!config.openai.apiKey) {
    return res.status(503).json({ message: "OpenAI is not configured" });
  }
  try {
    const payload = rewriteSchema.parse(req.body);
    const result = await aiService.rewrite(payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
