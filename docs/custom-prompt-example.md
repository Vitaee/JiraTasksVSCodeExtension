# Custom Prompt Template Example

This is an example of a custom Jira prompt template. Copy this file to your workspace as:
- `.vscode/jira-prompt.hbs` (project-specific), or
- `jira-prompt.hbs` (workspace root)

Then customize it to match your team's Jira workflow.

---

## Template (copy below this line)

```handlebars
You are generating a Jira task draft from git changes.

Return ONLY JSON that matches this shape:
{
  "summary": "string - Brief task title under 80 characters",
  "description": "string - Detailed description of what was done and why",
  "acceptanceCriteria": ["string - Specific testable criterion"]
}

## Context
- Language: {{language}}
- Branch: {{branch}}

## Changed Files
{{#each files}}
---
### File: {{path}}
```diff
{{diff}}
```
{{/each}}

{{#if customInstructions}}
## Additional Instructions
{{customInstructions}}
{{/if}}
```

---

## Available Variables

| Variable | Type | Description |
| --- | --- | --- |
| `{{language}}` | string | Configured language (e.g., "en", "de") |
| `{{branch}}` | string | Current git branch name |
| `{{files}}` | array | Array of changed files |
| `{{files.[n].path}}` | string | File path |
| `{{files.[n].diff}}` | string | Diff content (may be truncated) |
| `{{customInstructions}}` | string | User's custom instructions setting |

## Tips

1. **Keep prompts focused**: The LLM works best with clear, specific instructions.
2. **Match your team's format**: Customize the JSON shape to include fields your team uses (story points, labels, etc.).
3. **Use conditionals**: `{{#if}}` blocks let you include sections only when data exists.
4. **Test changes**: After modifying, run `Jira: Generate Task` to verify output.
