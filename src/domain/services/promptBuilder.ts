import { DiffFile } from "../ports/gitPort";
import { TemplateRenderer } from "./templateRenderer";

export type PromptVariables = {
  branch: string;
  files: DiffFile[];
  language: string;
  customInstructions?: string;
};

export class PromptBuilder {
  private readonly renderer: TemplateRenderer<PromptVariables>;

  constructor(template: string) {
    this.renderer = new TemplateRenderer(template);
  }

  build(variables: PromptVariables): string {
    return this.renderer.render({
      ...variables,
      customInstructions: variables.customInstructions ?? "",
    });
  }
}
