Run one iteration of the adaptive build loop, or perform a lifecycle action on a project's build loop.

> **Note**: The active copy of this command lives at `~/.claude/commands/build-loop.md` (user-global, visible to Claude Code from any project). This file at `/Code/.claude/commands/build-loop.md` is the version-controlled source. Keep them in sync when editing.

## Parameters

- `project` — path to the project root, relative to `/Users/jacobusbrink/Code` or absolute (required)
- `action` — one of: `iterate` (default), `init`, `start`, `resume`, `status`
- `phase` — phase name, required for `start`
- `goal` — phase goal text, optional for `start` (if omitted, agent writes it after investigating)
- `interval` — cron schedule interval, e.g. `2m`, `5m`, `10m` (default: `2m`, used for `start` and `resume`)

---

## CRITICAL: Scope restriction

All file reads, writes, edits, and shell commands MUST be confined to the resolved project root. Never touch files outside it.

---

## Resolve project root

1. If `project` is an absolute path, use it directly.
2. If `project` is relative, resolve it against `/Users/jacobusbrink/Code`.
3. Verify the directory exists. If not, stop and report an error.
4. Set `PROJECT_ROOT` to the resolved path. All subsequent paths are relative to it unless stated otherwise.

---

## Action: `init`

Scaffolds build-loop state files in a project that already has `AGENTS.md`.

**Pre-check**: If `docs/plan/PROGRESS.md` already exists, stop and report "Build loop already initialised. Use `start` to begin a phase."

**Steps**:

1. Verify `AGENTS.md` exists at `PROJECT_ROOT`. If not, stop and report "No AGENTS.md found. Run the agent-first-bootstrap skill first."
2. Detect the verify command by checking in order:
   - If `package.json` exists → `npm run lint && npm run test`
   - If `Makefile` exists → `make lint test`
   - If `Cargo.toml` exists → `cargo clippy && cargo test`
   - If `pyproject.toml` or `setup.py` exists → `python -m pytest`
   - Otherwise → `echo "no verify command configured"` (leave a clear TODO note in the file)
3. Create `docs/plan/` directory if it doesn't exist.
4. Write `docs/plan/PROGRESS.md` using the canonical template below, substituting the detected verify command.
5. Write `docs/plan/PROGRESS-archive.md` using the archive template below.
6. Run `git add docs/plan/ && git commit -m "chore: scaffold build loop files"` from `PROJECT_ROOT`.
7. Report: "Build loop initialised. Edit `docs/plan/PROGRESS.md` to set your first phase goal, then run `/build-loop project=<project> action=start phase=<phase>`."

### Canonical PROGRESS.md template

```markdown
# Build Loop — Progress State

> Single source of truth for the agentic build loop. Every iteration MUST read this first and update it before finishing.

## Config

- **verify**: <detected-verify-command>
- **checkpoint-interval**: 10
- **max-tasks-per-phase**: 200

## Current State

- **task-number**: 1
- **phase**: none
- **phase-complete**: false
- **status**: idle
- **last-result**: none
- **next-task**: none
- **tasks-since-checkpoint**: 0

## next-task values

- `none` — no task queued; agent must investigate and log a new one
- `"<description>"` — agent must execute this task, verify, then clear or replace

## Phase goal

No phase started. Run `/build-loop project=<project> action=start phase=<phase>` to begin.

## Log

| # | Time | Task | Result | Notes |
|---|------|------|--------|-------|
```

### Canonical PROGRESS-archive.md template

```markdown
# Build Loop — Phase Archive

> Completed phases are appended here in order. Each phase is a separate `## <phase>` section separated by `---`.
```

---

## Action: `start`

Starts a new phase and schedules the cron loop.

**Pre-check**: Read `docs/plan/PROGRESS.md`. If `status` is `running` and `phase-complete` is `false`, stop and report "A phase is already running. Pause or complete it first, or set `phase-complete: true` manually to force a transition."

**Steps**:

1. If the previous phase is complete (`phase-complete: true` and `phase` is not `none`):
   - Append the completed phase to `docs/plan/PROGRESS-archive.md` as a new `## <phase>` section containing the **Phase goal** text and the full **Log** table. Separate sections with `---`.
2. Update `docs/plan/PROGRESS.md`:
   - **Current State**: set `phase` to the new phase name, `phase-complete: false`, `status: running`, `task-number: 1`, `last-result: none`, `next-task: none`, `tasks-since-checkpoint: 0`.
   - Replace the **Phase goal** section content with the provided `goal` text. If no `goal` was passed, write: "Phase `<phase>` — goal to be determined on first investigation." (Branch B will refine it on first iteration.)
   - Clear the **Log** table (keep the header row only).
3. Commit: `git add docs/plan/ && git commit -m "chore: start <phase> phase"` from `PROJECT_ROOT`.
4. Run one Branch B iteration immediately (investigate, queue first task, update PROGRESS.md, commit).
5. Resolve cron schedule: convert `interval` to a cron expression:
   - `2m` → `*/2 * * * *`
   - `5m` → `*/5 * * * *`
   - `10m` → `*/10 * * * *`
   - Other: use as-is if already a valid cron expression, otherwise default to `*/2 * * * *`.
6. Call `CronCreate` with expression `/build-loop project=<project> action=iterate`.
7. Report: phase name, cron job ID, interval, and how to stop (`CronDelete <id>`) or pause (edit `status: paused` in PROGRESS.md).

---

## Action: `iterate`

The core loop body. Called by cron. Runs exactly one unit of work.

### Step 1 — Read state

Read `AGENTS.md` and `docs/plan/PROGRESS.md` from `PROJECT_ROOT`. Extract all Current State fields and Config fields.

### Step 2 — Guard rails (check in this order, stop on first match)

1. **status is `paused`**: Report "Loop paused. Edit `status: running` in PROGRESS.md and run `/build-loop project=<project> action=resume` to continue." Stop.
2. **status is `checkpoint`**: Report "Loop at checkpoint. Review the summary in PROGRESS.md, then run `/build-loop project=<project> action=resume`." Stop.
3. **task-number >= max-tasks-per-phase**: Call `CronList`, find the active job for this project (matching the project path in the command), call `CronDelete` on it. Update `docs/plan/PROGRESS.md`: set `status: paused`, append a log row noting "run limit reached". Commit: `chore: progress #N — run limit reached`. Report and stop.
4. **phase-complete is `true`**: Call `CronList`, find and `CronDelete` the active job. Report "Phase `<phase>` complete. Schedule cancelled. Run `/build-loop project=<project> action=start phase=<next-phase>` to continue." Stop.
5. **tasks-since-checkpoint >= checkpoint-interval**: Trigger checkpoint (see Checkpoint procedure below). Stop.

### Step 3 — Branch on next-task

#### Branch A — next-task is set (not "none")

1. Read any spec files referenced in `AGENTS.md` that are relevant to this task. If `AGENTS.md` contains a spec table, read the relevant spec file(s) before starting.
2. Execute the task: write/edit source files, tests, or config. Keep the change small and focused — one concern only.
3. **Verify**: run the `verify` command from Config. Capture stdout/stderr. Determine pass or fail.
4. **If pass**:
   - Commit the code change with a conventional commit message (`feat:`, `fix:`, `chore:`, `test:`, `refactor:`).
   - Update `docs/plan/PROGRESS.md`:
     - Increment `task-number` by 1.
     - Set `next-task: none`.
     - Set `last-result: pass`.
     - Increment `tasks-since-checkpoint` by 1.
     - Append a log row: `| <N> | <ISO-timestamp> | <task description> | pass | <brief note> |`
     - Get timestamp via: `date -u +"%Y-%m-%dT%H:%M:%SZ"`
   - Commit the progress update: `chore: progress #N — pass`.
5. **If fail**:
   - Do NOT commit the broken code. If any files were modified, leave them uncommitted.
   - Identify the specific error or test failure from the captured output.
   - Update `docs/plan/PROGRESS.md`:
     - Increment `task-number` by 1.
     - Replace `next-task` with a precise one-sentence description of what must be fixed.
     - Set `last-result: fail`.
     - Increment `tasks-since-checkpoint` by 1.
     - Append a log row: `| <N> | <ISO-timestamp> | <task description> | fail | <failure summary> |`
   - Commit only the progress update: `chore: progress #N — fail, queued fix`.

#### Branch B — next-task is "none"

1. Investigate the current state of the project:
   - Read `AGENTS.md` fully — note layer rules, directory map, spec file locations.
   - List the source directory (typically `src/` or the project root) to see what exists.
   - Read the **Phase goal** section in `docs/plan/PROGRESS.md` to understand the objective.
   - If `docs/product/PRD.md` exists, read the section relevant to the current phase.
   - Read the last 5 log entries to understand recent progress.
   - Run the verify command if available to check current test status.
2. Determine whether the current phase is complete by checking all criteria in the Phase goal section. A phase is complete when every stated criterion is met, all tests pass, and there are no remaining items.
3. **If phase complete**:
   - Update `docs/plan/PROGRESS.md`:
     - Increment `task-number` by 1.
     - Set `phase-complete: true`.
     - Set `last-result: investigated`.
     - Increment `tasks-since-checkpoint` by 1.
     - Append a log row noting phase completion with timestamp.
   - Commit: `chore: progress #N — <phase> phase complete`.
   - The next iteration (Step 2, guard rail 4) will detect `phase-complete: true` and cancel the schedule.
4. **If phase not complete**:
   - Determine the single most valuable next task toward the phase goal. Prefer: unimplemented spec items → failing tests → missing tests for existing code → documentation or config gaps. Keep the task description to one clear sentence.
   - Update `docs/plan/PROGRESS.md`:
     - Increment `task-number` by 1.
     - Set `next-task` to the task description (quoted string).
     - Set `last-result: investigated`.
     - Increment `tasks-since-checkpoint` by 1.
     - Append a log row: `| <N> | <ISO-timestamp> | Investigate — queue <task summary> | investigated | <brief rationale> |`
   - Commit: `chore: progress #N — queued next task`.
   - **Do not execute the task yet** — Branch A next iteration will do it.

### Checkpoint procedure

When `tasks-since-checkpoint >= checkpoint-interval`:

1. Get current timestamp via `date -u +"%Y-%m-%dT%H:%M:%SZ"`.
2. Write a checkpoint summary block to `docs/plan/PROGRESS.md` immediately after the Log table:

```markdown
## Checkpoint — <timestamp>

Tasks completed since last checkpoint: <tasks-since-checkpoint>
Last task: <last task description from log>
Last result: <last-result>
Tests: run verify command and capture summary line
Status: paused for review

To resume: run `/build-loop project=<project> action=resume`
To override next task: edit `next-task` in PROGRESS.md, then resume.
To skip to next phase: set `phase-complete: true` in PROGRESS.md, then resume.
```

3. Update `docs/plan/PROGRESS.md` Current State: set `status: checkpoint`, set `tasks-since-checkpoint: 0`.
4. Commit: `chore: checkpoint after task #<task-number>`.
5. Call `CronList`, find and `CronDelete` the active job.
6. Report the checkpoint summary and instructions.

---

## Action: `resume`

Resumes from a `checkpoint` or `paused` status.

**Steps**:

1. Read `docs/plan/PROGRESS.md`. Verify `status` is `checkpoint` or `paused`. If `status` is `running`, report "Loop is already running." and stop.
2. Update `docs/plan/PROGRESS.md`:
   - Set `status: running`.
   - Set `tasks-since-checkpoint: 0`.
   - Remove the most recent `## Checkpoint —` block if present.
3. Commit: `git add docs/plan/ && git commit -m "chore: resume build loop"` from `PROJECT_ROOT`.
4. Run one `iterate` action immediately.
5. Resolve cron expression from `interval` (same logic as `start`).
6. Call `CronCreate` with expression `/build-loop project=<project> action=iterate`.
7. Report: resumed, new cron job ID, how to pause again.

---

## Action: `status`

Read-only snapshot of the current loop state. No file changes.

**Steps**:

1. Read `docs/plan/PROGRESS.md` from `PROJECT_ROOT`.
2. Read `AGENTS.md` (first 20 lines for project name/purpose).
3. Call `CronList` and filter for any jobs referencing this project path.
4. Report a formatted summary:

```
## Build Loop Status: <project>

Phase:         <phase>
Status:        <status>
Task number:   <task-number>
Phase complete: <phase-complete>
Last result:   <last-result>
Next task:     <next-task>
Tasks since checkpoint: <tasks-since-checkpoint> / <checkpoint-interval>

Active cron: <cron-id> (<schedule>) — or "none"

Last 5 log entries:
<last 5 rows from Log table>
```

---

## Layer rules enforcement

During all code changes (Branch A), enforce the layer rules found in `AGENTS.md`. If `AGENTS.md` contains a "Layer rules" section, read it before every Branch A execution and verify the planned change does not violate any rule. If a violation would be required, queue a refactoring task instead and do not proceed with the original task.

---

## Conventions

- All commits use conventional commit format: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- Never commit broken code (failing verify). Only commit progress updates on failure.
- Keep each task small — one concern per iteration.
- If a task description in `next-task` is unclear, investigate (Branch B) to clarify and re-queue before executing.
