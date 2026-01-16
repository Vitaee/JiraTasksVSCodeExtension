import { ZodError } from "zod";
import { JiraTask, jiraTaskSchema } from "../models/jiraTask";
import { TaskParserError, TaskParserPort } from "../ports/taskParserPort";
import { extractJsonBlock } from "../validation/jsonExtractor";

export class JiraTaskParser implements TaskParserPort {
  parse(raw: string): JiraTask {
    try {
      const jsonBlock = extractJsonBlock(raw);
      const data = JSON.parse(jsonBlock) as unknown;
      return jiraTaskSchema.parse(data);
    } catch (error) {
      throw new TaskParserError(
        "Invalid Jira task JSON from LLM.",
        raw,
        formatParserError(error)
      );
    }
  }
}

function formatParserError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error.";
}
