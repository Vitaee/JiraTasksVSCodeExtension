import { describe, expect, test } from "bun:test";
import { createLlmStrategy } from "../llmFactory";
import { ExtensionSettings } from "../../../config/settings";
import { SecretStorePort } from "../../../domain/ports/secretStorePort";
import { UserFacingError } from "../../../shared/errors";
import { OpenRouterStrategy } from "../openRouterStrategy";
import { GroqStrategy } from "../groqStrategy";

class FakeSecrets implements SecretStorePort {
  constructor(private readonly data: Record<string, string> = {}) {}

  getSecret(key: string): Promise<string | undefined> {
    return Promise.resolve(this.data[key]);
  }

  setSecret(key: string, value: string): Promise<void> {
    this.data[key] = value;
    return Promise.resolve();
  }
}

function baseSettings(): ExtensionSettings {
  return {
    provider: "openrouter",
    openrouterBaseUrl: "https://openrouter.ai/api/v1",
    openrouterModel: "nvidia/nemotron-3-nano-30b-a3b:free",
    openrouterSiteUrl: "",
    openrouterTitle: "",
    groqModel: "moonshotai/kimi-k2-instruct-0905",
    promptLanguage: "en",
    customInstructions: "",
    diffMode: "staged+unstaged",
    temperature: 0.6,
    maxCompletionTokens: 4096,
    topP: 1,
    maxFiles: 40,
    maxCharsPerFile: 6000,
    storageFile: "jira-tasks.md",
  };
}

describe("createLlmStrategy", () => {
  test("throws when OpenRouter key is missing", async () => {
    const settings = baseSettings();
    const secrets = new FakeSecrets();

    await expect(createLlmStrategy(settings, secrets)).rejects.toThrow(
      UserFacingError
    );
  });

  test("throws when Groq key is missing", async () => {
    const settings = { ...baseSettings(), provider: "groq" };
    const secrets = new FakeSecrets();

    await expect(createLlmStrategy(settings, secrets)).rejects.toThrow(
      UserFacingError
    );
  });

  test("creates OpenRouter strategy when key exists", async () => {
    const settings = baseSettings();
    const secrets = new FakeSecrets({ openrouterApiKey: "test-key" });

    const strategy = await createLlmStrategy(settings, secrets);
    expect(strategy).toBeInstanceOf(OpenRouterStrategy);
  });

  test("creates Groq strategy when key exists", async () => {
    const settings = { ...baseSettings(), provider: "groq" };
    const secrets = new FakeSecrets({ groqApiKey: "test-key" });

    const strategy = await createLlmStrategy(settings, secrets);
    expect(strategy).toBeInstanceOf(GroqStrategy);
  });
});
