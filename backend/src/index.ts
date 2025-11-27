import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import productsRouter from "./routes/products";
import quotesRouter from "./routes/quotes";
import crmRouter from "./routes/crm";
import settingsRouter from "./routes/settings";
import salesRepsRouter from "./routes/salesReps";
import aiRouter from "./routes/ai";
import { config } from "./lib/config";
import { ensureStorageDir } from "./lib/files";
import authRouter from "./routes/auth";
import { authMiddleware, secureHeaders } from "./middleware/auth";

const app = express();

const clientOrigin = config.clientBaseUrl;
app.use(
  cors({
    origin: clientOrigin === "*" ? undefined : clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(secureHeaders);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);

// Protect all other /api routes
app.use("/api", authMiddleware);
app.use("/api/products", productsRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/crm", crmRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/sales-reps", salesRepsRouter);
app.use("/api/ai", aiRouter);

app.use("/files", express.static(config.storageDir));

const publicDir = config.publicDir;
app.use(express.static(publicDir));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(400).json({ message: err.message || "Unexpected error" });
});

const fallbackFile = path.join(publicDir, "final_quote_builder.html");
app.get(/^\/(?!api).*/, (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.sendFile(fallbackFile);
});

ensureStorageDir().catch((err) => console.error("Storage init error", err));

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Quote Builder API running on :${port}`);
});
