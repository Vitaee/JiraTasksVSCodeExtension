import { JiraTask } from "../models/jiraTask";

export interface StoragePort {
  upsertTask(task: JiraTask): Promise<void>;
}
