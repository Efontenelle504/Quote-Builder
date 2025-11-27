import path from "path";

const projectRoot = path.resolve(__dirname, "..", "..");

const fallbackStorage = path.join(projectRoot, "storage", "quotes");
const fallbackPublic = path.join(projectRoot, "public");

export const config = {
  port: Number(process.env.PORT) || 4000,
  storageDir: process.env.QUOTE_STORAGE_DIR
    ? path.resolve(process.env.QUOTE_STORAGE_DIR)
    : fallbackStorage,
  publicDir: process.env.PUBLIC_DIR
    ? path.resolve(process.env.PUBLIC_DIR)
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
    locationId: process.env.GOHIGHLEVEL_LOCATION_ID || "",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-5-nano",
  },
  auth: {
    userEmail: process.env.AUTH_USER_EMAIL || "admin@example.com",
    userPassword: process.env.AUTH_USER_PASSWORD || "change-me",
    jwtSecret: process.env.AUTH_JWT_SECRET || "change-this-secret",
    tokenTtlMinutes: Number(process.env.AUTH_TOKEN_TTL_MINUTES || 120),
  },
};
