"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
const zod_1 = require("zod");
const config_1 = require("../lib/config");
const prisma_1 = require("../lib/prisma");
const quoteService_1 = require("../services/quoteService");
const router = (0, express_1.Router)();
const areaSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    squares: zod_1.z.number().nonnegative(),
    unitPrice: zod_1.z.number().nonnegative(),
    include: zod_1.z.boolean(),
});
const deckSchema = zod_1.z.object({
    include: zod_1.z.boolean(),
    estSheets: zod_1.z.number().optional(),
    sheetPrice: zod_1.z.number().optional(),
    freeSheets: zod_1.z.number().optional(),
});
const financingSchema = zod_1.z.object({
    years: zod_1.z.number().positive().optional(),
    apr: zod_1.z.number().nonnegative().optional(),
    showOnQuote: zod_1.z.boolean().optional(),
    showDetails: zod_1.z.boolean().optional(),
});
const quoteSchema = zod_1.z.object({
    company: zod_1.z
        .object({
        name: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        site: zod_1.z.string().optional(),
    })
        .optional(),
    rep: zod_1.z
        .object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
    })
        .optional(),
    customer: zod_1.z
        .object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
    })
        .optional(),
    jobName: zod_1.z.string().optional(),
    systemSlug: zod_1.z.string().optional(),
    systemName: zod_1.z.string().optional(),
    fortified: zod_1.z.boolean().optional(),
    applyPreset: zod_1.z.boolean().optional(),
    showDisclaimer: zod_1.z.boolean().optional(),
    disclaimerText: zod_1.z.string().optional(),
    taxRate: zod_1.z.number().optional(),
    deck: deckSchema.optional(),
    areas: zod_1.z.array(areaSchema).min(1),
    notes: zod_1.z.string().optional(),
    scopeIntroOverride: zod_1.z.string().optional(),
    scopeBulletsOverride: zod_1.z.array(zod_1.z.string()).optional(),
    componentsOverride: zod_1.z.array(zod_1.z.string()).optional(),
    warrantyOverride: zod_1.z.string().optional(),
    pricingOverride: zod_1.z.array(zod_1.z.string()).optional(),
    altPlyText: zod_1.z.string().optional(),
    financing: financingSchema.optional(),
    syncOnSave: zod_1.z.boolean().optional(),
});
router.get("/", async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const quotes = await quoteService_1.quoteService.list(limit);
    res.json(quotes);
});
router.get("/:id", async (req, res, next) => {
    try {
        const quote = await quoteService_1.quoteService.get(req.params.id);
        if (!quote)
            return res.status(404).json({ message: "Quote not found" });
        res.json(quote);
    }
    catch (err) {
        next(err);
    }
});
router.post("/", async (req, res, next) => {
    try {
        const payload = quoteSchema.parse(req.body);
        const quote = await quoteService_1.quoteService.create(payload);
        res.status(201).json(quote);
    }
    catch (err) {
        next(err);
    }
});
router.post("/:id/sync", async (req, res, next) => {
    try {
        const quote = await quoteService_1.quoteService.sync(req.params.id);
        res.json(quote);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id/pdf", async (req, res, next) => {
    try {
        const quote = await prisma_1.prisma.quote.findUnique({ where: { id: req.params.id } });
        if (!quote || !quote.pdfPath) {
            return res.status(404).json({ message: "PDF not found" });
        }
        const pdfPath = path_1.default.join(config_1.config.storageDir, quote.pdfPath);
        if (!fs_1.default.existsSync(pdfPath)) {
            return res.status(404).json({ message: "PDF missing on disk" });
        }
        res.sendFile(pdfPath);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=quotes.js.map