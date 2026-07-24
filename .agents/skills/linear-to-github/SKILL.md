---
name: linear-to-github
description: Convert Linear tickets — explicit IDs or whole groups (a project, label, or milestone) — into GitHub issues in JesusFilm/core on the Next Steps org project board.
disable-model-invocation: true
---

# Linear → GitHub

Convert Linear tickets into GitHub issues, one issue per ticket, as part of the phased Linear → GitHub migration (ENG-3688). The GitHub side runs entirely through the `gh` CLI (see `docs/agents/issue-tracker.md` for conventions); the Linear side through the Linear MCP tools.

<config>

- **Repo**: `JesusFilm/core`
- **Board**: the [Next Steps org project (#8)](https://github.com/orgs/JesusFilm/projects/8) — the only Project converted issues land on. Its Status field, label vocabulary, milestones, and stable IDs are the contract in `docs/agents/github-projects.md`; this skill follows that doc rather than restating it.
- **Provenance marker**: `<!-- linear:ENG-XXXX -->` as the last line of the issue body — the idempotency key.

</config>

## Process

### 1. Resolve the ticket set

Arguments are any mix of:

- **Ticket IDs or URLs** (`ENG-1234`) — taken as-is.
- **Group selectors** — a Linear project, label, milestone, cycle, or team-plus-state; anything the Linear MCP `list_issues` can filter on. Expand each selector with the matching filter, paging until exhausted; for a project milestone, list the project's issues and keep those in that milestone.

Group expansion keeps open tickets (backlog, unstarted, started) — completed and canceled tickets join the set only when the user asks for them. Dedupe across selectors.

**Confirmation gate.** Before converting, show the resolved set — count plus `ID — title` lines — and get the user's go-ahead. The gate is what makes a group conversion deliberate rather than accidental (ENG-3688's phased-trial stance); a fat-fingered selector costs a glance at the list, not a pile of stray issues. Interrupted runs re-run safely regardless — the provenance marker (step 3) makes conversion idempotent.

Done when every argument is expanded, the set is deduped, and the user has confirmed it.

### 2. Fetch each ticket from Linear

Fetch the full ticket: title, description, comments, labels, project milestone, parent and sub-issue relations, attachments (Linear MCP: `get_issue` with relations, plus `list_comments`).

Tickets in a `completed` or `canceled` state are reported and skipped — convert them only when the user explicitly asked for that ticket by ID, and say in the report that it was converted from a closed state.

Done when every ticket has all seven fields in hand (empty is fine; unfetched is not).

### 3. Check for an existing conversion

For each ticket, search for its provenance marker:

```sh
gh issue list --repo JesusFilm/core --search '"linear:ENG-XXXX" in:body' --state all --json number,url,title
```

A hit puts that ticket in **update** mode (reuse the found issue number); a miss puts it in **create** mode. Re-running the skill therefore syncs drift instead of duplicating.

### 4. Compose the issue body

Build the body per the template below:

- **Description**: the Linear description as GitHub markdown. Rewrite Linear issue mentions as plain markdown links — to the mention's GitHub issue if that ticket is already converted (search its marker as in step 3), otherwise to its Linear URL.
- **Relations**: parent and sub-issues as links, resolved the same way (GitHub issue if converted, Linear URL otherwise). Omit the section when there are none.
- **Attachments**: the original Linear URLs. `uploads.linear.app` links need a Linear session to view — keep them and note it, rather than re-hosting. Omit when none.
- **History from Linear**: each comment as author, date, and text. Comments live in the body, not as `gh issue comment` posts — `gh` would attribute them all to the converting account.
- **Footer**: provenance line and marker. The footer records the original Linear labels and milestone as text so nothing is lost while label mapping is undecided (see below).

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

### 5. Create or update, then confirm board placement

Write the body to a temp file, then per mode:

```sh
gh issue create --repo JesusFilm/core --title "..." --body-file body.md   # create
gh issue edit <number> --repo JesusFilm/core --title "..." --body-file body.md   # update
```

**Labels and milestone**: apply only what the invoker named, drawn from the board vocabulary in `docs/agents/github-projects.md` (`feature:<kebab-name>`, `Bug` / `Improvement`, `ai-auto-workflow`; milestones `<feature>: <stage>` or the rolling buckets). Nothing named means none applied — automatic inference from the Linear labels is the open decision below, and the originals ride in the footer either way.

**Board placement**: new `core` issues auto-enter the Next Steps project at Status **Triage** (built-in workflow). Confirm — and backfill any update-mode issue that predates the workflow — with the idempotent:

```sh
gh project item-add 8 --owner JesusFilm --url <issue-url>
```

The token needs the `project` scope (`gh auth refresh -s project`). Converted issues stay at Triage; when the invoker asks for a different Status (e.g. Ready), set it with the `gh project item-edit` command and stable option IDs in `docs/agents/github-projects.md`.

**Relation fix-up (multi-ticket runs).** Tickets converted early in a run link to Linear for relatives that are converted later in the same run. After the whole set exists, recompose and `gh issue edit` every member whose Relations or rewritten mentions still point at Linear for a ticket the run converted — the step-3 marker search now resolves them.

Done when every ticket has an issue URL and a confirmed board placement, and no member links to Linear for a ticket converted in this run.

### 6. Comment back on Linear

Post one comment on each Linear ticket: `Converted to GitHub: <issue-url>`. Skip when any existing comment already contains that URL. Leave the ticket's state untouched — it stays open in Linear for the parallel-trial phase.

### 7. Report

A table: Linear ID → GitHub issue URL, mode (created / updated / skipped + reason), board Status, labels applied. Every input ticket appears in it.

## Automatic label & milestone mapping — deferred

The GitHub-side vocabulary is settled (`docs/agents/github-projects.md`); what stays open is the inference from Linear metadata — which Linear labels imply `Bug` vs `Improvement`, which map to a `feature:<kebab-name>`, and how Linear project milestones become `<feature>: <stage>` milestones. Until that mapping is decided, the skill applies only invoker-named labels (step 5) and the originals ride in the footer, so a later mapping pass can backfill from there. When the decision lands, record the mapping table here and apply it in step 5.
