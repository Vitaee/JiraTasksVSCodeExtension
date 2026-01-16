import { ExtensionSettings } from "../../config/settings";
import { LLMPort } from "../../domain/ports/llmPort";
import { SecretStorePort } from "../../domain/ports/secretStorePort";
import { UserFacingError } from "../../shared/errors";
import { GroqStrategy } from "./groqStrategy";
import { OllamaStrategy } from "./ollamaStrategy";
import { OpenRouterStrategy } from "./openRouterStrategy";

export async function createLlmStrategy(
  settings: ExtensionSettings,
  secrets: SecretStorePort
): Promise<LLMPort> {
  if (settings.provider === "openrouter") {
    const apiKey = await secrets.getSecret("openrouterApiKey");
    if (!apiKey) {
      throw new UserFacingError(
        "OpenRouter API key not found. Use the command to set it first."
      );
    }
    const baseUrl = settings.openrouterBaseUrl.trim() ||
      "https://openrouter.ai/api/v1";
    return new OpenRouterStrategy({
      apiKey,
      baseUrl,
      model: settings.openrouterModel,
      siteUrl: settings.openrouterSiteUrl,
      title: settings.openrouterTitle,
      temperature: settings.temperature,
      maxCompletionTokens: settings.maxCompletionTokens,
      topP: settings.topP,
    });
  }

  if (settings.provider === "ollama") {
    return new OllamaStrategy({
      baseUrl: settings.ollamaBaseUrl,
      model: settings.ollamaModel,
      temperature: settings.temperature,
      maxCompletionTokens: settings.maxCompletionTokens,
      topP: settings.topP,
    });
  }

  const groqApiKey = await secrets.getSecret("groqApiKey");
  if (!groqApiKey) {
    throw new UserFacingError(
      "Groq API key not found. Use the command to set it first."
    );
  }

  return new GroqStrategy({
    apiKey: groqApiKey,
    model: settings.groqModel,
    temperature: settings.temperature,
    maxCompletionTokens: settings.maxCompletionTokens,
    topP: settings.topP,
  });
}
