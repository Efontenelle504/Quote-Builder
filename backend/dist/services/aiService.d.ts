type AiSection = "scope" | "components" | "warranty" | "notes";
export interface AiRewritePayload {
    section: AiSection;
    systemName?: string;
    totalSquares: number;
    currentText?: string;
    currentList?: string[];
    notes?: string;
}
export interface AiRewriteResponse {
    text?: string;
    list?: string[];
}
export declare const aiService: {
    rewrite(payload: AiRewritePayload): Promise<AiRewriteResponse>;
};
export {};
//# sourceMappingURL=aiService.d.ts.map