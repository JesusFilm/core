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

**Applies when:** Running Vitest tests for any app or library in this monorepo. This section covers Vitest unit/component tests only — E2E tests use a different workflow.

Workspaces that use Vitest (have a `vitest.config.mts` at the workspace root):

| Workspace                | Config                                     |
| ------------------------ | ------------------------------------------ |
| `apps/arclight`          | `apps/arclight/vitest.config.mts`          |
| `apps/journeys`          | `apps/journeys/vitest.config.mts`          |
| `apps/journeys-admin`    | `apps/journeys-admin/vitest.config.mts`    |
| `apps/resources`         | `apps/resources/vitest.config.mts`         |
| `apps/watch`             | `apps/watch/vitest.config.mts`             |
| `apis/api-analytics`     | `apis/api-analytics/vitest.config.mts`     |
| `apis/api-media`         | `apis/api-media/vitest.config.mts`         |
| `libs/shared/dev-hosts`  | `libs/shared/dev-hosts/vitest.config.mts`  |
| `libs/shared/ui-dynamic` | `libs/shared/ui-dynamic/vitest.config.mts` |
| `libs/yoga`              | `libs/yoga/vitest.config.mts`              |

### Use `npx vitest run` directly — never `npx nx test`

The `nx test` executor adds wrapper overhead and obscures Vitest's native filtering. Invoke Vitest directly for single-file iteration.

#### Single file

```bash
npx vitest run --config <workspace-path>/vitest.config.mts '<path-to-spec-file>'
```

Example:

```bash
npx vitest run --config apps/journeys/vitest.config.mts 'apps/journeys/src/components/Conductor/Conductor.spec.tsx'
```

#### Multiple files or a folder

```bash
npx vitest run --config <workspace-path>/vitest.config.mts '<path-to-folder>'
```

#### Flags

- **Pass `--coverage=false` to suppress coverage** — Vitest configs in this monorepo set `coverage.enabled: true`, which slows runs. Vitest does not have a `--no-coverage` flag; use `--coverage=false`.
- Pass `--reporter=verbose` only when debugging a specific failure.
- Use `npx vitest run` (not bare `npx vitest`) to avoid watch mode.

#### Finding the right vitest config

Each workspace has its own `vitest.config.mts` at the workspace root. Match the spec file's workspace:

| Spec file path starts with | Vitest config                                    |
| -------------------------- | ------------------------------------------------ |
| `apps/<app-name>/`         | `apps/<app-name>/vitest.config.mts`              |
| `apis/<api-name>/`         | `apis/<api-name>/vitest.config.mts`              |
| `libs/<lib-name>/`         | `libs/<lib-name>/vitest.config.mts` (if present) |

### Common mistakes to avoid

- **Do NOT use** `npx nx test <project> --testPathPattern=...` — Vitest's filtering happens via positional args, not the Jest-style pattern flag.
- **Do NOT omit the config** — `npx vitest run <file>` without `--config` may pick up the wrong workspace's config or fall back to a root config that doesn't exist.
- **Do NOT run vitest from the parent repo when the spec lives in a git worktree** — Vitest resolves paths from the shell CWD. Prefix every command with `cd <worktree-root> &&`. To verify which specs Vitest sees, run `npx vitest run --config <path> --reporter=verbose 2>&1 | grep <name>` and confirm the printed path is inside `.claude/worktrees/...`.
- **Do NOT use `vi` without enabling globals** — these configs set `globals: true`, so `describe`/`it`/`expect`/`vi` are ambient. If a spec imports `vi` from `vitest`, that's fine but redundant; if you copy a Jest spec and forget to swap `jest` → `vi`, the spec will fail to run.

End-to-end (Playwright) authoring standards: `docs/agents/e2e-testing.md`.
