# AI Foundations

AI skills that automate common engineering tasks in core. They run inside Cursor and Claude Code, using tools you already have (`gh` CLI, optionally Doppler for Slack notifications).

## Prerequisites

- **Cursor** with Claude model access
- **`gh` CLI** authenticated: `gh auth login` (needs `repo` scope)
- **Devcontainer** running (for build/lint verification)
- **Doppler** authenticated (only needed for reset-stage Slack notifications): `doppler login`

## Cursor Skills

Available in `.cursor/skills/`. Trigger by typing the phrase in Cursor chat or using the skill picker.

| Skill                | What it does                                                                                                                                                                                                      | When to use it                                                                   | How to trigger                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **review-pr**        | Reviews a PR for correctness, security, design, and maintainability. Auto-loads project conventions from `.claude/rules/` and `AGENTS.md` files based on changed paths. Posts findings as inline GitHub comments. | Before requesting human review, or to get a second opinion on someone else's PR. | `review PR`, `review PR #123`, `review this PR in local mode`   |
| **handle-pr-review** | Fetches unresolved review threads, triages each as fix/challenge/skip, applies holistic fixes, resolves threads, and posts a summary comment.                                                                     | After receiving review feedback on your PR.                                      | `check review feedback`, `address PR comments`, `handle review` |
| **reset-stage**      | Resets the stage branch from main, re-merges all PRs labelled "on stage", auto-resolves conflicts. Reports results to Slack.                                                                                      | Stage has conflicts, has drifted, or needs a clean rebuild.                      | `reset stage`, `rebuild stage`, `dry run stage`                 |

### review-pr modes

- **Remote** (default): analyses the PR and posts comments directly to GitHub.
- **Local** (`mode=local`): same analysis, displayed in chat only — nothing posted.
- **Auto** (`auto=true`): skips the confirmation step. Always posts as `COMMENT`, never auto-approves or requests changes.

### handle-pr-review triage categories

| Category      | When                                                          | What happens                           |
| ------------- | ------------------------------------------------------------- | -------------------------------------- |
| **Fix**       | Comment is correct and pragmatic                              | Code change applied, thread resolved   |
| **Challenge** | Comment is wrong, pedantic, or would make code worse          | Respectful reply posted with reasoning |
| **Skip**      | Marked "nit" or "optional", or already covered by another fix | Noted in summary, no action            |

### reset-stage flags

```bash
./tools/scripts/reset-stage.sh           # Dry run (safe, no changes)
./tools/scripts/reset-stage.sh --apply   # Actual reset (destructive, prompts for confirmation)
./tools/scripts/reset-stage.sh --apply --no-slack  # Reset without Slack notification
```

## Claude Code Commands

The review skills are also available as Claude Code commands for terminal-based workflows.

| Command             | Equivalent Cursor skill |
| ------------------- | ----------------------- |
| `/review-pr`        | review-pr               |
| `/handle-pr-review` | handle-pr-review        |

Usage: open Claude Code in the core repo and type the command. Parameters are the same as the Cursor versions.

## Convention Rules

`.claude/rules/` contains coding convention files that `review-pr` auto-loads based on which files a PR changes. Engineers don't need to configure anything — the rules are applied automatically.

| Rule file                        | Covers                                                           |
| -------------------------------- | ---------------------------------------------------------------- |
| `backend/apis.md`                | GraphQL API layer, Prisma patterns, Federation, auth, logging    |
| `backend/workers.md`             | Background job patterns                                          |
| `backend/customizable-blocks.md` | Custom block sync guardrails                                     |
| `frontend/apps.md`               | React application conventions                                    |
| `frontend/watch-modern.md`       | Watch Modern app-specific rules                                  |
| `infra/kubernetes.md`            | Kubernetes deployment conventions                                |
| `infra/terraform.md`             | Infrastructure-as-code patterns                                  |
| `running-jest-tests.md`          | Jest testing workflow (use `npx jest` directly, never `nx test`) |

## Troubleshooting

**`gh` auth scope error when posting review comments:**
Run `gh auth login` and ensure `repo` scope is granted. The GraphQL operations for resolving threads require write access.

**reset-stage skips Slack notification:**
Doppler must be authenticated (`doppler login`) with access to the `core` project, `dev` config. The script runs without Slack — it just won't notify the channel.

**review-pr on a large PR (30+ files):**
The skill automatically prioritises: deep review for core logic and security-sensitive files, scan for tests and utilities, skim for generated files and config. If a PR exceeds 100+ substantive files, it will recommend splitting.

**"No unresolved threads" from handle-pr-review:**
The skill uses GraphQL to fetch threads with `isResolved === false`. If threads appear unresolved in the UI but the skill finds none, check that comments are actual review threads (not PR-level comments).

## Going deeper

Each skill's full technical specification lives in its SKILL.md file:

- `.cursor/skills/review-pr/SKILL.md`
- `.cursor/skills/handle-pr-review/SKILL.md`
- `.cursor/skills/reset-stage/SKILL.md`
