import { Router } from "express";
import { z } from "zod";
import { config } from "../lib/config";
import { prisma } from "../lib/prisma";

const router = Router();

const brandingSchema = z.object({
  companyName: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

router.get("/defaults", async (_req, res) => {
  const scopeSetting = await prisma.setting.findUnique({ where: { key: "defaultScopeBullets" } });
  const disclaimerSetting = await prisma.setting.findUnique({ where: { key: "defaultDisclaimer" } });
  const brandingSetting = await prisma.setting.findUnique({ where: { key: "branding" } });
  const workmanshipSetting = await prisma.setting.findUnique({ where: { key: "workmanshipWarranty" } });
  res.json({
    company: brandingSetting?.value || config.company,
    scopeBullets: (scopeSetting?.value as string[]) || [],
    disclaimer: (disclaimerSetting?.value as string) || "",
    workmanshipWarranty: (workmanshipSetting?.value as string) || "",
  });
});

const defaultsSchema = z.object({
  scopeBullets: z.array(z.string()).optional(),
  disclaimer: z.string().optional(),
  workmanshipWarranty: z.string().optional(),
});

router.put("/defaults", async (req, res, next) => {
  try {
    const payload = defaultsSchema.parse(req.body);
    if (payload.scopeBullets) {
      await prisma.setting.upsert({
        where: { key: "defaultScopeBullets" },
        update: { value: payload.scopeBullets },
        create: { key: "defaultScopeBullets", value: payload.scopeBullets },
      });
    }
    if (payload.disclaimer) {
      await prisma.setting.upsert({
        where: { key: "defaultDisclaimer" },
        update: { value: payload.disclaimer },
        create: { key: "defaultDisclaimer", value: payload.disclaimer },
      });
    }
    if (payload.workmanshipWarranty) {
      await prisma.setting.upsert({
        where: { key: "workmanshipWarranty" },
        update: { value: payload.workmanshipWarranty },
        create: { key: "workmanshipWarranty", value: payload.workmanshipWarranty },
      });
    }
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

router.get("/branding", async (_req, res) => {
  const branding = await prisma.setting.findUnique({ where: { key: "branding" } });
  res.json(branding?.value || config.company);
});

router.put("/branding", async (req, res, next) => {
  try {
    const payload = brandingSchema.parse(req.body);
    await prisma.setting.upsert({
      where: { key: "branding" },
      update: { value: payload },
      create: { key: "branding", value: payload },
    });
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

export default router;
