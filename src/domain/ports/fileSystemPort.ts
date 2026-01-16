export interface FileSystemPort {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  ensureFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
