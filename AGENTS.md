## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub issues in `JesusFilm/core`, managed via the `gh` CLI. External pull requests are **not** a triage surface — `/triage` processes issues only. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles use their default label strings verbatim: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT-MAP.md` at the repo root points to per-workspace `CONTEXT.md` files (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.

## Conventions

This is an **Nx monorepo** (TypeScript). Apps live in `apps/`, GraphQL APIs in `apis/`, shared libraries in `libs/`, Cloudflare Workers in `workers/`, infrastructure in `infrastructure/`.

### Code Style

- Use early returns to reduce nesting.
- Use descriptive variable and function/const names.
- Define TypeScript types; avoid `any`.

### Documented Solutions

`docs/solutions/` — documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`). Check when implementing or debugging in documented areas.

### Branch Naming

When creating a branch without a Linear issue, it must match this pattern:

```regex
/^(\(HEAD detached at pull\/[0-9]+\/merge\)|(00-00-RB-.*)|stage|main|([0-9]{2}-[0-9]{2}-[A-Z]{2}-(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)-[a-z0-9-]+[a-z0-9])|(feature\/[0-9]{2}-[0-9]{2}-[A-Z]{2}-[a-z0-9-]+[a-z0-9])|[a-z0-9]{2,4}-[0-9]+-[a-z0-9-]+|[a-z]+\/[a-z0-9]{2,4}-[0-9]+-[a-z0-9-]+|(cursor\/.*))$/g
```

Preferred format: `username/ticket-id-short-description` — all lowercase, no uppercase in suffix.

## Path-scoped conventions

Rules live in the AGENTS.md nearest the files you're editing — e.g. `apis/AGENTS.md`, `apps/AGENTS.md`, `apps/<app>/AGENTS.md`, `workers/AGENTS.md`, `infrastructure/AGENTS.md`, `infrastructure/kube/AGENTS.md`.

## Testing

- Vitest (unit/component) — how to run, config-per-workspace, common mistakes: `docs/agents/testing.md`.
- End-to-end (Playwright) authoring standards: `docs/agents/e2e-testing.md`.
