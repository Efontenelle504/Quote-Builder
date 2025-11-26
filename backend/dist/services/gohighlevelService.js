"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.goHighLevelService = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../lib/config");
class GoHighLevelService {
    constructor() {
        this.apiPrefix = "/v2";
        this.client = axios_1.default.create({
            baseURL: config_1.config.goHighLevel.baseUrl,
            timeout: 20000,
        });
    }
    get enabled() {
        return Boolean(config_1.config.goHighLevel.apiKey);
    }
    get headers() {
        return {
            Authorization: `Bearer ${config_1.config.goHighLevel.apiKey}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
        };
    }
    async findContact(query) {
        if (!this.enabled)
            return null;
        try {
            const params = new URLSearchParams();
            if (query.email)
                params.append("email", query.email);
            if (query.phone)
                params.append("phone", query.phone);
            const { data } = await this.client.get(`${this.apiPrefix}/contacts/lookup?${params.toString()}`, {
                headers: this.headers,
            });
            return (data === null || data === void 0 ? void 0 : data.contact) || data;
        }
        catch (err) {
            console.warn("GoHighLevel lookup failed", err.message);
            return null;
        }
    }
    async upsertContact(contact) {
        if (!this.enabled)
            return null;
        try {
            const { data } = await this.client.post(`${this.apiPrefix}/contacts/`, {
                ...contact,
            }, { headers: this.headers });
            return (data === null || data === void 0 ? void 0 : data.contact) || data;
        }
        catch (err) {
            console.warn("GoHighLevel upsertContact failed", err.message);
            return null;
        }
    }
    async createOrUpdateOpportunity(ctx) {
        if (!this.enabled ||
            config_1.config.goHighLevel.disableOpportunities ||
            !config_1.config.goHighLevel.pipelineId ||
            !config_1.config.goHighLevel.stageId) {
            return null;
        }
        const payload = {
            name: ctx.quote.jobName || ctx.quote.customerName || "Roofing Quote",
            pipelineId: config_1.config.goHighLevel.pipelineId,
            stageId: config_1.config.goHighLevel.stageId,
            status: "open",
            monetaryValue: Number(ctx.quote.total),
            contactId: ctx.contactId,
            assignedTo: config_1.config.goHighLevel.userId || undefined,
        };
        try {
            if (ctx.opportunityId) {
                const { data } = await this.client.put(`${this.apiPrefix}/opportunities/${ctx.opportunityId}`, payload, {
                    headers: this.headers,
                });
                return (data === null || data === void 0 ? void 0 : data.opportunity) || data;
            }
            const { data } = await this.client.post(`${this.apiPrefix}/opportunities/`, payload, {
                headers: this.headers,
            });
            return (data === null || data === void 0 ? void 0 : data.opportunity) || data;
        }
        catch (err) {
            console.warn("GoHighLevel opportunity sync failed", err.message);
            return null;
        }
    }
    async uploadDocument(contactId, pdfPath) {
        if (!this.enabled || !contactId)
            return null;
        try {
            const form = new form_data_1.default();
            form.append("type", "contact");
            form.append("contactId", contactId);
            form.append("notes", "Roofing quote");
            form.append("file", fs_1.default.createReadStream(pdfPath), path_1.default.basename(pdfPath));
            const { data } = await this.client.post(`${this.apiPrefix}/media/`, form, {
                headers: {
                    Authorization: `Bearer ${config_1.config.goHighLevel.apiKey}`,
                    Version: "2021-07-28",
                    ...form.getHeaders(),
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });
            return data;
        }
        catch (err) {
            console.warn("GoHighLevel upload failed", err.message);
            return null;
        }
    }
    async createNote(contactId, body) {
        if (!this.enabled || !contactId)
            return null;
        try {
            const { data } = await this.client.post(`${this.apiPrefix}/notes/`, {
                contactId,
                body,
            }, { headers: this.headers });
            return data;
        }
        catch (err) {
            console.warn("GoHighLevel note failed", err.message);
            return null;
        }
    }
    async syncQuote(payload) {
        if (!this.enabled) {
            return { skipped: true };
        }
        const { quote, pdfPath } = payload;
        const contact = await this.upsertContact({
            name: quote.customerName || undefined,
            email: quote.customerEmail || undefined,
            phone: quote.customerPhone || undefined,
            address1: quote.customerAddress || undefined,
        });
        const contactId = (contact === null || contact === void 0 ? void 0 : contact.id) || (contact === null || contact === void 0 ? void 0 : contact._id);
        const opportunity = await this.createOrUpdateOpportunity(config_1.config.goHighLevel.disableOpportunities
            ? { quote }
            : { quote, contactId, opportunityId: quote.goHighLevelOpportunityId || undefined });
        if (contactId && pdfPath) {
            await this.uploadDocument(contactId, pdfPath);
        }
        if (contactId) {
            const summary = `Quote total: $${Number(quote.total).toFixed(2)}`;
            await this.createNote(contactId, summary);
        }
        return {
            contactId,
            opportunityId: (opportunity === null || opportunity === void 0 ? void 0 : opportunity.id) || (opportunity === null || opportunity === void 0 ? void 0 : opportunity._id),
        };
    }
}
exports.goHighLevelService = new GoHighLevelService();
//# sourceMappingURL=gohighlevelService.js.map