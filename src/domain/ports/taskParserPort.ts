import { JiraTask } from "../models/jiraTask";
import { UserFacingError } from "../../shared/errors";

export interface TaskParserPort {
  parse(raw: string): JiraTask;
}

export class TaskParserError extends UserFacingError {
  readonly raw: string;
  readonly details?: string;

  constructor(message: string, raw: string, details?: string) {
    super(message);
    this.name = "TaskParserError";
    this.raw = raw;
    this.details = details;
  }
}
