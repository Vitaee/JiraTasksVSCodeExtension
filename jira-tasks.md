## Add CI workflow and core adapters for Jira task generation extension
This PR introduces continuous integration configuration, implements Git diff adapter, ignore matcher, LLM strategies (Groq and OpenRouter), storage adapter for markdown, VS Code file system and secret store adapters, wiring setup, settings configuration, Jira task model, and extension controller. These changes enable automated testing, configuration management, and integration of LLM-based task generation within the extension.
**Acceptance Criteria**
- CI pipeline runs on push and PR, caches dependencies, executes e2e tests
- SimpleGitAdapter provides diff snapshot functionality
- IgnoreMatcher supports .gitignore and .llmignore patterns
- LLM strategies (Groq and OpenRouter) are configurable via settings and secret store
- MarkdownStorageAdapter can upsert Jira tasks into a markdown file
- VsCodeFileSystem and VsCodeSecretStore integrate with VS Code APIs
- Wiring module wires all components together and validates workspace
- Settings are configurable via VS Code configuration
- JiraTask schema validates task fields
- Extension commands are registered and error handling is implemented
**Labels**: ci, feature, extension, llm, git
**Priority**: High
**Story Points**: 8
**Risk**: Medium
