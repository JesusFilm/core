# GitHub Projects: the Next Steps board

Work-pickup and ticket state for this repo live in **GitHub Issues** plus one org-level
Project: [Next Steps (org project #8)](https://github.com/orgs/JesusFilm/projects/8).
Issues are the tickets; the project's **Status field is the source of truth for ticket
state**. This replaces Linear for the AI workflow trial (Linear ENG-3688).

## Ticket state = the Status field

One Status per ticket, moving left to right:

| Status          | Meaning                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------- |
| **Triage**      | New or unevaluated; also covers "waiting on more info"                                              |
| **Ready**       | Fully specified, up for grabs (by a human or the AI workflow)                                       |
| **In progress** | Being worked, human or AI                                                                           |
| **In review**   | PR up, awaiting review                                                                              |
| **Changes requested** | A reviewer requested changes and has not been requested to review again                         |
| **Approved**    | At least one reviewer has approved the current PR head                                              |
| **QA**          | Review passed, awaiting **human QA team** approval                                                  |
| **Needs Human** | The AI workflow bailed out — a human must decide/unblock before the ticket can proceed (see step 4) |
| **Done**        | PR merged, or manually marked complete                                                             |

**QA always means the human QA team.** The AI pipeline's own automated verification (the
Vera QA harness) is _not_ this column — it runs inside **In progress**, before a PR is
marked ready for review; its verdict rides the PR as evidence. Agents never set Status
to QA.

State transitions:

- **Humans** drag cards on the board or set Status in the issue sidebar.
- **Agents/scripts** use the `gh project` commands (see below). The token needs the
  `project` scope (`gh auth refresh -s project`).
- **Automatic**: new `JesusFilm/core` issues enter the project in Triage. PR events
  update the PR and, when eligible, its linked issue as described below. Closing
  an issue does not automatically set Done or archive it.

## Automatic PR and issue statuses

The `Project status` workflow writes the Next Steps Status field. It adds PRs to
the project when needed and applies to all authors and target branches.

| Event or current condition | Status |
| --- | --- |
| New issue | Triage |
| PR opened, including drafts and ready-for-review PRs | In progress |
| Reviewer requested and no current approval exists | In review |
| Formal Request changes review, with no current approval and that reviewer not requested again | Changes requested |
| At least one current approval of the PR head | Approved, even if other reviewers are pending or request changes |
| New commits, or dismissal of the last approval | In progress |
| Re-review requested after approval dismissal | In review |
| PR merged | Done |
| PR closed without merging | No change to the PR or issue |
| PR reopened | Recalculate from current reviews and requests |

If reviewers are already requested when a PR opens, it immediately enters In
review. Approval dismissal leaves Approved intact when another approval remains.
New commits invalidate approvals of earlier commits even if GitHub has not yet
dismissed those reviews. Comment-only reviews and resolving discussion threads
do not change status. QA is assigned manually; later PR events can move an item
out of QA. Delayed reset events do not override newer reviews or review requests.

An issue receives the same status only when all these conditions hold:

- The PR has exactly one linked issue, using GitHub's Development relationship.
  Ordinary mentions and ancestor issues are ignored.
- The issue belongs to `JesusFilm/core` and is still open.
- This PR is the issue's only open or merged linked PR. Other PRs closed without
  merging are ignored. A second open or merged PR disables issue updates.

Closing an additional PR leaves the issue untouched. Automation resumes on the
remaining PR's next qualifying event. The workflow never creates, closes, or
reopens issues. If GitHub itself closes an issue when its PR merges, the closed
issue is left untouched under the open-issue rule. Archived project items are
also left untouched.

Apply `status:manual` to pause updates for that item only. A frozen issue does not
freeze its PR, and a frozen PR does not freeze its issue. Removing the label does
not immediately change status; the next qualifying PR event resumes automation.
New-issue initialization does not overwrite a status already assigned while its
creation event was queued.

### Workflow setup and verification

The writer uses the existing `CI_BOT_APP_ID` and `CI_BOT_PRIVATE_KEY` secrets. The
App installation must have **organization Projects: write**, **Issues: read**, and
**Pull requests: read** for `JesusFilm/core`. The ordinary `GITHUB_TOKEN` cannot
write this organization project's fields. Provision the `status:manual` label if
it does not already exist. No other project status workflows should be enabled
for the same transitions.

PR and issue events run trusted code from `main`. Review events, including fork
reviews, first upload their event JSON in the unprivileged `Project status
reviews` workflow. The writer validates the artifact against its source run and
GitHub's PR/review APIs before creating the App token. It never executes code
from the PR. The writer serializes runs and reads current reviews, labels, and
fully paginated links before updating project items. It does not post comments.

Run the behavior tests without installing the monorepo dependencies:

```bash
python3 -m unittest discover -s .github/scripts -p 'project_status_test.py' -v
```

For read-only validation against a saved GitHub event payload:

```bash
python3 .github/scripts/project_status.py --dry-run \
  --event-name pull_request_target --event-path /path/to/event.json
```

These workflows take effect after merging to `main`. They do not backfill existing
items; existing PRs move on their next qualifying event.

Rejecting a ticket ("wontfix"): add the `Won't do` label, then close the issue as
**not planned**. No dedicated column — the close reason is the record.

## Labels

Labels carry everything that is not workflow state:

| Label                      | Purpose                                                                  |
| -------------------------- | ------------------------------------------------------------------------ |
| `ai-auto-workflow`         | Marker: this ticket may be picked up by the AI workflow. Absent = human. |
| `feature:<kebab-name>`     | Feature membership; drives that feature's project view. One or more.     |
| `Won't do`                 | Rejected at triage; closed as not planned.                               |
| `type: feat` / `type: fix` | Pre-existing repo taxonomy, unchanged.                                   |

`ready-for-agent` belongs to a separate system (Phoebe) and is **not** part of this
workflow — do not apply or remove it here.

## Milestones

Milestones are repo-level and encode phases/buckets. One per issue.

- Feature phases: `<feature>: <stage>`, where the prefix matches the feature label's
  value — e.g. `agent-pipeline: setup`, `agent-pipeline: mvp` for `feature:agent-pipeline`.
- Rolling buckets: `bugs`, `improvements` — permanent milestones that are **never
  closed**, unlike feature-phase milestones. The milestone is the ticket's whole home:
  there are no `Bug`/`Improvement` labels, and the Bugs/Improvements view filters on
  these milestones directly.
- Give milestones due dates where possible; **close them when the phase ships** so the
  list stays short.

## Sub-issues

Use sub-issues to break a big ticket (an epic, a feature slice) into children. In the UI:
**Create sub-issue** on the parent. Via CLI there are no native `gh` commands yet — use
the REST endpoints with the child's **database id** (`.id`, not the `#number`):

```bash
CHILD_ID=$(gh api repos/JesusFilm/core/issues/<child-number> --jq .id)
gh api -X POST repos/JesusFilm/core/issues/<parent-number>/sub_issues -F sub_issue_id="$CHILD_ID"
gh api repos/JesusFilm/core/issues/<parent-number>/sub_issues        # list children
gh api repos/JesusFilm/core/issues/<parent-number> --jq .sub_issues_summary  # progress
```

How they behave on the board:

- Each sub-issue is **its own card** with its own independent Status — no visual nesting
  on boards. Table views can **group by "Parent issue"** for epic-style sections, and the
  **"Sub-issues progress"** field shows an X-of-Y bar on the parent (driven by children
  being _closed_, not by their Status).
- **Nothing is inherited.** A child does not get its parent's labels, milestone, or
  Status — apply `feature:*`, `ai-auto-workflow`, the `bugs`/`improvements` milestone,
  etc. to each child explicitly.
- Auto-add puts every sub-issue on the board individually. If a view should show only
  top-level tickets, filter it with `no:parent-issue`.

## Views

Views are saved filters over the project. They can be **created** via the Projects v2
REST API, but not listed, edited, or deleted that way — configuration changes (layout
switches, group-by, swimlanes, sort) are UI-only. Current set:

| View              | Layout                                      | Filter                           |
| ----------------- | ------------------------------------------- | -------------------------------- |
| View 1 (board)    | Board, Status columns                       | —                                |
| Bugs/Improvements | Board, Status columns × Milestone swimlanes | `milestone:bugs,improvements`    |
| agent-pipeline    | Table                                       | `label:"feature:agent-pipeline"` |

**Adding a feature ("custom milestone") view** — two commands:

```bash
gh label create "feature:<name>" --color 0e7c86
gh api -X POST orgs/JesusFilm/projectsV2/8/views \
  -f name="<name>" -f layout="table" -f filter='label:"feature:<name>"'
```

Fine-tune (group-by, swimlanes) in the UI afterwards if needed. Anything with that label
appears in the view automatically — the auto-add workflow puts every new `JesusFilm/core`
issue in the project.

Filter syntax reminders: comma = OR within a qualifier (`milestone:bugs,improvements`);
space = AND between qualifiers; no wildcards (you cannot express "has no feature label").

## The AI workflow

A ticket rides the AI lane when it carries `ai-auto-workflow` **and** its Status is
Ready. The agent then:

1. **Find work**
   ```bash
   gh project item-list 8 --owner JesusFilm --format json --limit 1000 \
     | jq '[.items[] | select(.status == "Ready" and ((.labels // []) | index("ai-auto-workflow")))]'
   ```
   `gh project item-list` has no server-side filtering — the `jq` filter runs client-side
   over a `--limit` window. Keep the limit comfortably above the project's item count
   (archived items don't count), or page via GraphQL `items(first:100, after:...)` if the
   project ever outgrows it.
2. **Claim it** — set Status to In progress (IDs below):
   ```bash
   gh project item-edit --id <ITEM_ID> --project-id PVT_kwDOBNwqhs4BeMYJ \
     --field-id PVTSSF_lADOBNwqhs4BeMYJzhYobGA --single-select-option-id b9c41da0
   ```
3. **Work it**, open a PR, set Status to In review (`ab210038`).
4. **Bail out** if stuck: set Status to **Needs Human** and leave a handoff comment on
   the issue explaining what's blocking.
   ```bash
   gh project item-edit --id <ITEM_ID> --project-id PVT_kwDOBNwqhs4BeMYJ \
     --field-id PVTSSF_lADOBNwqhs4BeMYJzhYobGA --single-select-option-id f3e5a000
   ```
   Keep the `ai-auto-workflow` label — the ticket stays visibly in the AI lane (and
   scannable by the watchdog). It is not re-picked while parked: step 1 matches on Status
   `Ready`, so Needs Human is ineligible until a human moves it. A human then either
   resolves the blocker and sets Status back to Ready (the workflow retries), or removes
   the label, sets Status to In progress, and takes ownership as ordinary human work.

### Stable IDs

| Thing                | ID                               |
| -------------------- | -------------------------------- |
| Project (Next Steps) | `PVT_kwDOBNwqhs4BeMYJ`           |
| Status field         | `PVTSSF_lADOBNwqhs4BeMYJzhYobGA` |
| Status: Triage       | `e5a2c514`                       |
| Status: Ready        | `3c63150a`                       |
| Status: In progress  | `b9c41da0`                       |
| Status: In review    | `ab210038`                       |
| Status: Changes requested | `bd91d0f2`                  |
| Status: Approved     | `8ea90e2e`                       |
| Status: QA           | `12a20fe3`                       |
| Status: Needs Human  | `f3e5a000`                       |
| Status: Done         | `5243b071`                       |

(If the Status options are ever edited in the project settings, these option IDs change —
re-read them with `gh project field-list 8 --owner JesusFilm --format json`.)
