import { UserFacingError } from "../../shared/errors";

/**
 * Removes trailing commas before closing brackets/braces
 * which are a common LLM output issue
 */
function cleanJson(json: string): string {
  return json.replace(/,(\s*[}\]])/g, "$1");
}

export function extractJsonBlock(raw: string): string {
  // Match various code fence formats (with or without language identifier)
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return cleanJson(fenced[1].trim());
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return cleanJson(raw.slice(firstBrace, lastBrace + 1).trim());
  }

  throw new UserFacingError("No JSON payload found in LLM response.");
}
