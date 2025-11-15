"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const config_1 = require("../lib/config");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
const brandingSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    website: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().url().optional(),
    primaryColor: zod_1.z.string().optional(),
    secondaryColor: zod_1.z.string().optional(),
});
router.get("/defaults", async (_req, res) => {
    const scopeSetting = await prisma_1.prisma.setting.findUnique({ where: { key: "defaultScopeBullets" } });
    const disclaimerSetting = await prisma_1.prisma.setting.findUnique({ where: { key: "defaultDisclaimer" } });
    const brandingSetting = await prisma_1.prisma.setting.findUnique({ where: { key: "branding" } });
    res.json({
        company: (brandingSetting === null || brandingSetting === void 0 ? void 0 : brandingSetting.value) || config_1.config.company,
        scopeBullets: (scopeSetting === null || scopeSetting === void 0 ? void 0 : scopeSetting.value) || [],
        disclaimer: (disclaimerSetting === null || disclaimerSetting === void 0 ? void 0 : disclaimerSetting.value) || "",
    });
});
const defaultsSchema = zod_1.z.object({
    scopeBullets: zod_1.z.array(zod_1.z.string()).optional(),
    disclaimer: zod_1.z.string().optional(),
});
router.put("/defaults", async (req, res, next) => {
    try {
        const payload = defaultsSchema.parse(req.body);
        if (payload.scopeBullets) {
            await prisma_1.prisma.setting.upsert({
                where: { key: "defaultScopeBullets" },
                update: { value: payload.scopeBullets },
                create: { key: "defaultScopeBullets", value: payload.scopeBullets },
            });
        }
        if (payload.disclaimer) {
            await prisma_1.prisma.setting.upsert({
                where: { key: "defaultDisclaimer" },
                update: { value: payload.disclaimer },
                create: { key: "defaultDisclaimer", value: payload.disclaimer },
            });
        }
        res.json({ status: "ok" });
    }
    catch (err) {
        next(err);
    }
});
router.get("/branding", async (_req, res) => {
    const branding = await prisma_1.prisma.setting.findUnique({ where: { key: "branding" } });
    res.json((branding === null || branding === void 0 ? void 0 : branding.value) || config_1.config.company);
});
router.put("/branding", async (req, res, next) => {
    try {
        const payload = brandingSchema.parse(req.body);
        await prisma_1.prisma.setting.upsert({
            where: { key: "branding" },
            update: { value: payload },
            create: { key: "branding", value: payload },
        });
        res.json({ status: "ok" });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map