import { JIRA_TASK_JSON_SHAPE } from "./jiraTaskSchema";

export const JIRA_TASK_REPAIR_PROMPT_TEMPLATE = `
You are fixing a Jira task JSON payload that failed to parse.

Return ONLY valid JSON that matches this shape:
${JIRA_TASK_JSON_SHAPE}

Rules:
- No markdown or code fences.
- Include all required fields with non-empty strings.
- Keep content concise and consistent with the original response.

Parse error:
{{error}}

Original response:
{{raw}}
`;
