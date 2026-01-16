import * as vscode from "vscode";
import { ExtensionController } from "./app/extensionController";

export function activate(context: vscode.ExtensionContext): void {
  const controller = new ExtensionController(context);

  const generateCommand = vscode.commands.registerCommand(
    "jiraTasks.generate",
    () => controller.generateJiraTask()
  );

  const setOpenRouterKeyCommand = vscode.commands.registerCommand(
    "jiraTasks.setOpenRouterKey",
    () => controller.setOpenRouterKey()
  );

  const setGroqKeyCommand = vscode.commands.registerCommand(
    "jiraTasks.setGroqKey",
    () => controller.setGroqKey()
  );

  const testConnectionCommand = vscode.commands.registerCommand(
    "jiraTasks.testConnection",
    () => controller.testConnection()
  );

  context.subscriptions.push(
    generateCommand,
    setOpenRouterKeyCommand,
    setGroqKeyCommand,
    testConnectionCommand
  );
}

export function deactivate(): void {}
