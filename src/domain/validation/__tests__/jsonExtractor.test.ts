import { describe, expect, test } from "bun:test";
import { extractJsonBlock } from "../jsonExtractor";

const sampleJson = '{"summary":"Test","description":"Desc","acceptanceCriteria":["A"]}';

describe("extractJsonBlock", () => {
  test("extracts JSON from fenced block", () => {
    const raw = "Here you go:\n\n```json\n" + sampleJson + "\n```\n";
    expect(extractJsonBlock(raw)).toBe(sampleJson);
  });

  test("extracts JSON from braces", () => {
    const raw = `prefix ${sampleJson} suffix`;
    expect(extractJsonBlock(raw)).toBe(sampleJson);
  });

  test("throws when no JSON present", () => {
    expect(() => extractJsonBlock("no json here")).toThrow();
  });
});
