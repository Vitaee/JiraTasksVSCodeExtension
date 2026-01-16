import * as vscode from "vscode";
import { DiffMode } from "../domain/ports/gitPort";

export type ProviderType = "openrouter" | "groq" | "ollama";

export type ExtensionSettings = {
  provider: ProviderType;
  openrouterBaseUrl: string;
  openrouterModel: string;
  openrouterSiteUrl: string;
  openrouterTitle: string;
  groqModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  promptLanguage: string;
  customInstructions: string;
  diffMode: DiffMode;
  temperature: number;
  maxCompletionTokens: number;
  topP: number;
  maxFiles: number;
  maxCharsPerFile: number;
  storageFile: string;
};

export function readSettings(): ExtensionSettings {
  const config = vscode.workspace.getConfiguration("jiraTasks");

  return {
    provider: config.get<ProviderType>("provider", "openrouter"),
    openrouterBaseUrl: config.get(
      "openrouterBaseUrl",
      "https://openrouter.ai/api/v1"
    ),
    openrouterModel: config.get(
      "openrouterModel",
      "nvidia/nemotron-3-nano-30b-a3b:free"
    ),
    openrouterSiteUrl: config.get("openrouterSiteUrl", ""),
    openrouterTitle: config.get("openrouterTitle", ""),
    groqModel: config.get("groqModel", "moonshotai/kimi-k2-instruct-0905"),
    ollamaBaseUrl: config.get("ollamaBaseUrl", "http://localhost:11434"),
    ollamaModel: config.get("ollamaModel", "llama3.1"),
    promptLanguage: config.get("promptLanguage", "en"),
    customInstructions: config.get("customInstructions", ""),
    diffMode: config.get<DiffMode>("diffMode", "staged+unstaged"),
    temperature: config.get("temperature", 0.6),
    maxCompletionTokens: config.get("maxCompletionTokens", 4096),
    topP: config.get("topP", 1),
    maxFiles: config.get("maxFiles", 40),
    maxCharsPerFile: config.get("maxCharsPerFile", 6000),
    storageFile: config.get("storageFile", "jira-tasks.md"),
  };
}
