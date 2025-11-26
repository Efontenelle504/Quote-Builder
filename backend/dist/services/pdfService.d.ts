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
    areas: Array<{
        name: string;
        squares: number;
        lineTotal: number;
    }>;
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
export declare function createQuotePdf(payload: QuotePdfPayload): Promise<PdfResult>;
//# sourceMappingURL=pdfService.d.ts.map