import { JIRA_TASK_JSON_SHAPE } from "./jiraTaskSchema";

export const DEFAULT_JIRA_TASK_PROMPT_TEMPLATE = `
You are generating a Jira task draft from git changes.

Return ONLY JSON that matches this shape:
${JIRA_TASK_JSON_SHAPE}

Language: {{language}}
Branch: {{branch}}

Changes:
{{#each files}}
---
File: {{path}}
Diff:
{{diff}}
{{/each}}

{{#if customInstructions}}
Custom instructions:
{{customInstructions}}
{{/if}}
`;

// Re-export for backwards compatibility
export const JIRA_TASK_PROMPT_TEMPLATE = DEFAULT_JIRA_TASK_PROMPT_TEMPLATE;
