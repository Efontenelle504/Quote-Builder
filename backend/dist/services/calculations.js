"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usd = void 0;
exports.calculateTotals = calculateTotals;
exports.buildPricingLines = buildPricingLines;
const ceilSquares = (value) => Math.max(0, Math.ceil(Number(value || 0)));
function calculateTotals(areas, deck, taxRate) {
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
    if (deck === null || deck === void 0 ? void 0 : deck.include) {
        const estSheets = ceilSquares(deck.estSheets);
        const freeSheets = ceilSquares(deck.freeSheets);
        const billableSheets = Math.max(0, estSheets - freeSheets);
        deckCost = billableSheets * Number(deck.sheetPrice || 0);
    }
    const subtotal = areaSubtotal + deckCost;
    const taxPercent = Number(taxRate || 0) / 100;
    const taxAmount = subtotal * taxPercent;
    const grandTotal = subtotal + taxAmount;
    return {
        rows,
        totalSquares,
        deckCost,
        subtotal,
        taxAmount,
        grandTotal,
    };
}
const usd = (value) => Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
exports.usd = usd;
function buildPricingLines(calcs, taxRate) {
    const lines = [];
    lines.push(`Squares (rounded): ${calcs.totalSquares}`);
    lines.push(`Subtotal before tax: ${(0, exports.usd)(calcs.subtotal)}`);
    if (taxRate) {
        lines.push(`Sales tax (${taxRate}%): ${(0, exports.usd)(calcs.taxAmount)}`);
    }
    lines.push(`TOTAL: ${(0, exports.usd)(calcs.grandTotal)}`);
    if (calcs.deckCost) {
        lines.push(`Decking allowance: +${(0, exports.usd)(calcs.deckCost)}`);
    }
    return lines;
}
//# sourceMappingURL=calculations.js.map