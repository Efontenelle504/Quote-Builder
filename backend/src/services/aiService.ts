import OpenAI from "openai";
import { config } from "../lib/config";

type AiSection = "scope" | "components" | "warranty" | "notes";

const SECTION_INSTRUCTIONS: Record<AiSection, string> = {
  scope:
    "Rewrite the INSTALLATION SCOPE intro and bullet list for the described roofing project. Return JSON {\"text\":string, \"list\":string[]} with 3-10 concise bullet items.",
  components:
    "Rewrite the SYSTEM COMPONENTS list. Return JSON {\"list\":string[]} with detailed bullet items describing materials/components.",
  warranty:
    "Rewrite the WARRANTY language. Return JSON {\"text\":string, \"list\":string[]} where list holds bullet points when appropriate.",
  notes:
    "Rewrite the project-specific notes. Return JSON {\"text\":string} using a professional, courteous tone.",
};

const client = config.openai.apiKey ? new OpenAI({ apiKey: config.openai.apiKey }) : null;

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

const SYSTEM_PROMPT = `You are a senior estimator at Zuppardo's Renovations.
Always respond with valid JSON representing the rewritten content.
Channel the voice of a professional estimator and keep outputs concise but thorough.`;

export const aiService = {
  async rewrite(payload: AiRewritePayload): Promise<AiRewriteResponse> {
    if (!client) throw new Error("OpenAI API key is not configured");

    const instruction = SECTION_INSTRUCTIONS[payload.section];
    const userPrompt = `Section: ${payload.section}
System Name: ${payload.systemName || "Unknown"}
Total Squares: ${payload.totalSquares}
Instructions: ${instruction}
Current Text:\n${payload.currentText || ""}\nCurrent List:\n${(payload.currentList || []).join("\n")}\nAdditional Notes:\n${payload.notes || ""}`;

    const response = await client.responses.create({
      model: config.openai.model,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const rawText =
      response.output_text?.trim() ||
      (response.output ?? [])
        .map((item: any) => {
          if (item && Array.isArray(item.content)) {
            return item.content.map((block: any) => block.text ?? block.output_text ?? "").join("");
          }
          return "";
        })
        .join("")
        .trim();

    if (!rawText) {
      throw new Error("OpenAI returned an empty response");
    }

    try {
      const parsed = JSON.parse(rawText);
      return {
        text: typeof parsed.text === "string" ? parsed.text.trim() : undefined,
        list: Array.isArray(parsed.list)
          ? parsed.list.map((line: string) => line.trim()).filter(Boolean)
          : undefined,
      };
    } catch (err) {
      throw new Error("Unable to parse AI response. Ensure the model returned valid JSON.");
    }
  },
};
