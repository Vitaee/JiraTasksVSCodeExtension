import { describe, expect, test } from "bun:test";
import { extractJsonBlock } from "../jsonExtractor";

const sampleJson = '{"summary":"Test","description":"Desc","acceptanceCriteria":["A"]}';

describe("extractJsonBlock", () => {
  test("extracts JSON from fenced block with json language", () => {
    const raw = "Here you go:\n\n```json\n" + sampleJson + "\n```\n";
    expect(extractJsonBlock(raw)).toBe(sampleJson);
  });

  test("extracts JSON from fenced block without language identifier", () => {
    const raw = "Here is your response:\n```\n" + sampleJson + "\n```";
    expect(extractJsonBlock(raw)).toBe(sampleJson);
  });

  test("extracts JSON from fenced block with JSON (uppercase)", () => {
    const raw = "```JSON\n" + sampleJson + "\n```";
    expect(extractJsonBlock(raw)).toBe(sampleJson);
  });

  test("extracts JSON from braces", () => {
    const raw = `prefix ${sampleJson} suffix`;
    expect(extractJsonBlock(raw)).toBe(sampleJson);
  });

  test("throws when no JSON present", () => {
    expect(() => extractJsonBlock("no json here")).toThrow();
  });

  test("strips trailing comma in object", () => {
    const raw = '{"summary":"Test","description":"Desc",}';
    const result = extractJsonBlock(raw);
    expect(result).toBe('{"summary":"Test","description":"Desc"}');
  });

  test("strips trailing comma in array", () => {
    const raw = '{"items":["a","b","c",]}';
    const result = extractJsonBlock(raw);
    expect(result).toBe('{"items":["a","b","c"]}');
  });

  test("strips trailing comma with whitespace", () => {
    const raw = `{
  "summary": "Test",
  "items": [
    "one",
    "two",
  ]
}`;
    const result = extractJsonBlock(raw);
    expect(result).not.toContain(",\n  ]");
    expect(result).toContain('"two"\n  ]');
  });

  test("strips trailing comma in fenced block", () => {
    const raw = '```json\n{"key":"value",}\n```';
    const result = extractJsonBlock(raw);
    expect(result).toBe('{"key":"value"}');
  });

  test("handles nested trailing commas", () => {
    const raw = '{"outer":{"inner":"value",},}';
    const result = extractJsonBlock(raw);
    expect(result).toBe('{"outer":{"inner":"value"}}');
  });

  test("preserves valid JSON without trailing commas", () => {
    const validJson = '{"a":1,"b":[1,2,3],"c":{"d":"e"}}';
    const result = extractJsonBlock(validJson);
    expect(result).toBe(validJson);
  });
});
