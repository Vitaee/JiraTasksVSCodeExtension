import * as vscode from "vscode";
import { SecretStorePort } from "../../domain/ports/secretStorePort";

export class VsCodeSecretStore implements SecretStorePort {
  constructor(private readonly secrets: vscode.SecretStorage) {}

  getSecret(key: string): Promise<string | undefined> {
    return this.secrets.get(key);
  }

  setSecret(key: string, value: string): Promise<void> {
    return this.secrets.store(key, value);
  }
}
