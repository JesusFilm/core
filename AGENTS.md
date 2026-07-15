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

The context map (`CONTEXT.md`, and `CONTEXT-intake.md` when diagnosing) is the primary knowledge source — rely on it by default. `docs/solutions/` is a **secondary, opt-in** archive of past problem write-ups (bugs, best practices, workflow patterns), organized by category with descriptive filenames and YAML frontmatter (`module`, `tags`, `problem_type`).

Do **not** read solution docs by default. Their filenames are self-describing — if, while working, one looks relevant to the task, **surface it and ask the user before opening it** (e.g. "There may be a relevant solution doc: `<title>` — want me to read it?"). Only read the contents once the user confirms.

### Branch Naming

When creating a branch without a Linear issue, it must match this pattern:

```regex
/^(\(HEAD detached at pull\/[0-9]+\/merge\)|(00-00-RB-.*)|stage|main|([0-9]{2}-[0-9]{2}-[A-Z]{2}-(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)-[a-z0-9-]+[a-z0-9])|(feature\/[0-9]{2}-[0-9]{2}-[A-Z]{2}-[a-z0-9-]+[a-z0-9])|[a-z0-9]{2,4}-[0-9]+-[a-z0-9-]+|[a-z]+\/[a-z0-9]{2,4}-[0-9]+-[a-z0-9-]+|(cursor\/.*))$/g
```

Preferred format: `username/ticket-id-short-description` — all lowercase, no uppercase in suffix.

## Path-scoped conventions

Conventions are pulled on demand, not loaded up front — this keeps default context lean. **Before modifying or diagnosing files in a directory, read the nearest `AGENTS.md` first** (the one in that directory, or the closest one above it). Do this at the start of the work, not after.

Nested `AGENTS.md` locations include `apis/AGENTS.md`, `apps/AGENTS.md`, `apps/<app>/AGENTS.md`, `workers/AGENTS.md`, `infrastructure/AGENTS.md`, `infrastructure/kube/AGENTS.md`.

## Testing

- Vitest (unit/component) — how to run, config-per-workspace, common mistakes: `docs/agents/testing.md`.
- End-to-end (Playwright) authoring standards: `docs/agents/e2e-testing.md`.
