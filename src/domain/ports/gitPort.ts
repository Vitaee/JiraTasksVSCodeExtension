export type DiffFile = {
  path: string;
  diff: string;
  isBinary?: boolean;
};

export type DiffSnapshot = {
  branch: string;
  files: DiffFile[];
};

export type DiffMode = "staged" | "unstaged" | "staged+unstaged";

export type DiffOptions = {
  mode: DiffMode;
};

export interface GitPort {
  getDiff(options?: DiffOptions): Promise<DiffSnapshot>;
}
