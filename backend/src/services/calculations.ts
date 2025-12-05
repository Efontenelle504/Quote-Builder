import { AreaPayload, DeckPayload, QuoteCalculations } from "../types";

const ceilSquares = (value: number | undefined) => Math.max(0, Math.ceil(Number(value || 0)));

export function calculateTotals(
  areas: AreaPayload[],
  deck: DeckPayload | undefined,
  taxRate: number | undefined,
  discountPercentInput?: number
): QuoteCalculations {
  const rows = areas.map((area) => {
    const squares = ceilSquares(area.squares);
    const unitPrice = Number(area.unitPrice || 0);
    const include = Boolean(area.include);
    const lineTotal = include ? squares * unitPrice : 0;
    return { name: area.name, squares, unitPrice, include, lineTotal };
  });

  const totalSquares = rows.filter((r) => r.include).reduce((sum, row) => sum + row.squares, 0);
  const areaSubtotal = rows.filter((r) => r.include).reduce((sum, row) => sum + row.lineTotal, 0);

  let deckCost = 0;
  if (deck?.include) {
    const estSheets = ceilSquares(deck.estSheets);
    const freeSheets = ceilSquares(deck.freeSheets);
    const billableSheets = Math.max(0, estSheets - freeSheets);
    deckCost = billableSheets * Number(deck.sheetPrice || 0);
  }

  const subtotal = areaSubtotal + deckCost;
  const discountPercent = Math.max(0, Number(discountPercentInput || 0));
  const discountRate = discountPercent / 100;
  const discountAmount = subtotal * discountRate;
  const taxableSubtotal = subtotal - discountAmount;
  const taxPercent = Number(taxRate || 0) / 100;
  const taxAmount = taxableSubtotal * taxPercent;
  const grandTotal = taxableSubtotal + taxAmount;

  return {
    rows,
    totalSquares,
    deckCost,
    subtotal,
    discountPercent,
    discountAmount,
    taxableSubtotal,
    taxAmount,
    grandTotal,
  };
}

export const usd = (value: number) =>
  Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

export function buildPricingLines(calcs: QuoteCalculations, taxRate?: number) {
  const lines: string[] = [];
  lines.push(`Squares (rounded): ${calcs.totalSquares}`);
  lines.push(`Subtotal before discount/tax: ${usd(calcs.subtotal)}`);
  if (calcs.discountAmount > 0 && calcs.discountPercent > 0) {
    lines.push(`Discount (${calcs.discountPercent}%): -${usd(calcs.discountAmount)}`);
  }
  if (taxRate) {
    lines.push(`Sales tax (${taxRate}%): ${usd(calcs.taxAmount)}`);
  }
  lines.push(`TOTAL: ${usd(calcs.grandTotal)}`);
  if (calcs.deckCost) {
    lines.push(`Decking allowance: +${usd(calcs.deckCost)}`);
  }
  return lines;
}

export function calculateMonthlyPayment(principal: number | undefined, years: number | undefined, apr: number | undefined) {
  const p = Number(principal || 0);
  const y = Number(years || 0);
  if (!isFinite(p) || p <= 0 || !isFinite(y) || y <= 0) return 0;
  const n = Math.max(1, Math.round(y * 12));
  const monthlyRate = Number(apr || 0) / 100 / 12;
  if (!isFinite(monthlyRate) || monthlyRate <= 0) {
    return p / n;
  }
  const factor = Math.pow(1 + monthlyRate, n);
  return (p * monthlyRate * factor) / (factor - 1);
}
