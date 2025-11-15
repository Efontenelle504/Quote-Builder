import { Quote } from "@prisma/client";
interface SyncContext {
    contactId?: string;
    opportunityId?: string;
}
interface SyncPayload {
    quote: Quote;
    pdfPath?: string;
}
declare class GoHighLevelService {
    private client;
    private readonly apiPrefix;
    constructor();
    private get enabled();
    private get headers();
    findContact(query: {
        email?: string;
        phone?: string;
    }): Promise<any>;
    upsertContact(contact: {
        name?: string;
        email?: string;
        phone?: string;
        address1?: string;
        city?: string;
        state?: string;
        postalCode?: string;
    }): Promise<any>;
    createOrUpdateOpportunity(ctx: SyncContext & {
        quote: Quote;
    }): Promise<any>;
    uploadDocument(contactId: string, pdfPath: string): Promise<any>;
    createNote(contactId: string | undefined, body: string): Promise<any>;
    syncQuote(payload: SyncPayload): Promise<{
        skipped: boolean;
        contactId?: undefined;
        opportunityId?: undefined;
    } | {
        contactId: any;
        opportunityId: any;
        skipped?: undefined;
    }>;
}
export declare const goHighLevelService: GoHighLevelService;
export {};
//# sourceMappingURL=gohighlevelService.d.ts.map