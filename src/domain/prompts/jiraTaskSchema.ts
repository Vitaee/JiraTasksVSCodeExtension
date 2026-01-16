export const JIRA_TASK_JSON_SHAPE = `{
  "summary": "string",
  "description": "string",
  "acceptanceCriteria": ["string"],
  "priority": "Low" | "Medium" | "High" | "Critical",
  "labels": ["string"],
  "storyPoints": number,
  "risk": "string"
}`;
