import { Router } from "express";
import { z } from "zod";
import { goHighLevelService } from "../services/gohighlevelService";

const router = Router();

const lookupSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

router.post("/lookup", async (req, res, next) => {
  try {
    const payload = lookupSchema.parse(req.body);
    const contact = await goHighLevelService.findContact(payload);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found or CRM not configured." });
    }
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

export default router;
