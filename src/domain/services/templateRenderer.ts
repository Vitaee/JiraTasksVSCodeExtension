import Handlebars from "handlebars";

export class TemplateRenderer<T extends Record<string, unknown>> {
  private readonly compiled: Handlebars.TemplateDelegate;

  constructor(template: string) {
    this.compiled = Handlebars.compile(template, { noEscape: true });
  }

  render(variables: T): string {
    return this.compiled(variables);
  }
}
