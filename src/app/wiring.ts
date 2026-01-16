import * as vscode from "vscode";
import { SimpleGitAdapter } from "../adapters/git/simpleGitAdapter";
import { createIgnoreMatcher } from "../adapters/ignore/ignoreMatcher";
import { createLlmStrategy } from "../adapters/llm/llmFactory";
import { MarkdownStorageAdapter } from "../adapters/storage/markdownStorageAdapter";
import { VsCodeFileSystem } from "../adapters/vscode/vscodeFileSystem";
import { VsCodeSecretStore } from "../adapters/vscode/vscodeSecretStore";
import { ExtensionSettings, readSettings } from "../config/settings";
import { JIRA_TASK_PROMPT_TEMPLATE } from "../domain/prompts/jiraTaskPrompt";
import { JIRA_TASK_REPAIR_PROMPT_TEMPLATE } from "../domain/prompts/jiraTaskRepairPrompt";
import { ContextPruner } from "../domain/services/contextPruner";
import { JiraTaskParser } from "../domain/services/jiraTaskParser";
import { PromptBuilder } from "../domain/services/promptBuilder";
import { RepairPromptBuilder } from "../domain/services/repairPromptBuilder";
import { SecretSanitizer } from "../domain/services/secretSanitizer";
import { TaskGeneratorService } from "../domain/services/taskGeneratorService";
import { UserFacingError } from "../shared/errors";

export type TaskGeneratorBundle = {
  service: TaskGeneratorService;
  settings: ReturnType<typeof readSettings>;
};

export async function buildLlmClient(
  context: vscode.ExtensionContext,
  settings: ExtensionSettings
) {
  const secrets = new VsCodeSecretStore(context.secrets);
  return await createLlmStrategy(settings, secrets);
}

export async function buildTaskGenerator(
  context: vscode.ExtensionContext
): Promise<TaskGeneratorBundle> {
  const settings = readSettings();
  const llm = await buildLlmClient(context, settings);
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    throw new UserFacingError("Open a workspace folder to generate Jira tasks.");
  }

  const git = new SimpleGitAdapter(workspaceFolder.uri.fsPath);

  const fileSystem = new VsCodeFileSystem(workspaceFolder.uri);
  const storage = new MarkdownStorageAdapter(fileSystem, settings.storageFile);

  const ignoreMatcher = await createIgnoreMatcher(fileSystem, [
    ".gitignore",
    ".llmignore",
  ]);

  const contextPruner = new ContextPruner(ignoreMatcher, {
    maxFiles: settings.maxFiles,
    maxCharsPerFile: settings.maxCharsPerFile,
  });

  const promptBuilder = new PromptBuilder(JIRA_TASK_PROMPT_TEMPLATE);
  const repairPromptBuilder = new RepairPromptBuilder(
    JIRA_TASK_REPAIR_PROMPT_TEMPLATE
  );
  const parser = new JiraTaskParser();
  const secretSanitizer = new SecretSanitizer();

  return {
    service: new TaskGeneratorService(
      git,
      llm,
      parser,
      storage,
      contextPruner,
      promptBuilder,
      secretSanitizer,
      repairPromptBuilder
    ),
    settings,
  };
}
