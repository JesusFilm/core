---
name: linear-to-github
description: Convert an explicit list of Linear tickets into GitHub issues in JesusFilm/core and add them to the NextSteps GitHub Project.
disable-model-invocation: true
---

# Linear → GitHub

Convert Linear tickets into GitHub issues, one issue per ticket, as part of the phased Linear → GitHub migration (ENG-3688). The GitHub side runs entirely through the `gh` CLI (see `docs/agents/issue-tracker.md` for conventions); the Linear side through the Linear MCP tools.

<config>

- **Repo**: `JesusFilm/core`
- **Project**: the GitHub Project titled `NextSteps`, owner `JesusFilm` — the only Project converted issues are added to. Stood up by ENG-3702; until it exists, step 5 reports "project not found" and conversion still succeeds.
- **Provenance marker**: `<!-- linear:ENG-XXXX -->` as the last line of the issue body — the idempotency key.

</config>

## Process

### 1. Resolve the ticket list

Arguments are one or more Linear ticket IDs (`ENG-1234`) or URLs. Resolve each to an ID.

**Hard guardrail — explicit lists only.** A request shaped like "all tickets in project/label/milestone X" is bulk migration, which ENG-3688 ruled out for the phased switch. Stop and ask the user to name the tickets individually.

Done when every argument resolves to a ticket ID.

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

### 5. Create or update, then add to the Project

Write the body to a temp file, then per mode:

```sh
gh issue create --repo JesusFilm/core --title "..." --body-file body.md   # create
gh issue edit <number> --repo JesusFilm/core --title "..." --body-file body.md   # update
```

Apply no labels and no milestone — mapping is an open decision (see below).

Add the issue to the Project (create mode and update mode alike; re-adding an existing item is a no-op):

```sh
number=$(gh project list --owner JesusFilm --format json --jq '.projects[] | select(.title == "NextSteps") .number')
gh project item-add "$number" --owner JesusFilm --url <issue-url>
```

No `NextSteps` project yet means ENG-3702 hasn't landed: note it in the report and continue.

Done when every ticket has an issue URL and a project outcome (added / already present / project not found).

### 6. Comment back on Linear

Post one comment on each Linear ticket: `Converted to GitHub: <issue-url>`. Skip when any existing comment already contains that URL. Leave the ticket's state untouched — it stays open in Linear for the parallel-trial phase.

### 7. Report

A table: Linear ID → GitHub issue URL, mode (created / updated / skipped + reason), project outcome. Every input ticket appears in it.

## Label & milestone mapping — deferred

Deliberately undecided until the NextSteps Project (ENG-3702) is live and the views show what they need. Until then converted issues carry no labels or milestone; the originals ride in the footer, so a later mapping pass can backfill from there. When the decision lands, record the mapping table here and apply it in step 5.
