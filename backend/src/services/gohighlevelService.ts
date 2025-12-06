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
  // Private Integration tokens use top-level paths (no /v2).
  private readonly apiPrefix = "";

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

  async healthCheck() {
    if (!this.enabled) {
      return { ok: false, message: "GOHIGHLEVEL_API_KEY not set" };
    }
    try {
      const params = new URLSearchParams({ limit: "1" });
      if (config.goHighLevel.locationId) {
        params.append("locationId", config.goHighLevel.locationId);
      }
      await this.client.get(`/contacts?${params.toString()}`, { headers: this.headers });
      return { ok: true };
    } catch (err) {
      const e = err as any;
      const status = e?.response?.status;
      return { ok: false, status, message: unwrapErrorMessage(err) };
    }
  }

  private async getContactById(id: string) {
    if (!this.enabled) return null;
    try {
      const { data } = await this.client.get(`/contacts/${id}`, {
        headers: this.headers,
      });
      return (data as any)?.contact || data;
    } catch (err) {
      console.warn("GoHighLevel getContactById failed", (err as Error).message);
      return null;
    }
  }

  async findContact(query: { email?: string; phone?: string }) {
    if (!this.enabled) return null;
    try {
      const email = isValidEmail(query.email) ? (query.email as string).trim() : undefined;
      const phone = normalizePhone(query.phone);
      if (!email && !phone) return null;

      const locationId = config.goHighLevel.locationId || undefined;
      const body: Record<string, unknown> = {};
      if (email) body.email = email;
      if (phone) body.phone = phone;
      if (locationId) body.locationId = locationId;

      // Attempt to create (or find) the contact.
      const { data } = await this.client.post(`/contacts`, body, {
        headers: this.headers,
      });
      return (data as any)?.contact || data;
    } catch (err) {
      const e = err as any;
      const res = e?.response;
      const meta = res?.data?.meta;
      // Location blocks duplicates: use the existing contactId.
      if (res?.status === 400 && meta?.contactId) {
        return this.getContactById(meta.contactId);
      }
      console.warn("GoHighLevel lookup failed", unwrapErrorMessage(err));
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
      const locationId = config.goHighLevel.locationId || undefined;
      const body = {
        ...contact,
        email,
        phone,
        locationId,
      };
      const { data } = await this.client.post(`/contacts`, body, { headers: this.headers });
      return (data as any)?.contact || data;
    } catch (err) {
      const message = unwrapErrorMessage(err);
      const e = err as any;
      const res = e?.response;
      const meta = res?.data?.meta;
      // Duplicate rule: update existing contact instead of failing.
      if (res?.status === 400 && meta?.contactId) {
        try {
          const { data } = await this.client.put(`/contacts/${meta.contactId}`, {
            ...contact,
          }, { headers: this.headers });
          return (data as any)?.contact || data;
        } catch (updateErr) {
          console.warn(
            "GoHighLevel update contact failed",
            unwrapErrorMessage(updateErr)
          );
        }
      }
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
        const { data } = await this.client.put(`/v2/opportunities/${ctx.opportunityId}`, payload, {
          headers: this.headers,
        });
        return data?.opportunity || data;
      }
      const { data } = await this.client.post(`/v2/opportunities/`, payload, {
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
      const { data } = await this.client.post(`/media`, form, {
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
