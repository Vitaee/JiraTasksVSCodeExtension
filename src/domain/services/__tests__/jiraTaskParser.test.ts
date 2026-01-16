import { describe, expect, test } from "bun:test";
import { JiraTaskParser } from "../jiraTaskParser";
import { UserFacingError } from "../../../shared/errors";

const validJson = '{"summary":"Test","description":"Desc","acceptanceCriteria":["A"]}';

describe("JiraTaskParser", () => {
  test("parses valid JSON payload", () => {
    const parser = new JiraTaskParser();
    const result = parser.parse("```json\n" + validJson + "\n```");

    expect(result.summary).toBe("Test");
    expect(result.acceptanceCriteria).toEqual(["A"]);
  });

  test("throws on invalid JSON", () => {
    const parser = new JiraTaskParser();
    expect(() => parser.parse("{invalid json")).toThrow(UserFacingError);
  });
});
