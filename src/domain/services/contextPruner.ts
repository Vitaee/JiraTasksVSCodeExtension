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

export type TruncationInfo = {
  path: string;
  originalLength: number;
  truncatedTo: number;
};

export type PruneResult = {
  snapshot: DiffSnapshot;
  truncatedFiles: TruncationInfo[];
  droppedFilesCount: number;
};

export class ContextPruner {
  constructor(
    private readonly matcher: IgnoreMatcher,
    private readonly options: ContextPrunerOptions
  ) {}

  prune(snapshot: DiffSnapshot): PruneResult {
    const filtered = snapshot.files.filter(
      (file) => !file.isBinary && !this.matcher.ignores(file.path)
    );

    const droppedFilesCount = Math.max(
      0,
      filtered.length - this.options.maxFiles
    );
    const truncatedFiles: TruncationInfo[] = [];

    const limited = filtered.slice(0, this.options.maxFiles).map((file) => {
      const originalLength = file.diff.length;
      const truncatedDiff = file.diff.slice(0, this.options.maxCharsPerFile);

      if (originalLength > this.options.maxCharsPerFile) {
        truncatedFiles.push({
          path: file.path,
          originalLength,
          truncatedTo: this.options.maxCharsPerFile,
        });
      }

      return {
        ...file,
        diff: truncatedDiff,
      };
    });

    return {
      snapshot: {
        ...snapshot,
        files: limited,
      },
      truncatedFiles,
      droppedFilesCount,
    };
  }
}
