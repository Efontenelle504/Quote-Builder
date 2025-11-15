"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const products_1 = __importDefault(require("./routes/products"));
const quotes_1 = __importDefault(require("./routes/quotes"));
const crm_1 = __importDefault(require("./routes/crm"));
const settings_1 = __importDefault(require("./routes/settings"));
const salesReps_1 = __importDefault(require("./routes/salesReps"));
const ai_1 = __importDefault(require("./routes/ai"));
const config_1 = require("./lib/config");
const files_1 = require("./lib/files");
const app = (0, express_1.default)();
const clientOrigin = config_1.config.clientBaseUrl;
app.use((0, cors_1.default)({
    origin: clientOrigin === "*" ? undefined : clientOrigin,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "5mb" }));
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/products", products_1.default);
app.use("/api/quotes", quotes_1.default);
app.use("/api/crm", crm_1.default);
app.use("/api/settings", settings_1.default);
app.use("/api/sales-reps", salesReps_1.default);
app.use("/api/ai", ai_1.default);
app.use("/files", express_1.default.static(config_1.config.storageDir));
const publicDir = config_1.config.publicDir;
app.use(express_1.default.static(publicDir));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(400).json({ message: err.message || "Unexpected error" });
});
const fallbackFile = path_1.default.join(publicDir, "final_quote_builder.html");
app.get(/^\/(?!api).*/, (req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(fallbackFile);
});
(0, files_1.ensureStorageDir)().catch((err) => console.error("Storage init error", err));
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
    console.log(`Quote Builder API running on :${port}`);
});
//# sourceMappingURL=index.js.map