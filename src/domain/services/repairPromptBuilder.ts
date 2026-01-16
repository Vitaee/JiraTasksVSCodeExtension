import { TemplateRenderer } from "./templateRenderer";

export type RepairPromptVariables = {
  raw: string;
  error: string;
};

export class RepairPromptBuilder {
  private readonly renderer: TemplateRenderer<RepairPromptVariables>;

  constructor(template: string) {
    this.renderer = new TemplateRenderer(template);
  }

  build(variables: RepairPromptVariables): string {
    return this.renderer.render(variables);
  }
}
