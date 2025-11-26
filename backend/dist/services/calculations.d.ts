import { AreaPayload, DeckPayload, QuoteCalculations } from "../types";
export declare function calculateTotals(areas: AreaPayload[], deck: DeckPayload | undefined, taxRate: number | undefined): QuoteCalculations;
export declare const usd: (value: number) => string;
export declare function buildPricingLines(calcs: QuoteCalculations, taxRate?: number): string[];
export declare function calculateMonthlyPayment(principal: number | undefined, years: number | undefined, apr: number | undefined): number;
//# sourceMappingURL=calculations.d.ts.map