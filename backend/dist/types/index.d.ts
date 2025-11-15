export interface AreaPayload {
    id?: string | number;
    name: string;
    squares: number;
    unitPrice: number;
    include: boolean;
}
export interface DeckPayload {
    include: boolean;
    estSheets?: number;
    sheetPrice?: number;
    freeSheets?: number;
}
export interface QuoteRequestPayload {
    company?: {
        name?: string;
        address?: string;
        phone?: string;
        site?: string;
    };
    rep?: {
        name?: string;
        phone?: string;
        email?: string;
    };
    repId?: string;
    customer?: {
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
    };
    jobName?: string;
    systemSlug?: string;
    systemName?: string;
    fortified?: boolean;
    applyPreset?: boolean;
    showDisclaimer?: boolean;
    disclaimerText?: string;
    taxRate?: number;
    deck?: DeckPayload;
    areas: AreaPayload[];
    notes?: string;
    scopeIntroOverride?: string;
    scopeBulletsOverride?: string[];
    componentsOverride?: string[];
    warrantyOverride?: string;
    pricingOverride?: string[];
    altPlyText?: string;
    scopeNotes?: string;
    syncOnSave?: boolean;
}
export interface QuoteCalculations {
    rows: Array<{
        name: string;
        squares: number;
        unitPrice: number;
        lineTotal: number;
        include: boolean;
    }>;
    totalSquares: number;
    deckCost: number;
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
}
//# sourceMappingURL=index.d.ts.map