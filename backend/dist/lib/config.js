"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const path_1 = __importDefault(require("path"));
const projectRoot = path_1.default.resolve(__dirname, "..", "..");
const fallbackStorage = path_1.default.join(projectRoot, "storage", "quotes");
const fallbackPublic = path_1.default.join(projectRoot, "public");
exports.config = {
    port: Number(process.env.PORT) || 4000,
    storageDir: process.env.QUOTE_STORAGE_DIR
        ? path_1.default.resolve(process.env.QUOTE_STORAGE_DIR)
        : fallbackStorage,
    publicDir: process.env.PUBLIC_DIR
        ? path_1.default.resolve(process.env.PUBLIC_DIR)
        : fallbackPublic,
    clientBaseUrl: process.env.CLIENT_BASE_URL || "http://localhost:4000",
    company: {
        name: process.env.COMPANY_NAME || "Zuppardo's Renovations LLC",
        address: process.env.COMPANY_ADDRESS || "",
        phone: process.env.COMPANY_PHONE || "",
        site: process.env.COMPANY_SITE || "",
    },
    goHighLevel: {
        apiKey: process.env.GOHIGHLEVEL_API_KEY || "",
        pipelineId: process.env.GOHIGHLEVEL_PIPELINE_ID || "",
        stageId: process.env.GOHIGHLEVEL_STAGE_ID || "",
        userId: process.env.GOHIGHLEVEL_USER_ID || "",
        baseUrl: process.env.GOHIGHLEVEL_API_BASE || "https://services.leadconnectorhq.com",
        disableOpportunities: process.env.GOHIGHLEVEL_DISABLE_OPPORTUNITIES === "true",
        uploadPdf: process.env.GOHIGHLEVEL_UPLOAD_PDF !== "false", // default true
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || "",
        model: process.env.OPENAI_MODEL || "gpt-5-nano",
    },
};
//# sourceMappingURL=config.js.map