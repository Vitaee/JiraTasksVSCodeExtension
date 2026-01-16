## Refactor LLM client initialization and add health check/error handling
Removed redundant imports and duplicate secret/llm creation code in wiring.ts, introduced ExtensionSettings typing, added buildLlmClient function to centralize LLM client creation, refactored buildTaskGenerator to use the new function, added LlmHealthCheckService for connection testing, added shared llmErrors module for standardized error messaging across providers, improving testability and reducing code duplication.
**Acceptance Criteria**
- buildLlmClient compiles and correctly creates an LLMPort using ExtensionSettings and secret store
- buildTaskGenerator uses buildLlmClient and no longer creates LLM client or secrets inline
- LlmHealthCheckService is present and its testConnection method returns a valid LlmHealthCheckResult
- mapLlmError correctly maps errors for all supported provider types (openrouter, groq, ollama) and generic errors
- No duplicate secret or LLM initialization code remains in the codebase
- Unit tests for LlmHealthCheckService and mapLlmError are added or updated
**Labels**: refactor, llm, health-check, error-handling
**Priority**: High
**Story Points**: 5
**Risk**: Low

## Add Ollama provider and connection-health commands
Introduces Ollama as a new LLM provider alongside OpenRouter and Groq. Adds a "Test Connection" command that pings the configured provider and shows round-trip time or a clear error message. Refactors LLM client creation into a reusable helper and centralises provider-specific error handling.
**Acceptance Criteria**
- User can select "ollama" in settings and configure base URL + model.
- Running "Jira: Test Connection" shows "OK (<n> ms)" on success.
- Missing or wrong API keys display actionable messages (e.g., "Set API key with Jira: Set Groq API Key").
- Connection failures for Ollama show "Cannot reach Ollama at <url>. Is it running?"
- No regression for existing OpenRouter/Groq providers.
**Labels**: enhancement, ollama, health-check, error-handling
**Priority**: Medium
**Story Points**: 5
**Risk**: Low – additive changes, no breaking modifications to existing providers.
