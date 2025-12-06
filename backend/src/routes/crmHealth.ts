import { Router } from "express";
import { goHighLevelService } from "../services/gohighlevelService";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await goHighLevelService.healthCheck();
  if (result.ok) {
    return res.json({ status: "ok" });
  }
  return res.status(502).json({
    status: "error",
    message: result.message || "GHL health check failed",
    statusCode: result.status,
  });
});

export default router;

