"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const config_1 = require("../lib/config");
const aiService_1 = require("../services/aiService");
const router = (0, express_1.Router)();
const rewriteSchema = zod_1.z.object({
    section: zod_1.z.enum(["scope", "components", "warranty", "notes"]),
    systemName: zod_1.z.string().optional(),
    totalSquares: zod_1.z.number().nonnegative(),
    currentText: zod_1.z.string().optional(),
    currentList: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
});
router.post("/rewrite", async (req, res, next) => {
    if (!config_1.config.openai.apiKey) {
        return res.status(503).json({ message: "OpenAI is not configured" });
    }
    try {
        const payload = rewriteSchema.parse(req.body);
        const result = await aiService_1.aiService.rewrite(payload);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map