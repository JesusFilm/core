## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub issues in `JesusFilm/core`, managed via the `gh` CLI. External pull requests are **not** a triage surface — `/triage` processes issues only. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles use their default label strings verbatim: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT-MAP.md` at the repo root points to per-workspace `CONTEXT.md` files (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.

### Bug-diagnosis layer (NextSteps)

Selected areas add a `CONTEXT-intake.md` beside their `CONTEXT.md` (e.g. `apps/journeys-admin/CONTEXT-intake.md`).

- Read `CONTEXT.md` to understand or build in an area.
- Read `CONTEXT-intake.md` **only** when triaging or debugging a _reported bug_ — it holds failure signatures, the question that localizes a report, and where to look first, tagged by failure type (T1–T11).

Start from the intake index (`CONTEXT-MAP-intake.md`): match the reporter's words to an area's `trigger_phrases`, then open that area's `CONTEXT-intake.md`. The diagnosis-layer contract is defined in ENG-3685; the intake files themselves land on that ticket's branch.
