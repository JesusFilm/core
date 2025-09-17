# Watch Dev Server Logging & Shutdown Guidance (2025-02-17)

## Context

- Product and QA requested clearer expectations for how agents manage the Watch dev server when running manual validation.
- Previous guidance covered discovery commands but did not spell out how to terminate straggling processes or persist logs.

## Decisions

- Extend the Watch AGENT guide with an explicit `pkill -f "nx run watch:serve"` command so agents reliably stop existing servers before launching a new instance.
- Require dev server sessions to be started through `pnpm dlx nx run watch:serve 2>&1 | tee dev-server.log &` to capture logs for later debugging while keeping pnpm the orchestrator.

## Follow-ups

- Consider a helper script that wraps discovery, teardown, and logging in one command to reduce operator error.
- Evaluate archiving the generated `dev-server.log` artifacts in CI for future triage.
