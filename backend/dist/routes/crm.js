"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const gohighlevelService_1 = require("../services/gohighlevelService");
const router = (0, express_1.Router)();
const lookupSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
});
router.post("/lookup", async (req, res, next) => {
    try {
        const payload = lookupSchema.parse(req.body);
        const contact = await gohighlevelService_1.goHighLevelService.findContact(payload);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found or CRM not configured." });
        }
        res.json(contact);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=crm.js.map