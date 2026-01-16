# Jira Tasks Generator (VS Code Extension)

Generate Jira task drafts from git changes and store them in a workspace markdown file. The extension uses a clean architecture split (ports and adapters) and supports OpenRouter and Groq.

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
- Set the API key with `Jira: Set OpenRouter API Key` or `Jira: Set Groq API Key`.
- Run `Jira: Generate Task From Git Changes`. The task is saved to `jiraTasks.storageFile`.

## Testing
- Unit tests: `bun test`
- E2E tests: `bun run test:e2e` (downloads VS Code into `.vscode-test` on first run)

## Commands
- `Jira: Generate Task From Git Changes` - generate and save a task based on git diffs.
- `Jira: Set OpenRouter API Key` - store OpenRouter key in VS Code SecretStorage.
- `Jira: Set Groq API Key` - store Groq key in VS Code SecretStorage.

## Configuration
Settings live under the `jiraTasks` namespace.

| Setting | Default | Purpose |
| --- | --- | --- |
| `provider` | `openrouter` | Selects the LLM provider (`openrouter` or `groq`). |
| `openrouterBaseUrl` | `https://openrouter.ai/api/v1` | Base URL for OpenRouter requests. |
| `openrouterModel` | `nvidia/nemotron-3-nano-30b-a3b:free` | Model identifier for OpenRouter. |
| `openrouterSiteUrl` | `` | Optional HTTP-Referer header for OpenRouter rankings. |
| `openrouterTitle` | `` | Optional X-Title header for OpenRouter rankings. |
| `groqModel` | `moonshotai/kimi-k2-instruct-0905` | Model identifier for Groq. |
| `promptLanguage` | `en` | Language for generated Jira tasks. |
| `customInstructions` | `` | Extra instructions appended to the prompt. |
| `diffMode` | `staged+unstaged` | Diff scope: `staged`, `unstaged`, or `staged+unstaged`. |
| `temperature` | `0.6` | Sampling temperature for LLM calls. |
| `maxCompletionTokens` | `4096` | Max completion tokens for LLM calls. |
| `topP` | `1` | Top-p nucleus sampling value. |
| `maxFiles` | `40` | Max number of diff files included in the prompt. |
| `maxCharsPerFile` | `6000` | Max characters per diff file included in the prompt. |
| `storageFile` | `jira-tasks.md` | Workspace-relative output file. |

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
