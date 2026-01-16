import { DiffSnapshot } from "../ports/gitPort";

export interface IgnoreMatcher {
  ignores(path: string): boolean;
}

export class NoopIgnoreMatcher implements IgnoreMatcher {
  ignores(): boolean {
    return false;
  }
}

export type ContextPrunerOptions = {
  maxFiles: number;
  maxCharsPerFile: number;
};

export class ContextPruner {
  constructor(
    private readonly matcher: IgnoreMatcher,
    private readonly options: ContextPrunerOptions
  ) {}

  prune(snapshot: DiffSnapshot): DiffSnapshot {
    const filtered = snapshot.files.filter(
      (file) => !file.isBinary && !this.matcher.ignores(file.path)
    );

    const limited = filtered.slice(0, this.options.maxFiles).map((file) => ({
      ...file,
      diff: file.diff.slice(0, this.options.maxCharsPerFile),
    }));

    return {
      ...snapshot,
      files: limited,
    };
  }
}
