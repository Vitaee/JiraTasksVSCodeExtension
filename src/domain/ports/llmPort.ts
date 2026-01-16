export interface LLMPort {
  complete(prompt: string): Promise<string>;
}
