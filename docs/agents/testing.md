# Testing (Vitest)

Covers Vitest unit/component tests for any app or library in this monorepo. E2E tests use a different workflow — see `docs/agents/e2e-testing.md`.

Every Vitest workspace has a `vitest.config.mts` at its own root — there is no
root-level config, and no workspace/projects file. To find the config for a spec,
walk up from the spec to the nearest `vitest.config.mts`:

| Area       | Workspaces                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `apps/`    | `arclight`, `journeys`, `journeys-admin`, `player`, `resources`, `short-links`, `videos-admin` |
| `apis/`    | `api-analytics`, `api-journeys`, `api-languages`, `api-media`, `api-users`                     |
| `libs/`    | `journeys/ui`, `shared/ai`, `shared/dev-hosts`, `shared/ui`, `shared/ui-dynamic`, `yoga`       |
| `workers/` | `jf-proxy` (Cloudflare Workers pool — see [Vitest 4 notes](#vitest-4-notes))                   |
| `tools/`   | `langfuse-export`                                                                              |

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

## Common mistakes to avoid

- **Do NOT use** `npx nx test <project> --testPathPattern=...` — Vitest's filtering happens via positional args, not the Jest-style pattern flag.
- **Do NOT omit the config** — `npx vitest run <file>` without `--config` may pick up the wrong workspace's config or fall back to a root config that doesn't exist.
- **Do NOT omit `--root` when running a whole workspace** — Vitest's `root` defaults to the shell CWD, not the config's directory, so `npx vitest run --config apis/api-media/vitest.config.mts` from the repo root sweeps the entire monorepo. Single-file runs are unaffected. `nx test` sets `--root` to the project root for you; match it with `--root <workspace-path>` (and an absolute `--config` path, which is resolved relative to `--root`).
- **Do NOT run vitest from the parent repo when the spec lives in a git worktree** — Vitest resolves paths from the shell CWD. Prefix every command with `cd <worktree-root> &&`. To verify which specs Vitest sees, run `npx vitest run --config <path> --reporter=verbose 2>&1 | grep <name>` and confirm the printed path is inside `.claude/worktrees/...`.
- **Do NOT use `vi` without enabling globals** — these configs set `globals: true`, so `describe`/`it`/`expect`/`vi` are ambient. If a spec imports `vi` from `vitest`, that's fine but redundant; if you copy a Jest spec and forget to swap `jest` → `vi`, the spec will fail to run.

## Vitest 4 notes

### Constructor mocks must use `function`, not an arrow

Vitest 4 spies support `new`. An arrow function has no `[[Construct]]`, so a mock
whose implementation is an arrow throws `... is not a constructor` at the `new`
call site — often as a _suite_-level failure, since these mocks usually sit in a
`vi.mock` factory that runs at import time.

```ts
// ✗ throws under Vitest 4 when the subject calls `new Queue(...)`
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({ add: vi.fn() }))
}))

// ✓
vi.mock('bullmq', () => ({
  Queue: vi.fn(function () {
    return { add: vi.fn() }
  })
}))
```

This applies to anything the code under test constructs: queue clients, SDK
clients (`Mux`, `Cloudflare`, `S3Client`, `Redis`, `ApolloClient`), AWS
`*Command` objects, and browser globals such as `IntersectionObserver`,
`TextTrackList` and `Blob`.

### Coverage needs an explicit `include`/`exclude`

Vitest 4 removed `coverage.all` and `coverage.extensions`, and its default
`coverage.exclude` is now empty. Left alone, a report covers only the files some
test happened to import — untested source silently disappears from Codecov and
the percentage jumps — while `.d.ts` files, build output and test helpers start
counting as source.

Every coverage-enabled `vitest.config.mts` therefore carries an explicit
`include`/`exclude` pair reproducing the Vitest 3 report shape. Keep the two
lists identical across workspaces when editing them. (One caveat if you port more
of Vitest 3's defaults: its `**/<NUL>*` glob for rollup virtual-module ids matches
_every_ path under Vitest 4's matcher and empties the report — `**/virtual:*` and
`**/__x00__*` cover those ids instead.)

### Workspace/projects files are gone

Vitest 4 removed the `workspace` option and `vitest.workspace.ts`. Each workspace
is configured only by its own `vitest.config.mts`.

### `workers/jf-proxy` (Cloudflare Workers pool)

`@cloudflare/vitest-pool-workers` 0.13 dropped `defineWorkersConfig` for a
`cloudflareTest()` Vite plugin, and removed `fetchMock` from `cloudflare:test`.
Upstream now recommends stubbing `globalThis.fetch`; `workers/jf-proxy/test/fetchMock.ts`
wraps that in the one-shot-interceptor API the spec is written against.
