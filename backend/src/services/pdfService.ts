import fs from "fs";
import dayjs from "dayjs";
import PDFDocument from "pdfkit";
import slugify from "slugify";
import { ensureStorageDir, relativeStoragePath, storagePath } from "../lib/files";
import { usd } from "./calculations";

const slugOptions = { lower: true, strict: true } as const;

export interface QuotePdfPayload {
  id: string;
  createdAt: Date;
  company: {
    name?: string;
    address?: string;
    phone?: string;
    site?: string;
  };
  rep: {
    name?: string;
    phone?: string;
    email?: string;
  };
  customer: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  jobName?: string;
  systemName?: string;
  fortified?: boolean;
  areas: Array<{ name: string; squares: number; lineTotal: number }>;
  totalSquares: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  scopeIntro?: string;
  scopeBullets: string[];
  components: string[];
  warranties: string[];
  pricingLines: string[];
  deckCost: number;
  notes?: string;
  altPlyText?: string;
  disclaimerText?: string;
  showDisclaimer: boolean;
  financing?: {
    monthlyPayment?: number;
    years?: number;
    apr?: number;
    showDetails?: boolean;
    showOnQuote?: boolean;
  };
}

export interface PdfResult {
  fileName: string;
  absolutePath: string;
  relativePath: string;
}

export async function createQuotePdf(payload: QuotePdfPayload): Promise<PdfResult> {
  await ensureStorageDir();
  const safeName = slugify(payload.customer.name || payload.id, slugOptions) || "quote";
  const timestamp = dayjs(payload.createdAt).format("YYYYMMDD-HHmmss");
  const fileName = `${safeName}-${timestamp}.pdf`;
  const filePath = storagePath(fileName);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "LETTER" });
    const stream = fs.createWriteStream(filePath);
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);

    const safeNumber = (value: unknown, fallback = 0) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    };

    // Header
    doc
      .fontSize(18)
      .fillColor("#b11226")
      .text(payload.company.name || "Quote", { continued: false });
    doc.moveDown(0.2);
    doc
      .fontSize(10)
      .fillColor("#333")
      .text(payload.company.address || "", { lineGap: 2 })
      .text(payload.company.phone || "")
      .text(payload.company.site || "");

    doc.moveDown();
    doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Quote ID: ${payload.id}`)
      .text(`Date: ${dayjs(payload.createdAt).format("MMM D, YYYY")}`)
      .text(payload.systemName ? `System: ${payload.systemName}` : "");
    if (payload.jobName) {
      doc.text(`Job: ${payload.jobName}`);
    }
    if (payload.fortified) {
      doc.text("Includes IBHS FORTIFIED Roof requirements");
    }

    doc.moveDown();
    doc.fontSize(12).text("Company Representative", { underline: true });
    doc
      .fontSize(10)
      .text(payload.rep.name || "")
      .text(payload.rep.phone || "")
      .text(payload.rep.email || "");

    doc.moveDown();
    doc.fontSize(12).text("Customer", { underline: true });
    doc
      .fontSize(10)
      .text(payload.customer.name || "")
      .text(payload.customer.address || "")
      .text(payload.customer.phone || "")
      .text(payload.customer.email || "");

    doc.moveDown();
    doc.fontSize(12).text("Areas & Pricing", { underline: true });
    const tableTop = safeNumber(doc.y);
    const colWidths = { name: 260, sq: 100, price: 140 };
    const left = safeNumber(doc.page.margins.left, 40);
    const right = safeNumber(doc.page.width - doc.page.margins.right, 550);
    const xName = left;
    const xSq = left + colWidths.name;
    const xTotal = left + colWidths.name + colWidths.sq;

    doc
      .fontSize(10)
      .fillColor("#666")
      .text("Area", xName, tableTop, { width: colWidths.name })
      .text("Squares", xSq, tableTop, { width: colWidths.sq, align: "right" })
      .text("Total", xTotal, tableTop, { width: colWidths.price, align: "right" });

    doc.moveDown(0.3);
    doc.strokeColor("#ddd").moveTo(left, safeNumber(doc.y)).lineTo(right, safeNumber(doc.y)).stroke();

    payload.areas.forEach((area) => {
      const rowTop = safeNumber(doc.y);
      doc
        .fillColor("#000")
        .text(area.name, xName, rowTop, { width: colWidths.name })
        .text(String(area.squares), xSq, rowTop, {
          width: colWidths.sq,
          align: "right",
        })
        .text(usd(area.lineTotal), xTotal, rowTop, {
          width: colWidths.price,
          align: "right",
        });
      doc.moveDown(0.4);
    });

    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Squares (rounded): ${payload.totalSquares}`);
    if (payload.deckCost) {
      doc.text(`Decking allowance: +${usd(payload.deckCost)}`);
    }
    doc.text(`Subtotal: ${usd(payload.subtotal)}`);
    if (payload.taxAmount) {
      doc.text(`Tax: ${usd(payload.taxAmount)}`);
    }
    doc
      .fontSize(12)
      .fillColor("#b11226")
      .text(`Grand Total: ${usd(payload.grandTotal)}`);
    if (payload.financing?.showOnQuote && payload.financing.monthlyPayment) {
      const detail =
        payload.financing.showDetails && (payload.financing.years || payload.financing.apr)
          ? ` (Assumes ${payload.financing.years || 0} years @ ${Number(payload.financing.apr || 0).toFixed(2)}% APR)`
          : "";
      doc
        .fontSize(11)
        .fillColor("#000")
        .text(`Estimated Monthly Payment: ${usd(payload.financing.monthlyPayment)}${detail}`);
    }

    const addList = (title: string, items: string[]) => {
      if (!items.length) return;
      doc.moveDown();
      doc.fontSize(12).fillColor("#000").text(title, { underline: true });
      doc.moveDown(0.2);
      doc.fontSize(10);
      items.forEach((item) => {
        doc.circle(45, doc.y + 4, 2).fill("#b11226");
        doc.fillColor("#000").text(`   ${item}`, 50, doc.y - 4, { width: 500 });
        doc.moveDown(0.3);
      });
    };

    if (payload.scopeIntro) {
      doc.moveDown();
      doc.fontSize(11).fillColor("#000").text(payload.scopeIntro, { width: 520 });
    }

    addList("Installation Scope", payload.scopeBullets);
    addList("System Components", payload.components);
    addList("Warranties", payload.warranties);

    if (payload.notes) {
      doc.moveDown();
      doc.fontSize(12).text("Project Notes", { underline: true });
      doc.fontSize(10).text(payload.notes, { width: 520 });
    }

    if (payload.pricingLines.length) {
      doc.moveDown();
      doc.fontSize(12).text("Pricing Summary", { underline: true });
      doc.moveDown(0.2);
      doc.fontSize(10).fillColor("#000");
      payload.pricingLines.forEach((line) => {
        doc.text(`• ${line}`, { width: 520 });
      });
    }

    if (payload.altPlyText) {
      doc.moveDown();
      doc.fontSize(11).text("Option – Customer-supplied plywood", { underline: true });
      doc.fontSize(10).text(payload.altPlyText, { width: 520 });
    }

    if (payload.showDisclaimer && payload.disclaimerText) {
      doc.moveDown();
      doc.fontSize(9).fillColor("#666").text(payload.disclaimerText, { width: 520 });
    }

    doc.addPage();
    doc.fontSize(12).fillColor("#000").text("Approvals");
    doc.moveDown();
    doc.moveTo(60, doc.y).lineTo(260, doc.y).stroke();
    doc.text("Company Authorized Signature", 60, doc.y + 5);
    doc.moveDown(2);
    doc.moveTo(60, doc.y).lineTo(260, doc.y).stroke();
    doc.text("Customer Signature", 60, doc.y + 5);

    doc.pipe(stream);
    doc.end();
  });

  return {
    fileName,
    absolutePath: filePath,
    relativePath: relativeStoragePath(filePath),
  };
}
