import { JiraTask } from "../models/jiraTask";
import { DiffMode, GitPort } from "../ports/gitPort";
import { LLMPort } from "../ports/llmPort";
import { StoragePort } from "../ports/storagePort";
import { TaskParserError, TaskParserPort } from "../ports/taskParserPort";
import { UserFacingError } from "../../shared/errors";
import { ContextPruner } from "./contextPruner";
import { PromptBuilder } from "./promptBuilder";
import { RepairPromptBuilder } from "./repairPromptBuilder";
import { SecretSanitizer } from "./secretSanitizer";
import { Logger } from "../../shared/logger";

export type GenerateOptions = {
  language: string;
  customInstructions?: string;
  diffMode: DiffMode;
};

export class TaskGeneratorService {
  constructor(
    private readonly git: GitPort,
    private readonly llm: LLMPort,
    private readonly parser: TaskParserPort,
    private readonly storage: StoragePort,
    private readonly contextPruner: ContextPruner,
    private readonly promptBuilder: PromptBuilder,
    private readonly secretSanitizer: SecretSanitizer,
    private readonly repairPromptBuilder: RepairPromptBuilder,
    private readonly logger?: Logger
  ) {}

  async generate(options: GenerateOptions): Promise<JiraTask> {
    const snapshot = await this.git.getDiff({ mode: options.diffMode });
    const pruneResult = this.contextPruner.prune(snapshot);

    if (pruneResult.snapshot.files.length === 0) {
      throw new UserFacingError("No git changes found to analyze.");
    }

    // Log truncation warnings
    if (pruneResult.truncatedFiles.length > 0) {
      const truncatedPaths = pruneResult.truncatedFiles
        .map((t) => `${t.path} (${t.originalLength} → ${t.truncatedTo} chars)`)
        .join(", ");
      this.logger?.warn(
        `Context truncated: ${pruneResult.truncatedFiles.length} file(s) exceeded limit: ${truncatedPaths}`
      );
    }

    if (pruneResult.droppedFilesCount > 0) {
      this.logger?.warn(
        `${pruneResult.droppedFilesCount} file(s) dropped due to maxFiles limit`
      );
    }

    const sanitized = this.secretSanitizer.sanitizeSnapshot(pruneResult.snapshot);
    const customInstructions = options.customInstructions
      ? this.secretSanitizer.sanitizeText(options.customInstructions)
      : "";

    const prompt = this.promptBuilder.build({
      branch: sanitized.branch,
      files: sanitized.files,
      language: options.language,
      customInstructions,
    });

    const raw = await this.llm.complete(prompt);
    const task = await this.parseWithRepair(raw);

    await this.storage.upsertTask(task);

    return task;
  }

  private async parseWithRepair(raw: string): Promise<JiraTask> {
    try {
      return this.parser.parse(raw);
    } catch (error) {
      if (!(error instanceof TaskParserError)) {
        throw error;
      }

      const repairPrompt = this.repairPromptBuilder.build({
        raw: error.raw,
        error: error.details ?? "Unknown parse error.",
      });

      const repaired = await this.llm.complete(repairPrompt);

      try {
        return this.parser.parse(repaired);
      } catch (repairError) {
        if (repairError instanceof TaskParserError) {
          throw new UserFacingError(
            "LLM failed to return valid JSON after a repair attempt."
          );
        }
        throw repairError;
      }
    }
  }
}
