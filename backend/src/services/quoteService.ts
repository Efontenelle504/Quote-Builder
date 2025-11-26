import { Prisma, Quote, QuoteStatus } from "@prisma/client";
import dayjs from "dayjs";
import path from "path";
import { config } from "../lib/config";
import { prisma } from "../lib/prisma";
import { QuoteRequestPayload } from "../types";
import { buildPricingLines, calculateMonthlyPayment, calculateTotals } from "./calculations";
import { goHighLevelService } from "./gohighlevelService";
import { productService } from "./productService";
import { createQuotePdf, QuotePdfPayload } from "./pdfService";

const FORTIFIED_BULLET =
  "We guarantee the installation will be approved once evaluated by an independent FORTIFIED evaluator.";

const WORKMANSHIP_WARRANTY = "Lifetime workmanship warranty – Zuppardo's Renovations LLC";

async function getSettingArray(key: string, fallback: string[]) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return (setting?.value as string[]) || fallback;
}

async function getSettingString(key: string, fallback: string) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return (setting?.value as string) || fallback;
}

const sanitizeList = (values?: string[]) => values?.filter((item) => item && item.trim().length > 0) ?? [];

const TEMPLATE_REGEX = /\{\{\s*([A-Z0-9_]+)\s*\}\}/gi;

const fillTemplateText = (value: string | undefined | null, ctx: Record<string, string>) => {
  if (!value) return value ?? "";
  return value.replace(TEMPLATE_REGEX, (_match, key) => ctx[key.toUpperCase()] ?? _match);
};

const fillTemplateList = (values: Prisma.JsonValue | string[] | undefined | null, ctx: Record<string, string>) => {
  const list = Array.isArray(values) ? (values as string[]) : [];
  return list.map((item) => fillTemplateText(item, ctx));
};

function buildScopeIntro(systemName: string | undefined, fortified?: boolean) {
  const system = systemName || "the specified roof system";
  const base = `Furnish and install ${system} on all listed roof areas.`;
  const detail = fortified
    ? " Install to IBHS FORTIFIED Roof standards (sealed deck/attachment/flashings/vents)."
    : " Perform work per manufacturer instructions and applicable standards.";
  return `${base}${detail} Include accessories: new drip edge, pipe boots, flashings, valleys, and required fasteners.`;
}

function buildRawQuoteText(input: {
  company: QuotePdfPayload["company"];
  rep: QuotePdfPayload["rep"];
  customer: QuotePdfPayload["customer"];
  jobName?: string;
  qdate: string;
  systemName?: string;
  areas: QuotePdfPayload["areas"];
  scopeIntro?: string;
  scopeBullets: string[];
  noteBlock?: string;
  components: string[];
  warranties: string[];
  disclaimer?: string;
  pricingLines: string[];
  altPlyText?: string;
  financing?: {
    showOnQuote?: boolean;
    showDetails?: boolean;
    monthlyPayment?: number;
    years?: number;
    apr?: number;
  };
}) {
  const lines: string[] = [];
  lines.push(input.company.name || "");
  if (input.company.address) lines.push(input.company.address);
  if (input.company.phone) lines.push(`Phone: ${input.company.phone}`);
  if (input.company.site) lines.push(input.company.site);
  lines.push("");
  lines.push(`Company Representative: ${input.rep.name || ""}`);
  if (input.rep.phone) lines.push(`Phone: ${input.rep.phone}`);
  if (input.rep.email) lines.push(input.rep.email);
  lines.push("");
  lines.push(input.qdate);
  lines.push("Customer Information");
  if (input.customer.name) lines.push(input.customer.name);
  if (input.customer.address) lines.push(input.customer.address);
  if (input.customer.phone) lines.push(input.customer.phone);
  if (input.customer.email) lines.push(input.customer.email);
  if (input.jobName) {
    lines.push("");
    lines.push(`Job: ${input.jobName}`);
  }
  lines.push("");
  if (input.systemName) lines.push(`SYSTEM: ${input.systemName}`);
  lines.push("AREAS AND QUANTITIES (squares rounded up)");
  input.areas.forEach((area) =>
    lines.push(`${area.name}: ${area.squares} squares = ${area.lineTotal.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}`)
  );
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

function serializeQuote(quote: Quote) {
  return {
    ...quote,
    subtotal: Number(quote.subtotal),
    total: Number(quote.total),
    taxRate: quote.taxRate ? Number(quote.taxRate) : 0,
  };
}

export const quoteService = {
  async list(limit = 50) {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return quotes.map(serializeQuote);
  },

  async get(id: string) {
    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) return null;
    return serializeQuote(quote);
  },

  async create(payload: QuoteRequestPayload) {
    if (!payload.areas || payload.areas.length === 0) {
      throw new Error("At least one area is required");
    }
    let reps = payload.rep || {};
    if (payload.repId) {
      const storedRep = await prisma.salesRep.findUnique({ where: { id: payload.repId } });
      if (storedRep) {
        reps = {
          name: storedRep.name,
          phone: storedRep.phone || reps.phone,
          email: storedRep.email || reps.email,
        };
      }
    }
    const company = { ...config.company, ...(payload.company || {}) };
    const customer = payload.customer || {};
    const deck = payload.deck || { include: false };
    const taxRate = Number(payload.taxRate || 0);

    const calcs = calculateTotals(payload.areas, deck, taxRate);
    const product = payload.systemSlug ? await productService.getBySlug(payload.systemSlug) : null;
    const systemName = payload.systemName || product?.name || payload.areas[0]?.name || "Roof System";

    const defaultScope = await getSettingArray("defaultScopeBullets", []);
    const defaultDisclaimer = await getSettingString(
      "defaultDisclaimer",
      "This estimate is provided in good faith."
    );

    const templateCtx = {
      TOTAL_SQUARES: calcs.totalSquares.toString(),
      SYSTEM_NAME: systemName,
    };

    const productScopeIntro = product?.scopeIntro ? fillTemplateText(product.scopeIntro, templateCtx) : undefined;
    const scopeIntro = payload.scopeIntroOverride || productScopeIntro || buildScopeIntro(systemName, payload.fortified);

    const productScopeBullets = fillTemplateList(product?.scopeBullets as string[] | undefined, templateCtx);
    const baseScope =
      payload.scopeBulletsOverride && payload.scopeBulletsOverride.length
        ? payload.scopeBulletsOverride
        : productScopeBullets.length
        ? productScopeBullets
        : defaultScope;
    const scopeBullets = sanitizeList(baseScope);
    if (payload.fortified && !scopeBullets.some((line) => /fortified/i.test(line))) {
      scopeBullets.push(FORTIFIED_BULLET);
    }

    const productComponents = fillTemplateList(product?.componentBullets as string[] | undefined, templateCtx);
    const components = sanitizeList(payload.componentsOverride?.length ? payload.componentsOverride : productComponents);

    const warranties = [
      WORKMANSHIP_WARRANTY,
      payload.warrantyOverride || product?.warrantyText || "Manufacturer warranty as specified.",
    ];

    const financingInput = payload.financing || {};
    const monthlyPayment = calculateMonthlyPayment(calcs.grandTotal, financingInput.years, financingInput.apr);
    const financingInfo = {
      years: financingInput.years,
      apr: financingInput.apr,
      showOnQuote: financingInput.showOnQuote,
      showDetails: financingInput.showDetails,
      monthlyPayment,
    };

    const pricingLines = payload.pricingOverride?.length
      ? payload.pricingOverride
      : buildPricingLines(calcs, taxRate);
    const hasMonthlyLine = pricingLines.some((line) =>
      typeof line === "string" && /estimated monthly payment/i.test(line)
    );
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

    const pdfPayload: QuotePdfPayload = {
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
      qdate: dayjs().format("MM/DD/YYYY"),
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

    const created = await prisma.quote.create({
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
        productId: product?.id,
        fortified: Boolean(payload.fortified),
        applyPreset: Boolean(payload.applyPreset ?? true),
        showDisclaimer: Boolean(payload.showDisclaimer),
        disclaimerText,
        areas: pdfPayload.areas as Prisma.InputJsonValue,
        deckAllowance: (deck as unknown) as Prisma.InputJsonValue,
        adders: { altPlyText: payload.altPlyText, financing: financingInfo } as Prisma.InputJsonValue,
        taxRate,
        subtotal: calcs.subtotal,
        total: calcs.grandTotal,
        scopeIntro,
        scopeBullets: scopeBullets as Prisma.InputJsonValue,
        components: components as Prisma.InputJsonValue,
        pricingLines: pricingLines as Prisma.InputJsonValue,
        notes: payload.notes,
        altPlyText: payload.altPlyText,
        rawQuoteText,
      },
    });

    pdfPayload.id = created.id;
    pdfPayload.createdAt = created.createdAt;

    const pdfResult = await createQuotePdf(pdfPayload);

    let updated = await prisma.quote.update({
      where: { id: created.id },
      data: {
        pdfPath: pdfResult.relativePath,
      },
    });

    if (payload.syncOnSave) {
      const syncResult = await goHighLevelService.syncQuote({ quote: updated, pdfPath: pdfResult.absolutePath });
      updated = await prisma.quote.update({
        where: { id: updated.id },
        data: {
          goHighLevelContactId: syncResult.contactId,
          goHighLevelOpportunityId: syncResult.opportunityId,
          status: QuoteStatus.SENT,
        },
      });
    }

    return serializeQuote(updated);
  },

  async sync(id: string) {
    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) throw new Error("Quote not found");
    if (!quote.pdfPath) throw new Error("Quote PDF missing. Regenerate before syncing.");
    const pdfPath = path.join(config.storageDir, quote.pdfPath);
    const syncResult = await goHighLevelService.syncQuote({ quote, pdfPath });
    const updated = await prisma.quote.update({
      where: { id },
      data: {
        goHighLevelContactId: syncResult.contactId,
        goHighLevelOpportunityId: syncResult.opportunityId,
        status: QuoteStatus.SENT,
      },
    });
    return serializeQuote(updated);
  },
};
