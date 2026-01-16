import { describe, expect, test } from "bun:test";
import { ContextPruner, NoopIgnoreMatcher } from "../contextPruner";
import { DiffSnapshot } from "../../ports/gitPort";

describe("ContextPruner", () => {
  test("limits files and truncates diffs", () => {
    const snapshot: DiffSnapshot = {
      branch: "main",
      files: [
        { path: "src/a.ts", diff: "1234567890" },
        { path: "src/b.ts", diff: "abcdef" },
      ],
    };

    const pruner = new ContextPruner(new NoopIgnoreMatcher(), {
      maxFiles: 1,
      maxCharsPerFile: 4,
    });

    const result = pruner.prune(snapshot);
    expect(result.snapshot.files.length).toBe(1);
    expect(result.snapshot.files[0]?.diff).toBe("1234");
  });

  test("reports truncated files metadata", () => {
    const snapshot: DiffSnapshot = {
      branch: "feature/test",
      files: [
        { path: "src/large.ts", diff: "a".repeat(100) },
        { path: "src/small.ts", diff: "tiny" },
      ],
    };

    const pruner = new ContextPruner(new NoopIgnoreMatcher(), {
      maxFiles: 10,
      maxCharsPerFile: 20,
    });

    const result = pruner.prune(snapshot);

    expect(result.truncatedFiles.length).toBe(1);
    expect(result.truncatedFiles[0]).toEqual({
      path: "src/large.ts",
      originalLength: 100,
      truncatedTo: 20,
    });
    expect(result.snapshot.files[0]?.diff.length).toBe(20);
    expect(result.snapshot.files[1]?.diff).toBe("tiny");
  });

  test("reports droppedFilesCount when exceeding maxFiles", () => {
    const snapshot: DiffSnapshot = {
      branch: "main",
      files: [
        { path: "a.ts", diff: "diff1" },
        { path: "b.ts", diff: "diff2" },
        { path: "c.ts", diff: "diff3" },
        { path: "d.ts", diff: "diff4" },
      ],
    };

    const pruner = new ContextPruner(new NoopIgnoreMatcher(), {
      maxFiles: 2,
      maxCharsPerFile: 1000,
    });

    const result = pruner.prune(snapshot);

    expect(result.snapshot.files.length).toBe(2);
    expect(result.droppedFilesCount).toBe(2);
    expect(result.truncatedFiles.length).toBe(0);
  });

  test("files under limit are not marked as truncated", () => {
    const snapshot: DiffSnapshot = {
      branch: "main",
      files: [
        { path: "small.ts", diff: "short" },
      ],
    };

    const pruner = new ContextPruner(new NoopIgnoreMatcher(), {
      maxFiles: 10,
      maxCharsPerFile: 1000,
    });

    const result = pruner.prune(snapshot);

    expect(result.truncatedFiles.length).toBe(0);
    expect(result.droppedFilesCount).toBe(0);
    expect(result.snapshot.files[0]?.diff).toBe("short");
  });

  test("filters out binary files", () => {
    const snapshot: DiffSnapshot = {
      branch: "main",
      files: [
        { path: "image.png", diff: "binary data", isBinary: true },
        { path: "code.ts", diff: "const x = 1;" },
      ],
    };

    const pruner = new ContextPruner(new NoopIgnoreMatcher(), {
      maxFiles: 10,
      maxCharsPerFile: 1000,
    });

    const result = pruner.prune(snapshot);

    expect(result.snapshot.files.length).toBe(1);
    expect(result.snapshot.files[0]?.path).toBe("code.ts");
  });

  test("filters out ignored files", () => {
    const snapshot: DiffSnapshot = {
      branch: "main",
      files: [
        { path: "node_modules/pkg/index.js", diff: "module code" },
        { path: "src/app.ts", diff: "app code" },
      ],
    };

    const ignoreMatcher = {
      ignores: (path: string) => path.startsWith("node_modules/"),
    };

    const pruner = new ContextPruner(ignoreMatcher, {
      maxFiles: 10,
      maxCharsPerFile: 1000,
    });

    const result = pruner.prune(snapshot);

    expect(result.snapshot.files.length).toBe(1);
    expect(result.snapshot.files[0]?.path).toBe("src/app.ts");
  });
});
