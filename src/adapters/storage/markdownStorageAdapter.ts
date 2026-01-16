import { JiraTask } from "../../domain/models/jiraTask";
import { FileSystemPort } from "../../domain/ports/fileSystemPort";
import { StoragePort } from "../../domain/ports/storagePort";

export class MarkdownStorageAdapter implements StoragePort {
  constructor(
    private readonly fileSystem: FileSystemPort,
    private readonly filePath: string
  ) {}

  async upsertTask(task: JiraTask): Promise<void> {
    await this.fileSystem.ensureFile(this.filePath);
    const current = await this.fileSystem.readText(this.filePath).catch(() => "");

    const section = renderTaskSection(task);
    const normalizedSection = section.trimEnd() + "\n";
    if (!current.trim()) {
      await this.fileSystem.writeText(
        this.filePath,
        normalizedSection.trimEnd() + "\n"
      );
      return;
    }

    const escaped = escapeRegExp(task.summary);
    const headingRegex = new RegExp(`^##\\s+${escaped}\\s*$`, "m");
    const match = headingRegex.exec(current);

    if (match && match.index !== undefined) {
      const start = match.index;
      const afterHeadingIndex = start + match[0].length;
      const remainder = current.slice(afterHeadingIndex);
      const nextHeadingOffset = remainder.search(/^##\\s+/m);
      const end =
        nextHeadingOffset === -1
          ? current.length
          : afterHeadingIndex + nextHeadingOffset;

      const updated =
        current.slice(0, start) + normalizedSection + current.slice(end);
      await this.fileSystem.writeText(this.filePath, updated.trimEnd() + "\n");
      return;
    }

    const separator = current.endsWith("\n") ? "" : "\n";
    const updated = `${current}${separator}\n${normalizedSection}`;
    await this.fileSystem.writeText(this.filePath, updated.trimEnd() + "\n");
  }
}

function renderTaskSection(task: JiraTask): string {
  const criteria = task.acceptanceCriteria.length
    ? task.acceptanceCriteria.map((item) => `- ${item}`).join("\n")
    : "- TBD";

  const labels = task.labels?.length ? task.labels.join(", ") : "";
  const priority = task.priority ?? "";
  const storyPoints =
    typeof task.storyPoints === "number" ? String(task.storyPoints) : "";
  const risk = task.risk ?? "";

  return [
    `## ${task.summary}`,
    "",
    task.description,
    "",
    "**Acceptance Criteria**",
    criteria,
    "",
    labels ? `**Labels**: ${labels}` : "",
    priority ? `**Priority**: ${priority}` : "",
    storyPoints ? `**Story Points**: ${storyPoints}` : "",
    risk ? `**Risk**: ${risk}` : "",
    "",
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
