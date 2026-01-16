import * as vscode from "vscode";
import { FileSystemPort } from "../../domain/ports/fileSystemPort";

export class VsCodeFileSystem implements FileSystemPort {
  constructor(private readonly workspaceRoot: vscode.Uri) {}

  async readText(path: string): Promise<string> {
    const uri = this.resolvePath(path);
    const data = await vscode.workspace.fs.readFile(uri);
    return new TextDecoder().decode(data);
  }

  async writeText(path: string, content: string): Promise<void> {
    const uri = this.resolvePath(path);
    await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
  }

  async ensureFile(path: string): Promise<void> {
    const uri = this.resolvePath(path);
    try {
      await vscode.workspace.fs.stat(uri);
    } catch {
      await vscode.workspace.fs.writeFile(uri, new Uint8Array());
    }
  }

  async exists(path: string): Promise<boolean> {
    const uri = this.resolvePath(path);
    try {
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
  }

  private resolvePath(path: string): vscode.Uri {
    return vscode.Uri.joinPath(this.workspaceRoot, path);
  }
}
