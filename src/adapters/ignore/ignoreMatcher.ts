import ignore from "ignore";
import path from "path";
import { FileSystemPort } from "../../domain/ports/fileSystemPort";
import { IgnoreMatcher } from "../../domain/services/contextPruner";

export async function createIgnoreMatcher(
  fileSystem: FileSystemPort,
  ignoreFiles: string[]
): Promise<IgnoreMatcher> {
  const ignorer = ignore();

  for (const ignoreFile of ignoreFiles) {
    const content = await fileSystem.readText(ignoreFile).catch(() => "");
    if (content.trim()) {
      ignorer.add(content);
    }
  }

  return new IgnorePatternMatcher(ignorer);
}

class IgnorePatternMatcher implements IgnoreMatcher {
  constructor(private readonly ignorer: ReturnType<typeof ignore>) {}

  ignores(filePath: string): boolean {
    const normalized = normalizePath(filePath);
    return this.ignorer.ignores(normalized);
  }
}

function normalizePath(filePath: string): string {
  const normalized = filePath.split(path.sep).join("/");
  return normalized.replace(/^\/+/, "").replace(/^\.\//, "");
}
