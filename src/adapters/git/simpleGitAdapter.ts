import simpleGit from "simple-git";
import {
  DiffFile,
  DiffMode,
  DiffOptions,
  DiffSnapshot,
  GitPort,
} from "../../domain/ports/gitPort";

type DiffScope = "staged" | "unstaged";

export class SimpleGitAdapter implements GitPort {
  private readonly git;

  constructor(private readonly workspaceRoot: string) {
    this.git = simpleGit({ baseDir: workspaceRoot });
  }

  async getDiff(options?: DiffOptions): Promise<DiffSnapshot> {
    const branch = (await this.git.revparse(["--abbrev-ref", "HEAD"])).trim();
    const mode: DiffMode = options?.mode ?? "staged+unstaged";

    if (mode === "staged+unstaged") {
      const staged = await this.getDiffEntries("staged");
      const unstaged = await this.getDiffEntries("unstaged");
      const merged = mergeDiffEntries(staged, unstaged);
      return { branch, files: Array.from(merged.values()) };
    }

    const entries = await this.getDiffEntries(mode);
    return { branch, files: Array.from(entries.values()) };
  }

  private async getDiffEntries(scope: DiffScope): Promise<Map<string, DiffFile>> {
    const paths = await this.getPaths(scope);
    const entries = new Map<string, DiffFile>();

    for (const filePath of paths) {
      const entry = await this.getFileDiff(scope, filePath);
      entries.set(filePath, entry);
    }

    return entries;
  }

  private async getPaths(scope: DiffScope): Promise<string[]> {
    const args = [...this.diffArgs(scope), "--name-only"];
    const output = await this.git.diff(args);
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private async getFileDiff(
    scope: DiffScope,
    filePath: string
  ): Promise<DiffFile> {
    const args = this.diffArgs(scope);
    const numstat = await this.git.raw([
      "diff",
      ...args,
      "--numstat",
      "--",
      filePath,
    ]);

    const isBinary = isBinaryFromNumstat(numstat);
    const diff = isBinary ? "" : await this.git.diff([...args, "--", filePath]);

    return {
      path: filePath,
      diff,
      isBinary,
    };
  }

  private diffArgs(scope: DiffScope): string[] {
    return scope === "staged" ? ["--cached"] : [];
  }
}

function mergeDiffEntries(
  staged: Map<string, DiffFile>,
  unstaged: Map<string, DiffFile>
): Map<string, DiffFile> {
  const merged = new Map<string, DiffFile>(staged);

  for (const [path, entry] of unstaged) {
    const existing = merged.get(path);
    if (!existing) {
      merged.set(path, entry);
      continue;
    }

    const diffParts: string[] = [];
    if (existing.diff.trim()) {
      diffParts.push(`### Staged\n${existing.diff.trimEnd()}`);
    }
    if (entry.diff.trim()) {
      diffParts.push(`### Unstaged\n${entry.diff.trimEnd()}`);
    }

    merged.set(path, {
      path,
      diff: diffParts.join("\n"),
      isBinary: existing.isBinary || entry.isBinary,
    });
  }

  return merged;
}

function isBinaryFromNumstat(output: string): boolean {
  const line = output
    .split("\n")
    .map((value) => value.trim())
    .find((value) => value.length > 0);

  if (!line) {
    return false;
  }

  const parts = line.split("\t");
  if (parts.length < 3) {
    return false;
  }

  const added = parts[0];
  const deleted = parts[1];
  return added === "-" || deleted === "-";
}
