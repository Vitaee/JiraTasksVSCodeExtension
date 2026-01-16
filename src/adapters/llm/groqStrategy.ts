import { Groq } from "groq-sdk";
import { LLMPort } from "../../domain/ports/llmPort";
import { requireContent } from "./llmResponse";

export type GroqOptions = {
  apiKey: string;
  model: string;
  temperature: number;
  maxCompletionTokens: number;
  topP: number;
};

export class GroqStrategy implements LLMPort {
  private readonly client: Groq;

  constructor(private readonly options: GroqOptions) {
    this.client = new Groq({ apiKey: options.apiKey });
  }

  async complete(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.options.model,
      messages: [{ role: "user", content: prompt }],
      temperature: this.options.temperature,
      max_tokens: this.options.maxCompletionTokens,
      top_p: this.options.topP,
      stream: false,
    });

    return requireContent(response.choices?.[0]?.message?.content, "Groq");
  }
}
