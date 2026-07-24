---
name: linear-to-github
description: Convert Linear tickets — explicit IDs or whole groups (a project, label, or milestone) — into GitHub issues in JesusFilm/core on the Next Steps org project board.
disable-model-invocation: true
---

# Linear → GitHub

Convert Linear tickets into GitHub issues, one issue per ticket (phased migration, ENG-3688). The GitHub side runs entirely through the `gh` CLI (conventions: `docs/agents/issue-tracker.md`); the Linear side through the Linear MCP tools.

<config>

- **Repo**: `JesusFilm/core`
- **Board**: the [Next Steps org project (#8)](https://github.com/orgs/JesusFilm/projects/8) — the only Project converted issues land on; its Status field, labels, milestones, and stable IDs are the contract in `docs/agents/github-projects.md` (the board doc).
- **Provenance marker**: `<!-- linear:ENG-XXXX -->` as the last line of the issue body — the idempotency key.

</config>

## Process

### 1. Resolve the ticket set

Arguments are any mix of:

- **Ticket IDs or URLs** (`ENG-1234`) — taken as-is.
- **Group selectors** — a Linear project, label, milestone, cycle, or team-plus-state; anything the Linear MCP `list_issues` can filter on. Expand each selector with the matching filter, paging until exhausted; for a project milestone, list the project's issues and keep those in that milestone.

Group expansion keeps open tickets (backlog, unstarted, started); completed and canceled tickets join the set only when the user asks for them. Dedupe across selectors.

**Confirmation gate.** Before converting, show the resolved set (count + `ID — title` lines) and get the user's go-ahead.

Done when every argument is expanded, the set is deduped, and the user has confirmed it.

### 2. Choose the set's board home

Ask the invoker (in the same exchange as step 1's confirmation) where the set lands — **one home is enough**:

- **A feature** — the `feature:<kebab-name>` label, optionally plus its `<feature>: <stage>` phase milestone. List the existing labels to pick from:

  ```sh
  gh label list --repo JesusFilm/core --json name --jq '[.[].name | select(startswith("feature:"))]'
  ```

  Create a new one before use:

  ```sh
  gh label create "feature:<kebab-name>" --repo JesusFilm/core --color 0e7c86
  ```

- **Or a bug/improvement** — the rolling `bugs` / `improvements` **milestones**. The milestone is the whole home: no label of any kind (there are no `Bug`/`Improvement` labels on this board).

Milestones are one per issue. List them, or create a missing phase (formats in the board doc):

```sh
gh api repos/JesusFilm/core/milestones --jq '.[].title'
gh api repos/JesusFilm/core/milestones -f title="<feature>: <stage>"
```

Plus **anything else** the invoker wants as labels (e.g. `ai-auto-workflow`).

**New feature label → new view.** Views are UI-only — prompt the user to add the feature's view on the board (recipe in the board doc).

The choices apply to every ticket in the set; the invoker can name per-ticket exceptions. Done when each ticket has its home decided and anything newly named exists in the repo.

### 3. Fetch each ticket from Linear

Fetch the full ticket: title, description, comments, labels, project milestone, parent and sub-issue relations, attachments (Linear MCP: `get_issue` with relations, plus `list_comments`).

Tickets in a `completed` or `canceled` state are reported and skipped — convert one only when the user asked for it by ID, noting the closed state in the report.

Done when every ticket has every field listed above in hand (empty is fine; unfetched is not).

### 4. Check for an existing conversion

For each ticket, search for its provenance marker:

```sh
gh issue list --repo JesusFilm/core --search '"linear:ENG-XXXX" in:body' --state all --json number,url,title
```

A hit puts that ticket in **update** mode (reuse the found issue number); a miss puts it in **create** mode.

Done when every ticket is marked create or update, update tickets carrying their issue number.

### 5. Compose the issue body

Build the body per the template below:

- **Description**: the Linear description as GitHub markdown. Rewrite Linear issue mentions as plain links — to the mention's GitHub issue if already converted (marker search as in step 4), otherwise to its Linear URL.
- **Relations**: parent and sub-issues as links, resolved the same way. Omit the section when there are none.
- **Attachments**: the original Linear URLs, kept rather than re-hosted (`uploads.linear.app` needs a Linear session — say so). Omit the section when there are none.
- **History from Linear**: each comment as author, date, and text — in the body, not `gh issue comment` posts (`gh` would misattribute them to the converting account).
- **Footer**: provenance line and marker, recording the original Linear labels and milestone as text (the backfill source for the deferred mapping below).

<body-template>

The Linear description, mentions rewritten.

## Relations

- Parent: [ENG-1111 – title](url)
- Sub-issue: [ENG-2222 – title](url)

## Attachments

- [name](https://uploads.linear.app/...) _(requires Linear access)_

## History from Linear

**Author Name** (2026-07-08):

> Comment text.

---

Converted from Linear [ENG-XXXX](https://linear.app/...) · Linear labels: `a`, `b` · milestone: `M`

<!-- linear:ENG-XXXX -->

</body-template>

Done when every ticket has a composed body ending in its provenance marker.

### 6. Create or update, then confirm board placement

Write each ticket's body to its own temp file (`body-ENG-XXXX.md`), then per mode, with the step-2 home — `--label` and/or `--milestone` as chosen:

```sh
gh issue create --repo JesusFilm/core --title "..." --body-file body-ENG-XXXX.md --label "<step-2 label>"   # create
gh issue edit <number> --repo JesusFilm/core --title "..." --body-file body-ENG-XXXX.md --add-label "<step-2 label>"   # update
```

**Per-ticket failure**: record it in the report and continue with the remaining tickets.

**Board placement**: new `core` issues auto-enter the project at Status **Triage**. Confirm — and backfill any update-mode issue that predates the auto-add workflow — with the idempotent:

```sh
gh project item-add 8 --owner JesusFilm --url <issue-url>
```

The token needs the `project` scope (`gh auth refresh -s project`). Issues stay at Triage; set a different Status only on request, via `gh project item-edit` with the option IDs in the board doc.

**Relation fix-up (multi-ticket runs)**: after the whole set exists, recompose and `gh issue edit` every member whose Relations or mentions still point at Linear for a ticket this run converted — the step-4 search now resolves them.

Done when every ticket has an issue URL, its labels, and a confirmed board placement, and no member links to Linear for a ticket converted in this run.

### 7. Comment back on Linear

Post one comment on each Linear ticket: `Converted to GitHub: <issue-url>`. Skip when any existing comment already contains that URL. Leave the ticket's state untouched.

Done when every converted ticket has a Linear comment linking its GitHub issue, freshly posted or pre-existing.

### 8. Report

A table: Linear ID → GitHub issue URL, mode (created / updated / skipped + reason / failed + error), board Status, labels and milestone applied.

Done when every input ticket has a row.

## Automatic mapping — deferred

Inferring GitHub labels/milestone from Linear metadata is deferred; each run's choices come from the invoker (step 2). The originals ride in the issue footer as the backfill source — record the mapping table here when it's decided.
