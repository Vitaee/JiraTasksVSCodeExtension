import * as vscode from "vscode";
import { buildTaskGenerator } from "./wiring";
import { ConsoleLogger } from "../shared/logger";
import { asErrorMessage, UserFacingError } from "../shared/errors";

export class ExtensionController {
  private readonly logger = new ConsoleLogger();

  constructor(private readonly context: vscode.ExtensionContext) {}

  async generateJiraTask(): Promise<void> {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Generating Jira task",
        cancellable: true,
      },
      async (progress, token) => {
        try {
          progress.report({ message: "Preparing dependencies..." });
          const bundle = await buildTaskGenerator(this.context);

          if (token.isCancellationRequested) {
            return;
          }

          progress.report({ message: "Analyzing git changes..." });
          const task = await bundle.service.generate({
            language: bundle.settings.promptLanguage,
            customInstructions: bundle.settings.customInstructions,
            diffMode: bundle.settings.diffMode,
          });

          if (token.isCancellationRequested) {
            return;
          }

          progress.report({ message: "Saving markdown..." });
          vscode.window.showInformationMessage(
            `Jira task saved to ${bundle.settings.storageFile}: ${task.summary}`
          );
        } catch (error) {
          this.handleError(error);
        }
      }
    );
  }

  async setOpenRouterKey(): Promise<void> {
    const value = await vscode.window.showInputBox({
      prompt: "Enter OpenRouter API key",
      password: true,
      ignoreFocusOut: true,
    });

    if (!value) {
      return;
    }

    await this.context.secrets.store("openrouterApiKey", value.trim());
    vscode.window.showInformationMessage("OpenRouter API key saved.");
  }

  async setGroqKey(): Promise<void> {
    const value = await vscode.window.showInputBox({
      prompt: "Enter Groq API key",
      password: true,
      ignoreFocusOut: true,
    });

    if (!value) {
      return;
    }

    await this.context.secrets.store("groqApiKey", value.trim());
    vscode.window.showInformationMessage("Groq API key saved.");
  }

  private handleError(error: unknown): void {
    if (error instanceof UserFacingError) {
      vscode.window.showErrorMessage(error.message);
      return;
    }

    this.logger.error("Extension error", error);
    vscode.window.showErrorMessage(asErrorMessage(error));
  }
}
