## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub issues in `JesusFilm/core`, managed via the `gh` CLI. External pull requests are **not** a triage surface — `/triage` processes issues only. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles use their default label strings verbatim: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT-MAP.md` at the repo root points to per-workspace `CONTEXT.md` files (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.

### Bug-diagnosis layer

Selected NextSteps areas add a `CONTEXT-intake.md` beside their `CONTEXT.md` — the diagnosis layer for reported bugs (failure signatures, the question that localizes a report, where to look first, tagged by failure type T1–T11).

- Read `CONTEXT.md` to understand or build in an area.
- Read `CONTEXT-intake.md` **only** when triaging or debugging a _reported bug_ in that area.

Start from the intake index (`CONTEXT-MAP-intake.md`): match the reporter's words to an area's `trigger_phrases`, then open that area's `CONTEXT-intake.md`.

## Conventions

This is an **Nx monorepo** (TypeScript). Apps live in `apps/`, GraphQL APIs in `apis/`, shared libraries in `libs/`, Cloudflare Workers in `workers/`, infrastructure in `infrastructure/`.

### Code Style

- Use early returns to reduce nesting.
- Use descriptive variable and function/const names.
- Define TypeScript types; avoid `any`.

### Lint before push (agents)

**Agents: before every `git push`, run this and push the result as one unit.**

```bash
pnpm lint:changed --fix        # applies formatting, lint fixes and translation extraction
git add -A && git commit -m "chore: lint fixes"   # only if it changed anything
git push
```

There is deliberately **no pre-push hook**. A git hook cannot do this job: git resolves which commits to push _before_ running the hook, so fixes a hook commits are left behind and never reach the remote. Doing it in the agent, before the push is issued, is the only way the fixes actually travel with the branch. Humans are not gated at all — this is an agent instruction, not enforcement.

What the fixes are: everything [autofix.ci](https://autofix.ci) would otherwise commit to your PR. It is generated output, not opinion, so it belongs in your commit rather than in a bot commit afterwards. `lint:changed` mirrors those steps in the same order:

1. **Prettier** on every changed file of any type (`.md`, `.json`, `.yaml`, `.css`, … — not just JS/TS). Under a second.
2. **ESLint** on changed JS/TS only, scoped per workspace; full `nx lint` is far too slow. Roughly 5–20s per touched workspace.
3. **i18next extraction** for changed projects only. Roughly 2–3s per touched project.

All three are load-bearing. ESLint **cannot** catch a formatting problem — the repo uses `eslint-config-prettier`, which exists to switch every formatting rule off, and there is no `eslint-plugin-prettier`. Formatting belongs to Prettier alone. And a new `t()` string that was never extracted is invisible to both.

Without `--fix` the script only reports, and leaves the working tree untouched. Note extraction is **project-wide**, not per-file: `--fix` can pull in a `t()` string someone else left unextracted in the same project. That is intended — it is exactly what autofix.ci would have committed.

Scope: it compares the branch diff against `origin/main`, refreshed when the network allows. Forks, other remotes, and branches cut from `stage` are all judged against `origin/main`, so a `stage`-cut branch may over-lint. `LINT_CHANGED_JOBS` caps parallel workspaces (default 4).

Not covered locally: **`codegen`** is the one autofix.ci step that can still commit to your PR. Run `nx codegen <project>` after changing a GraphQL schema or query.

It is deliberately not gated, because it only works where `apollo` is already installed globally. The devcontainer installs it in [`post-create-command.sh`](.devcontainer/post-create-command.sh) (`npm i -g nx foreman apollo graphql`) and autofix.ci does the same, which is why it works in both. On a plain host checkout `apollo` is absent, so `npx` tries to fetch it and fails with `EOVERRIDE` from the `next` override in `package.json` — gating it would mean requiring that global install everywhere, which we chose not to do. Work in the devcontainer, or expect autofix.ci to commit the regenerated files.

The remaining steps cannot produce a commit at all: `type-check` and `subgraph-check` only report (and `subgraph-check` needs a Hive token), and `prisma-generate` writes nothing that is tracked.

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
