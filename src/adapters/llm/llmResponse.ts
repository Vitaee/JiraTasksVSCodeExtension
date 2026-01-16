export function requireContent(
  content: string | null | undefined,
  provider: string
): string {
  if (!content) {
    throw new Error(`${provider} response missing content.`);
  }
  return content;
}
