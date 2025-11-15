"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
const repSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal("")),
    active: zod_1.z.boolean().optional(),
});
router.get("/", async (_req, res) => {
    const reps = await prisma_1.prisma.salesRep.findMany({ orderBy: { name: "asc" } });
    res.json(reps);
});
router.post("/", async (req, res, next) => {
    var _a;
    try {
        const payload = repSchema.parse(req.body);
        const rep = await prisma_1.prisma.salesRep.create({
            data: {
                name: payload.name,
                phone: payload.phone,
                email: payload.email || null,
                active: (_a = payload.active) !== null && _a !== void 0 ? _a : true,
            },
        });
        res.status(201).json(rep);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:id", async (req, res, next) => {
    var _a;
    try {
        const payload = repSchema.parse(req.body);
        const rep = await prisma_1.prisma.salesRep.update({
            where: { id: req.params.id },
            data: {
                name: payload.name,
                phone: payload.phone,
                email: payload.email || null,
                active: (_a = payload.active) !== null && _a !== void 0 ? _a : true,
            },
        });
        res.json(rep);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id/quotes", async (req, res, next) => {
    try {
        const quotes = await prisma_1.prisma.quote.findMany({
            where: { repId: req.params.id },
            orderBy: { createdAt: "desc" },
            take: 100,
        });
        res.json(quotes.map((q) => ({
            id: q.id,
            createdAt: q.createdAt,
            customerName: q.customerName,
            jobName: q.jobName,
            total: q.total,
            status: q.status,
        })));
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=salesReps.js.map