import { describe, expect, test } from "bun:test";
import { PromptBuilder } from "../promptBuilder";
import { JIRA_TASK_PROMPT_TEMPLATE } from "../../prompts/jiraTaskPrompt";

describe("PromptBuilder", () => {
  test("renders branch and file data", () => {
    const builder = new PromptBuilder(JIRA_TASK_PROMPT_TEMPLATE);
    const prompt = builder.build({
      branch: "feature/test",
      language: "en",
      customInstructions: "Keep it short",
      files: [{ path: "src/app.ts", diff: "diff --git" }],
    });

    expect(prompt).toContain("Branch: feature/test");
    expect(prompt).toContain("src/app.ts");
    expect(prompt).toContain("Keep it short");
  });
});
