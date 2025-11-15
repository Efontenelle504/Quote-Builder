"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
const slugify_1 = __importDefault(require("slugify"));
const prisma_1 = require("../lib/prisma");
const slugOptions = { lower: true, strict: true };
exports.productService = {
    async list(options) {
        const { includeUnapproved, ownerEmail } = options || {};
        const where = {};
        if (!includeUnapproved) {
            where.isApproved = true;
        }
        if (ownerEmail) {
            where.OR = [
                { ownerEmail: ownerEmail.toLowerCase() },
                { ownerEmail: null },
            ];
        }
        return prisma_1.prisma.product.findMany({
            where,
            orderBy: { name: "asc" },
        });
    },
    async getBySlug(slug) {
        return prisma_1.prisma.product.findUnique({ where: { slug } });
    },
    async create(input) {
        var _a, _b, _c, _d, _e;
        const slug = (0, slugify_1.default)(input.name, slugOptions);
        return prisma_1.prisma.product.create({
            data: {
                ...input,
                slug,
                scopeBullets: (_a = input.scopeBullets) !== null && _a !== void 0 ? _a : [],
                componentBullets: (_b = input.componentBullets) !== null && _b !== void 0 ? _b : [],
                tags: (_c = input.tags) !== null && _c !== void 0 ? _c : [],
                ownerEmail: (_d = input.ownerEmail) === null || _d === void 0 ? void 0 : _d.toLowerCase(),
                isApproved: (_e = input.isApproved) !== null && _e !== void 0 ? _e : !input.isCustom,
            },
        });
    },
    async update(id, input) {
        var _a, _b, _c, _d;
        const slug = (0, slugify_1.default)(input.name, slugOptions);
        return prisma_1.prisma.product.update({
            where: { id },
            data: {
                ...input,
                slug,
                scopeBullets: (_a = input.scopeBullets) !== null && _a !== void 0 ? _a : [],
                componentBullets: (_b = input.componentBullets) !== null && _b !== void 0 ? _b : [],
                tags: (_c = input.tags) !== null && _c !== void 0 ? _c : [],
                ownerEmail: (_d = input.ownerEmail) === null || _d === void 0 ? void 0 : _d.toLowerCase(),
            },
        });
    },
    async delete(id) {
        return prisma_1.prisma.product.delete({ where: { id } });
    },
};
//# sourceMappingURL=productService.js.map