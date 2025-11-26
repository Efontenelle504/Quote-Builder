import axios, { AxiosInstance } from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { config } from "../lib/config";
import { Quote } from "@prisma/client";

interface SyncContext {
  contactId?: string;
  opportunityId?: string;
}

interface SyncPayload {
  quote: Quote;
  pdfPath?: string;
}

const isValidEmail = (email?: string) => {
  if (!email) return false;
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
};

const normalizePhone = (phone?: string) => {
  if (!phone) return undefined;
  const cleaned = phone.replace(/[^\d+]/g, "");
  const digits = cleaned.startsWith("+") ? cleaned : cleaned.replace(/^0+/, "");
  return digits.length >= 10 ? digits : undefined;
};

const unwrapErrorMessage = (err: unknown) => {
  const e = err as any;
  if (e?.response?.data?.message) return e.response.data.message as string;
  if (e?.message) return e.message as string;
  return "GoHighLevel request failed";
};

class GoHighLevelService {
  private client: AxiosInstance;
  private readonly apiPrefix = "/v2";

  constructor() {
    this.client = axios.create({
      baseURL: config.goHighLevel.baseUrl,
      timeout: 20000,
    });
  }

  private get enabled() {
    return Boolean(config.goHighLevel.apiKey);
  }

  private get headers() {
    return {
      Authorization: `Bearer ${config.goHighLevel.apiKey}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    };
  }

  async findContact(query: { email?: string; phone?: string }) {
    if (!this.enabled) return null;
    try {
      const params = new URLSearchParams();
      const email = isValidEmail(query.email) ? (query.email as string).trim() : undefined;
      const phone = normalizePhone(query.phone);
      if (email) params.append("email", email);
      if (phone) params.append("phone", phone);
      if (!params.toString()) return null;
      const { data } = await this.client.get(`${this.apiPrefix}/contacts/lookup?${params.toString()}`, {
        headers: this.headers,
      });
      return data?.contact || data;
    } catch (err) {
      console.warn("GoHighLevel lookup failed", (err as Error).message);
      return null;
    }
  }

  async upsertContact(contact: {
    name?: string;
    email?: string;
    phone?: string;
    address1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }) {
    if (!this.enabled) return null;
    try {
      const email = isValidEmail(contact.email) ? (contact.email as string).trim() : undefined;
      const phone = normalizePhone(contact.phone);
      const body = {
        ...contact,
        email,
        phone,
      };
      const { data } = await this.client.post(
        `${this.apiPrefix}/contacts/`,
        body,
        { headers: this.headers }
      );
      return data?.contact || data;
    } catch (err) {
      const message = unwrapErrorMessage(err);
      console.warn("GoHighLevel upsertContact failed", message);
      throw new Error(message);
    }
  }

  async createOrUpdateOpportunity(ctx: SyncContext & { quote: Quote }) {
    if (
      !this.enabled ||
      config.goHighLevel.disableOpportunities ||
      !config.goHighLevel.pipelineId ||
      !config.goHighLevel.stageId
    ) {
      return null;
    }
    const payload = {
      name: ctx.quote.jobName || ctx.quote.customerName || "Roofing Quote",
      pipelineId: config.goHighLevel.pipelineId,
      stageId: config.goHighLevel.stageId,
      status: "open",
      monetaryValue: Number(ctx.quote.total),
      contactId: ctx.contactId,
      assignedTo: config.goHighLevel.userId || undefined,
    };
    try {
      if (ctx.opportunityId) {
        const { data } = await this.client.put(`${this.apiPrefix}/opportunities/${ctx.opportunityId}`, payload, {
          headers: this.headers,
        });
        return data?.opportunity || data;
      }
      const { data } = await this.client.post(`${this.apiPrefix}/opportunities/`, payload, {
        headers: this.headers,
      });
      return data?.opportunity || data;
    } catch (err) {
      console.warn("GoHighLevel opportunity sync failed", (err as Error).message);
      return null;
    }
  }

  async uploadDocument(contactId: string, pdfPath: string) {
    if (!this.enabled || !contactId) return null;
    try {
      const form = new FormData();
      form.append("type", "contact");
      form.append("contactId", contactId);
      form.append("notes", "Roofing quote");
      form.append("file", fs.createReadStream(pdfPath), path.basename(pdfPath));
      const { data } = await this.client.post(`${this.apiPrefix}/media/`, form, {
        headers: {
          Authorization: `Bearer ${config.goHighLevel.apiKey}`,
          Version: "2021-07-28",
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      return data;
    } catch (err) {
      const message = unwrapErrorMessage(err);
      console.warn("GoHighLevel upload failed", message);
      return null;
    }
  }

  async createNote(contactId: string | undefined, body: string) {
    if (!this.enabled || !contactId) return null;
    try {
      const { data } = await this.client.post(
        `${this.apiPrefix}/notes/`,
        {
          contactId,
          body,
        },
        { headers: this.headers }
      );
      return data;
    } catch (err) {
      console.warn("GoHighLevel note failed", (err as Error).message);
      return null;
    }
  }

  async syncQuote(payload: SyncPayload) {
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
    const contactId = contact?.id || contact?._id;
    const opportunity = await this.createOrUpdateOpportunity(
      config.goHighLevel.disableOpportunities
        ? { quote }
        : { quote, contactId, opportunityId: quote.goHighLevelOpportunityId || undefined }
    );
    if (contactId && pdfPath && config.goHighLevel.uploadPdf) {
      await this.uploadDocument(contactId, pdfPath);
    }
    if (contactId) {
      const summary = `Quote total: $${Number(quote.total).toFixed(2)}`;
      await this.createNote(contactId, summary);
    }
    return {
      contactId,
      opportunityId: opportunity?.id || opportunity?._id,
    };
  }
}

export const goHighLevelService = new GoHighLevelService();
