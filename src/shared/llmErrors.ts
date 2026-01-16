import { ProviderType } from "../config/settings";
import { UserFacingError, asErrorMessage } from "./errors";

type LlmErrorContext = {
  ollamaBaseUrl?: string;
};

export function mapLlmError(
  error: unknown,
  provider: ProviderType,
  context: LlmErrorContext = {}
): string {
  if (isMissingKeyError(error)) {
    if (provider === "openrouter") {
      return "Set API key with Jira: Set OpenRouter API Key.";
    }
    if (provider === "groq") {
      return "Set API key with Jira: Set Groq API Key.";
    }
  }

  const status = getStatusCode(error);
  if (status === 401 || status === 403) {
    return "Invalid key or insufficient permissions.";
  }

  if (status === 404) {
    return "Model not available. Check the model name.";
  }

  if (provider === "ollama" && isConnectionError(error)) {
    const baseUrl = context.ollamaBaseUrl?.trim() || "http://localhost:11434";
    return `Cannot reach Ollama at ${baseUrl}. Is it running?`;
  }

  if (error instanceof UserFacingError) {
    return error.message;
  }

  return asErrorMessage(error);
}

function isMissingKeyError(error: unknown): boolean {
  if (!(error instanceof UserFacingError)) {
    return false;
  }
  return /api key not found/i.test(error.message);
}

function getStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeError = error as {
    status?: number;
    response?: { status?: number };
  };

  if (typeof maybeError.status === "number") {
    return maybeError.status;
  }

  if (typeof maybeError.response?.status === "number") {
    return maybeError.response.status;
  }

  return undefined;
}

function isConnectionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (/fetch failed/i.test(message) || /ECONNREFUSED/i.test(message)) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: string; cause?: { code?: string } };
  return (
    maybeError.code === "ECONNREFUSED" ||
    maybeError.cause?.code === "ECONNREFUSED"
  );
}
