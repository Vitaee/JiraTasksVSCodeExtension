import { LLMPort } from "../ports/llmPort";

const HEALTHCHECK_PROMPT = 'Reply with "OK" only.';

export type LlmHealthCheckResult = {
  durationMs: number;
  response: string;
};

export class LlmHealthCheckService {
  constructor(private readonly llm: LLMPort) {}

  async testConnection(): Promise<LlmHealthCheckResult> {
    const start = Date.now();
    const response = await this.llm.complete(HEALTHCHECK_PROMPT);
    const durationMs = Date.now() - start;

    return {
      durationMs,
      response: response.trim(),
    };
  }
}
