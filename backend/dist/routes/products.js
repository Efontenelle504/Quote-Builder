"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const productService_1 = require("../services/productService");
const router = (0, express_1.Router)();
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    unitPrice: zod_1.z.number().nonnegative().optional(),
    warrantyText: zod_1.z.string().optional(),
    scopeIntro: zod_1.z.string().optional(),
    scopeBullets: zod_1.z.array(zod_1.z.string()).optional(),
    componentBullets: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    imageUrl: zod_1.z.string().optional().refine((val) => {
        if (!val)
            return true;
        return /^https?:\/\//i.test(val) || val.startsWith("data:");
    }, { message: "Invalid image URL" }),
    isCustom: zod_1.z.boolean().optional(),
    ownerEmail: zod_1.z.string().email().optional(),
    createdBy: zod_1.z.string().optional(),
    isApproved: zod_1.z.boolean().optional(),
});
router.get("/", async (req, res) => {
    const includeUnapproved = req.query.includeUnapproved === "true";
    const ownerEmail = typeof req.query.ownerEmail === "string" ? req.query.ownerEmail : undefined;
    const products = await productService_1.productService.list({ includeUnapproved, ownerEmail });
    res.json(products);
});
router.post("/", async (req, res, next) => {
    try {
        const parsed = productSchema.parse(req.body);
        const product = await productService_1.productService.create(parsed);
        res.status(201).json(product);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:id", async (req, res, next) => {
    try {
        const parsed = productSchema.parse(req.body);
        const product = await productService_1.productService.update(req.params.id, parsed);
        res.json(product);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id", async (req, res, next) => {
    try {
        await productService_1.productService.delete(req.params.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map