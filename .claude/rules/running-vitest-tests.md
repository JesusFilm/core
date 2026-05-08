# Running Vitest Tests

**Applies when:** Running Vitest tests for any app or library in this monorepo. This rule covers Vitest unit/component tests only — E2E tests use a different workflow.

Apps and APIs that use Vitest (have a `vitest.config.mts` at the workspace root):

| Workspace             | Config                              |
| --------------------- | ----------------------------------- |
| `apps/arclight`       | `apps/arclight/vitest.config.mts`   |
| `apps/journeys`       | `apps/journeys/vitest.config.mts`   |
| `apis/api-analytics`  | `apis/api-analytics/vitest.config.mts` |
| `apis/api-media`      | `apis/api-media/vitest.config.mts`  |

For workspaces with a `jest.config.ts` (e.g. `apps/journeys-admin`, `apps/cms`, `apps/watch`), see `running-jest-tests.md`.

## Use `npx vitest run` directly — never `npx nx test`

The `nx test` executor adds wrapper overhead and obscures Vitest's native filtering. Invoke Vitest directly for single-file iteration.

### Single file

```bash
npx vitest run --config <workspace-path>/vitest.config.mts '<path-to-spec-file>'
```

Example:

```bash
npx vitest run --config apps/journeys/vitest.config.mts 'apps/journeys/src/components/Conductor/Conductor.spec.tsx'
```

### Multiple files or a folder

```bash
npx vitest run --config <workspace-path>/vitest.config.mts '<path-to-folder>'
```

### Flags

- **Pass `--coverage=false` to suppress coverage** — Vitest configs in this monorepo set `coverage.enabled: true`, which slows runs. Vitest does not have a `--no-coverage` flag; use `--coverage=false`.
- Pass `--reporter=verbose` only when debugging a specific failure.
- Use `npx vitest run` (not bare `npx vitest`) to avoid watch mode.

### Finding the right vitest config

Each workspace has its own `vitest.config.mts` at the workspace root. Match the spec file's workspace:

| Spec file path starts with | Vitest config                          |
| -------------------------- | -------------------------------------- |
| `apps/<app-name>/`         | `apps/<app-name>/vitest.config.mts`    |
| `apis/<api-name>/`         | `apis/<api-name>/vitest.config.mts`    |
| `libs/<lib-name>/`         | `libs/<lib-name>/vitest.config.mts` (if present) |

## Common mistakes to avoid

- **Do NOT use** `npx nx test <project> --testPathPattern=...` — Vitest's filtering happens via positional args, not the Jest-style pattern flag.
- **Do NOT omit the config** — `npx vitest run <file>` without `--config` may pick up the wrong workspace's config or fall back to a root config that doesn't exist.
- **Do NOT run vitest from the parent repo when the spec lives in a git worktree** — Vitest resolves paths from the shell CWD. Prefix every command with `cd <worktree-root> &&`. To verify which specs Vitest sees, run `npx vitest run --config <path> --reporter=verbose 2>&1 | grep <name>` and confirm the printed path is inside `.claude/worktrees/...`.
- **Do NOT use `vi` without enabling globals** — these configs set `globals: true`, so `describe`/`it`/`expect`/`vi` are ambient. If a spec imports `vi` from `vitest`, that's fine but redundant; if you copy a Jest spec and forget to swap `jest` → `vi`, the spec will fail to run.
