"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteService = void 0;
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../lib/config");
const prisma_1 = require("../lib/prisma");
const calculations_1 = require("./calculations");
const gohighlevelService_1 = require("./gohighlevelService");
const productService_1 = require("./productService");
const pdfService_1 = require("./pdfService");
const FORTIFIED_BULLET = "We guarantee the installation will be approved once evaluated by an independent FORTIFIED evaluator.";
const WORKMANSHIP_WARRANTY = "Lifetime workmanship warranty – Zuppardo's Renovations LLC";
async function getSettingArray(key, fallback) {
    const setting = await prisma_1.prisma.setting.findUnique({ where: { key } });
    return (setting === null || setting === void 0 ? void 0 : setting.value) || fallback;
}
async function getSettingString(key, fallback) {
    const setting = await prisma_1.prisma.setting.findUnique({ where: { key } });
    return (setting === null || setting === void 0 ? void 0 : setting.value) || fallback;
}
const sanitizeList = (values) => { var _a; return (_a = values === null || values === void 0 ? void 0 : values.filter((item) => item && item.trim().length > 0)) !== null && _a !== void 0 ? _a : []; };
const TEMPLATE_REGEX = /\{\{\s*([A-Z0-9_]+)\s*\}\}/gi;
const fillTemplateText = (value, ctx) => {
    if (!value)
        return value !== null && value !== void 0 ? value : "";
    return value.replace(TEMPLATE_REGEX, (_match, key) => { var _a; return (_a = ctx[key.toUpperCase()]) !== null && _a !== void 0 ? _a : _match; });
};
const fillTemplateList = (values, ctx) => {
    const list = Array.isArray(values) ? values : [];
    return list.map((item) => fillTemplateText(item, ctx));
};
function buildScopeIntro(systemName, fortified) {
    const system = systemName || "the specified roof system";
    const base = `Furnish and install ${system} on all listed roof areas.`;
    const detail = fortified
        ? " Install to IBHS FORTIFIED Roof standards (sealed deck/attachment/flashings/vents)."
        : " Perform work per manufacturer instructions and applicable standards.";
    return `${base}${detail} Include accessories: new drip edge, pipe boots, flashings, valleys, and required fasteners.`;
}
function buildRawQuoteText(input) {
    const lines = [];
    lines.push(input.company.name || "");
    if (input.company.address)
        lines.push(input.company.address);
    if (input.company.phone)
        lines.push(`Phone: ${input.company.phone}`);
    if (input.company.site)
        lines.push(input.company.site);
    lines.push("");
    lines.push(`Company Representative: ${input.rep.name || ""}`);
    if (input.rep.phone)
        lines.push(`Phone: ${input.rep.phone}`);
    if (input.rep.email)
        lines.push(input.rep.email);
    lines.push("");
    lines.push(input.qdate);
    lines.push("Customer Information");
    if (input.customer.name)
        lines.push(input.customer.name);
    if (input.customer.address)
        lines.push(input.customer.address);
    if (input.customer.phone)
        lines.push(input.customer.phone);
    if (input.customer.email)
        lines.push(input.customer.email);
    if (input.jobName) {
        lines.push("");
        lines.push(`Job: ${input.jobName}`);
    }
    lines.push("");
    if (input.systemName)
        lines.push(`SYSTEM: ${input.systemName}`);
    lines.push("AREAS AND QUANTITIES (squares rounded up)");
    input.areas.forEach((area) => lines.push(`${area.name}: ${area.squares} squares = ${area.lineTotal.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    })}`));
    lines.push("");
    lines.push("INSTALLATION SCOPE");
    if (input.scopeIntro) {
        lines.push(`• ${input.scopeIntro}`);
    }
    input.scopeBullets.forEach((bullet) => lines.push(`• ${bullet}`));
    if (input.noteBlock) {
        lines.push("");
        lines.push("PROJECT-SPECIFIC NOTES");
        lines.push(input.noteBlock);
    }
    lines.push("");
    lines.push("SYSTEM COMPONENTS");
    input.components.forEach((component, idx) => {
        const letter = String.fromCharCode(65 + idx);
        lines.push(`${letter}) ${component}`);
    });
    lines.push("");
    lines.push("WARRANTIES");
    input.warranties.forEach((entry) => lines.push(`• ${entry}`));
    if (input.disclaimer) {
        lines.push("");
        lines.push("IMPORTANT NOTICE");
        lines.push(input.disclaimer);
    }
    lines.push("");
    lines.push("PRICING SUMMARY");
    input.pricingLines.forEach((line) => lines.push(line));
    if (input.altPlyText) {
        lines.push("");
        lines.push("OPTION – CUSTOMER-SUPPLIED PLYWOOD (LABOR-ONLY)");
        lines.push(input.altPlyText);
    }
    return lines.join("\n");
}
function serializeQuote(quote) {
    return {
        ...quote,
        subtotal: Number(quote.subtotal),
        total: Number(quote.total),
        taxRate: quote.taxRate ? Number(quote.taxRate) : 0,
    };
}
exports.quoteService = {
    async list(limit = 50) {
        const quotes = await prisma_1.prisma.quote.findMany({
            orderBy: { createdAt: "desc" },
            take: limit,
        });
        return quotes.map(serializeQuote);
    },
    async get(id) {
        const quote = await prisma_1.prisma.quote.findUnique({ where: { id } });
        if (!quote)
            return null;
        return serializeQuote(quote);
    },
    async create(payload) {
        var _a, _b, _c, _d;
        if (!payload.areas || payload.areas.length === 0) {
            throw new Error("At least one area is required");
        }
        let reps = payload.rep || {};
        if (payload.repId) {
            const storedRep = await prisma_1.prisma.salesRep.findUnique({ where: { id: payload.repId } });
            if (storedRep) {
                reps = {
                    name: storedRep.name,
                    phone: storedRep.phone || reps.phone,
                    email: storedRep.email || reps.email,
                };
            }
        }
        const company = { ...config_1.config.company, ...(payload.company || {}) };
        const customer = payload.customer || {};
        const deck = payload.deck || { include: false };
        const taxRate = Number(payload.taxRate || 0);
        const calcs = (0, calculations_1.calculateTotals)(payload.areas, deck, taxRate);
        const product = payload.systemSlug ? await productService_1.productService.getBySlug(payload.systemSlug) : null;
        const systemName = payload.systemName || (product === null || product === void 0 ? void 0 : product.name) || ((_a = payload.areas[0]) === null || _a === void 0 ? void 0 : _a.name) || "Roof System";
        const defaultScope = await getSettingArray("defaultScopeBullets", []);
        const defaultDisclaimer = await getSettingString("defaultDisclaimer", "This estimate is provided in good faith.");
        const templateCtx = {
            TOTAL_SQUARES: calcs.totalSquares.toString(),
            SYSTEM_NAME: systemName,
        };
        const productScopeIntro = (product === null || product === void 0 ? void 0 : product.scopeIntro) ? fillTemplateText(product.scopeIntro, templateCtx) : undefined;
        const scopeIntro = payload.scopeIntroOverride || productScopeIntro || buildScopeIntro(systemName, payload.fortified);
        const productScopeBullets = fillTemplateList(product === null || product === void 0 ? void 0 : product.scopeBullets, templateCtx);
        const baseScope = payload.scopeBulletsOverride && payload.scopeBulletsOverride.length
            ? payload.scopeBulletsOverride
            : productScopeBullets.length
                ? productScopeBullets
                : defaultScope;
        const scopeBullets = sanitizeList(baseScope);
        if (payload.fortified && !scopeBullets.some((line) => /fortified/i.test(line))) {
            scopeBullets.push(FORTIFIED_BULLET);
        }
        const productComponents = fillTemplateList(product === null || product === void 0 ? void 0 : product.componentBullets, templateCtx);
        const components = sanitizeList(((_b = payload.componentsOverride) === null || _b === void 0 ? void 0 : _b.length) ? payload.componentsOverride : productComponents);
        const warranties = [
            WORKMANSHIP_WARRANTY,
            payload.warrantyOverride || (product === null || product === void 0 ? void 0 : product.warrantyText) || "Manufacturer warranty as specified.",
        ];
        const financingInput = payload.financing || {};
        const monthlyPayment = (0, calculations_1.calculateMonthlyPayment)(calcs.grandTotal, financingInput.years, financingInput.apr);
        const financingInfo = {
            years: financingInput.years,
            apr: financingInput.apr,
            showOnQuote: financingInput.showOnQuote,
            showDetails: financingInput.showDetails,
            monthlyPayment,
        };
        const pricingLines = ((_c = payload.pricingOverride) === null || _c === void 0 ? void 0 : _c.length)
            ? payload.pricingOverride
            : (0, calculations_1.buildPricingLines)(calcs, taxRate);
        const hasMonthlyLine = pricingLines.some((line) => typeof line === "string" && /estimated monthly payment/i.test(line));
        if (financingInfo.showOnQuote && financingInfo.monthlyPayment && !hasMonthlyLine) {
            const monthlyLine = financingInfo.showDetails
                ? `Estimated monthly payment: ${monthlyPayment.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                })} (Assumes ${financingInfo.years || 0} years @ ${Number(financingInfo.apr || 0).toFixed(2)}% APR)`
                : `Estimated monthly payment: ${monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
            pricingLines.push(monthlyLine);
        }
        const disclaimerText = payload.showDisclaimer
            ? payload.disclaimerText || defaultDisclaimer
            : undefined;
        const pdfPayload = {
            id: "temp",
            createdAt: new Date(),
            company,
            rep: reps,
            customer,
            jobName: payload.jobName,
            systemName,
            fortified: payload.fortified,
            areas: calcs.rows.map((row) => ({ name: row.name, squares: row.squares, lineTotal: row.lineTotal })),
            totalSquares: calcs.totalSquares,
            subtotal: calcs.subtotal,
            taxAmount: calcs.taxAmount,
            grandTotal: calcs.grandTotal,
            scopeIntro,
            scopeBullets,
            components,
            warranties,
            pricingLines,
            deckCost: calcs.deckCost,
            notes: payload.notes,
            altPlyText: payload.altPlyText,
            financing: financingInfo,
            disclaimerText,
            showDisclaimer: Boolean(payload.showDisclaimer),
        };
        const rawQuoteText = buildRawQuoteText({
            company,
            rep: reps,
            customer,
            jobName: payload.jobName,
            qdate: (0, dayjs_1.default)().format("MM/DD/YYYY"),
            systemName,
            areas: pdfPayload.areas,
            scopeIntro,
            scopeBullets,
            noteBlock: payload.notes,
            components,
            warranties,
            disclaimer: disclaimerText,
            pricingLines,
            altPlyText: payload.altPlyText,
            financing: financingInfo,
        });
        const created = await prisma_1.prisma.quote.create({
            data: {
                repId: payload.repId,
                repName: reps.name,
                repPhone: reps.phone,
                repEmail: reps.email,
                customerName: customer.name,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                customerAddress: customer.address,
                jobName: payload.jobName,
                companyName: company.name,
                companyAddress: company.address,
                companyPhone: company.phone,
                companySite: company.site,
                systemName,
                productId: product === null || product === void 0 ? void 0 : product.id,
                fortified: Boolean(payload.fortified),
                applyPreset: Boolean((_d = payload.applyPreset) !== null && _d !== void 0 ? _d : true),
                showDisclaimer: Boolean(payload.showDisclaimer),
                disclaimerText,
                areas: pdfPayload.areas,
                deckAllowance: deck,
                adders: { altPlyText: payload.altPlyText, financing: financingInfo },
                taxRate,
                subtotal: calcs.subtotal,
                total: calcs.grandTotal,
                scopeIntro,
                scopeBullets: scopeBullets,
                components: components,
                pricingLines: pricingLines,
                notes: payload.notes,
                altPlyText: payload.altPlyText,
                rawQuoteText,
            },
        });
        pdfPayload.id = created.id;
        pdfPayload.createdAt = created.createdAt;
        const pdfResult = await (0, pdfService_1.createQuotePdf)(pdfPayload);
        let updated = await prisma_1.prisma.quote.update({
            where: { id: created.id },
            data: {
                pdfPath: pdfResult.relativePath,
            },
        });
        if (payload.syncOnSave) {
            const syncResult = await gohighlevelService_1.goHighLevelService.syncQuote({ quote: updated, pdfPath: pdfResult.absolutePath });
            updated = await prisma_1.prisma.quote.update({
                where: { id: updated.id },
                data: {
                    goHighLevelContactId: syncResult.contactId,
                    goHighLevelOpportunityId: syncResult.opportunityId,
                    status: client_1.QuoteStatus.SENT,
                },
            });
        }
        return serializeQuote(updated);
    },
    async sync(id) {
        const quote = await prisma_1.prisma.quote.findUnique({ where: { id } });
        if (!quote)
            throw new Error("Quote not found");
        if (!quote.pdfPath)
            throw new Error("Quote PDF missing. Regenerate before syncing.");
        const pdfPath = path_1.default.join(config_1.config.storageDir, quote.pdfPath);
        const syncResult = await gohighlevelService_1.goHighLevelService.syncQuote({ quote, pdfPath });
        const updated = await prisma_1.prisma.quote.update({
            where: { id },
            data: {
                goHighLevelContactId: syncResult.contactId,
                goHighLevelOpportunityId: syncResult.opportunityId,
                status: client_1.QuoteStatus.SENT,
            },
        });
        return serializeQuote(updated);
    },
};
//# sourceMappingURL=quoteService.js.map