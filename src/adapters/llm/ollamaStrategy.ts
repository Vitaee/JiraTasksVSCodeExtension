import OpenAI from "openai";
import { LLMPort } from "../../domain/ports/llmPort";
import { requireContent } from "./llmResponse";

export type OllamaOptions = {
  baseUrl: string;
  model: string;
  temperature: number;
  maxCompletionTokens: number;
  topP: number;
};

export class OllamaStrategy implements LLMPort {
  private readonly client: OpenAI;

  constructor(private readonly options: OllamaOptions) {
    this.client = new OpenAI({
      apiKey: "ollama",
      baseURL: normalizeBaseUrl(options.baseUrl),
    });
  }

  async complete(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.options.model,
      messages: [{ role: "user", content: prompt }],
      temperature: this.options.temperature,
      max_tokens: this.options.maxCompletionTokens,
      top_p: this.options.topP,
    });

    return requireContent(response.choices?.[0]?.message?.content, "Ollama");
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return "http://localhost:11434/v1";
  }
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}
