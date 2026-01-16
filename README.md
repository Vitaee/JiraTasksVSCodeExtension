# Jira Tasks Generator (VS Code Extension)

Generate Jira task drafts from git changes and store them in a workspace markdown file. The extension uses a clean architecture split (ports and adapters) and supports OpenRouter, Groq, and Ollama.

## Overview
- Reads staged or unstaged diffs and prunes context using `.gitignore` and `.llmignore`.
- Builds a prompt and sends it to the selected LLM provider.
- Parses the response into a Jira-style markdown section and upserts it by summary.
- Stores output in `jiraTasks.storageFile` (default `jira-tasks.md`).

## Quick Start
```bash
bun install
bun run compile
```

Open this repo in VS Code and press `F5` to launch the Extension Development Host.

## Setup
- Requirements: VS Code 1.101+, Bun for build/test, and a git workspace with changes.
- Choose a provider in settings: `jiraTasks.provider`.
- For OpenRouter or Groq, set the API key with `Jira: Set OpenRouter API Key` or `Jira: Set Groq API Key`.
- For Ollama, make sure the local server is running and the model is pulled.
- Run `Jira: Generate Task From Git Changes`. The task is saved to `jiraTasks.storageFile`.

## Testing
- Unit tests: `bun test`
- E2E tests: `bun run test:e2e` (downloads VS Code into `.vscode-test` on first run)

## Commands
- `Jira: Generate Task From Git Changes` - generate and save a task based on git diffs.
- `Jira: Set OpenRouter API Key` - store OpenRouter key in VS Code SecretStorage.
- `Jira: Set Groq API Key` - store Groq key in VS Code SecretStorage.
- `Jira: Test LLM Connection` - validate provider credentials and connectivity.

## Configuration
Settings live under the `jiraTasks` namespace.

| Setting | Default | Purpose |
| --- | --- | --- |
| `provider` | `openrouter` | Selects the LLM provider (`openrouter`, `groq`, or `ollama`). |
| `openrouterBaseUrl` | `https://openrouter.ai/api/v1` | Base URL for OpenRouter requests. |
| `openrouterModel` | `nvidia/nemotron-3-nano-30b-a3b:free` | Model identifier for OpenRouter. |
| `openrouterSiteUrl` | `` | Optional HTTP-Referer header for OpenRouter rankings. |
| `openrouterTitle` | `` | Optional X-Title header for OpenRouter rankings. |
| `groqModel` | `moonshotai/kimi-k2-instruct-0905` | Model identifier for Groq. |
| `ollamaBaseUrl` | `http://localhost:11434` | Base URL for Ollama (OpenAI-compatible endpoint uses `/v1`). |
| `ollamaModel` | `llama3.1` | Model identifier for Ollama. |
| `promptLanguage` | `en` | Language for generated Jira tasks. |
| `customInstructions` | `` | Extra instructions appended to the prompt. |
| `diffMode` | `staged+unstaged` | Diff scope: `staged`, `unstaged`, or `staged+unstaged`. |
| `temperature` | `0.6` | Sampling temperature for LLM calls. |
| `maxCompletionTokens` | `4096` | Max completion tokens for LLM calls. |
| `topP` | `1` | Top-p nucleus sampling value. |
| `maxFiles` | `40` | Max number of diff files included in the prompt. |
| `maxCharsPerFile` | `6000` | Max characters per diff file included in the prompt. |
| `storageFile` | `jira-tasks.md` | Workspace-relative output file. |

## Features

### Context Pruning with Truncation Awareness

When git changes exceed the configured limits, the extension now provides visibility into what data was truncated:

- **Truncation Warnings**: If any file diff exceeds `maxCharsPerFile`, a warning is logged to the Debug Console showing which files were truncated and by how much.
- **Dropped Files**: If the number of changed files exceeds `maxFiles`, a warning indicates how many files were dropped from the context.

This helps you understand when the LLM might be seeing incomplete information.

### Robust JSON Parsing

The extension now handles common LLM output quirks:

- **Code Fence Variations**: Accepts JSON wrapped in ` ```json `, ` ``` ` (no language), or raw braces.
- **Trailing Commas**: Automatically strips trailing commas before parsing, a common issue with LLM-generated JSON.
- **Repair Attempts**: If initial parsing fails, the extension sends a repair prompt to the LLM for a second attempt.

### Custom Prompt Templates

Power users can customize the prompt template by creating a Handlebars file:

1. Create `jira-prompt.hbs` in your workspace root, **or**
2. Create `.vscode/jira-prompt.hbs` for project-specific customization

The extension checks these locations in order and falls back to the default template.

#### Template Variables

Your custom template has access to these variables:

| Variable | Type | Description |
| --- | --- | --- |
| `{{language}}` | string | The configured `promptLanguage` setting |
| `{{branch}}` | string | Current git branch name |
| `{{files}}` | array | List of changed files with `path` and `diff` properties |
| `{{customInstructions}}` | string | The `customInstructions` setting value |

#### Example Custom Template

```handlebars
You are a senior developer creating a Jira task.

Return ONLY valid JSON with this structure:
{
  "summary": "Brief task title",
  "description": "Detailed description",
  "acceptanceCriteria": ["Criterion 1", "Criterion 2"]
}

Language: {{language}}
Branch: {{branch}}

{{#each files}}
### {{path}}
{{diff}}
{{/each}}

{{#if customInstructions}}
Additional context: {{customInstructions}}
{{/if}}
```

## Architecture
```
src/
  app/         Extension controller and wiring
  adapters/    Git, LLM, storage, and VS Code integrations
  config/      Typed settings access
  domain/      Core services, ports, prompts, and validation
  shared/      Cross-cutting helpers and errors
```

## Notes
- API keys are stored in VS Code SecretStorage, not in settings.
- The extension requires an open workspace folder to run.
- Output is upserted by `## <summary>` heading in the storage file.
- Bun is used for build/test only; runtime is the VS Code Node host.
- Truncation and dropped file warnings appear in the VS Code Debug Console.
