import OpenAI from "openai";
import { LLMPort } from "../../domain/ports/llmPort";

export type OpenRouterOptions = {
  apiKey: string;
  baseUrl: string;
  model: string;
  siteUrl?: string;
  title?: string;
  temperature: number;
  maxCompletionTokens: number;
  topP: number;
};

export class OpenRouterStrategy implements LLMPort {
  private readonly client: OpenAI;

  constructor(private readonly options: OpenRouterOptions) {
    const defaultHeaders: Record<string, string> = {};
    if (options.siteUrl?.trim()) {
      defaultHeaders["HTTP-Referer"] = options.siteUrl.trim();
    }
    if (options.title?.trim()) {
      defaultHeaders["X-Title"] = options.title.trim();
    }

    const clientOptions: {
      apiKey: string;
      baseURL: string;
      defaultHeaders?: Record<string, string>;
    } = {
      apiKey: options.apiKey,
      baseURL: options.baseUrl,
    };

    if (Object.keys(defaultHeaders).length > 0) {
      clientOptions.defaultHeaders = defaultHeaders;
    }

    this.client = new OpenAI(clientOptions);
  }

  async complete(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.options.model,
      messages: [{ role: "user", content: prompt }],
      temperature: this.options.temperature,
      max_completion_tokens: this.options.maxCompletionTokens,
      top_p: this.options.topP,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenRouter response missing content.");
    }

    return content;
  }
}
