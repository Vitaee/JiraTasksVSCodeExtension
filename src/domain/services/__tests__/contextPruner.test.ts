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
    expect(result.files.length).toBe(1);
    expect(result.files[0]?.diff).toBe("1234");
  });
});
