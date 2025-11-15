"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../lib/config");
const SECTION_INSTRUCTIONS = {
    scope: "Rewrite the INSTALLATION SCOPE intro and bullet list for the described roofing project. Return JSON {\"text\":string, \"list\":string[]} with 3-10 concise bullet items.",
    components: "Rewrite the SYSTEM COMPONENTS list. Return JSON {\"list\":string[]} with detailed bullet items describing materials/components.",
    warranty: "Rewrite the WARRANTY language. Return JSON {\"text\":string, \"list\":string[]} where list holds bullet points when appropriate.",
    notes: "Rewrite the project-specific notes. Return JSON {\"text\":string} using a professional, courteous tone.",
};
const client = config_1.config.openai.apiKey ? new openai_1.default({ apiKey: config_1.config.openai.apiKey }) : null;
const SYSTEM_PROMPT = `You are a senior estimator at Zuppardo's Renovations.
Always respond with valid JSON representing the rewritten content.
Channel the voice of a professional estimator and keep outputs concise but thorough.`;
exports.aiService = {
    async rewrite(payload) {
        var _a, _b;
        if (!client)
            throw new Error("OpenAI API key is not configured");
        const instruction = SECTION_INSTRUCTIONS[payload.section];
        const userPrompt = `Section: ${payload.section}
System Name: ${payload.systemName || "Unknown"}
Total Squares: ${payload.totalSquares}
Instructions: ${instruction}
Current Text:\n${payload.currentText || ""}\nCurrent List:\n${(payload.currentList || []).join("\n")}\nAdditional Notes:\n${payload.notes || ""}`;
        const response = await client.responses.create({
            model: config_1.config.openai.model,
            input: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
            ],
        });
        const rawText = ((_a = response.output_text) === null || _a === void 0 ? void 0 : _a.trim()) ||
            ((_b = response.output) !== null && _b !== void 0 ? _b : [])
                .map((item) => {
                if (item && Array.isArray(item.content)) {
                    return item.content.map((block) => { var _a, _b; return (_b = (_a = block.text) !== null && _a !== void 0 ? _a : block.output_text) !== null && _b !== void 0 ? _b : ""; }).join("");
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
                    ? parsed.list.map((line) => line.trim()).filter(Boolean)
                    : undefined,
            };
        }
        catch (err) {
            throw new Error("Unable to parse AI response. Ensure the model returned valid JSON.");
        }
    },
};
//# sourceMappingURL=aiService.js.map