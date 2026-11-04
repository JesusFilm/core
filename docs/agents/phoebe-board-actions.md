# Phoebe board updates from PR events

The `Phoebe board status` workflow can replace the VM's board writer for
Next Steps project 8. It applies to PRs carrying exactly one of
`phoebe-siyang-vm` or `phoebe-siyang-local`. Both runners use the same workflow. Only issues are added to the project or have their fields updated. PRs supply evidence through links; PR project cards are never created or updated.
The workflow is disabled for automatic writes until the repository variable
`PHOEBE_BOARD_WRITER` is `github-actions`.

| PR evidence                               | Board Status      |
| ----------------------------------------- | ----------------- |
| Draft                                     | In progress       |
| Ready, waiting for review                 | In review         |
| Actionable review feedback                | Changes requested |
| Feedback handled, awaiting another review | In review         |
| GitHub's approval requirement satisfied   | Approved          |
| Merged into main                          | Done              |
| Merged into a stack's parent branch       | In review         |
| Closed without merging                    | Needs Human       |

The workflow reads current API state for all owned PRs on each event. It does
not trust the event's older status snapshot. This allows serialized runs to
coalesce pending events without losing updates for another issue. CI failures
remain CI evidence; they do not manufacture a request-changes review.

## Issue links and completion

The policy at `.github/phoebe-board-policy.json` records current explicit
PR-to-issue links, completion gates and incorporated source issues. An explicit
mapping overrides native closing references. New PRs should have an unambiguous
closing-reference line such as `Closes #12345`; this also works when the PR is
stacked and GitHub's native closing references are empty. Ordinary issue mentions
do not become required implementation links.

An issue aggregates every required PR. One merge cannot finish a multi-PR issue.
Every required PR must merge into main, and explicit completion gates must be
verified. Missing required PR evidence preserves the issue's position. The
workflow does not close issues, merge PRs, change ownership, or release holds.
Incorporated source issues keep their bookkeeping Done status.

## Manual board positions

The workflow stores its last written status in the project text field
`Phoebe board automation`, creating the field on the first apply. This persists
across runners and Actions jobs. Keep the field even if it is hidden in views.
Malformed state fails the run instead of guessing.

A later manual board move takes precedence over automatic proposals. A manual
override can be released with the workflow's `release_override` input and
`apply: true`. QA, Needs Human and Done positions are preserved during bootstrap.

The three restored issue positions are imported from the VM with a PR activity fingerprint.
Siyang explicitly requested that those positions expire on their own PR's next
activity. An unrelated PR event does not release them. New commits, review
activity or a changed PR state allow their normal automatic updates to resume.

## Authentication and trusted code

The existing `CI_BOT_APP_ID` and `CI_BOT_PRIVATE_KEY` secrets mint an installation
token. The app must have **organization Projects read/write** and repository
Issues/Pull requests read access. The normal `GITHUB_TOKEN` cannot access an
organization project. Repository Projects permission alone is insufficient.
See [GitHub's Projects automation documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions).

Only trusted main-branch code runs in the project-writing job. It never checks
out, installs dependencies from, or executes a PR head. Fork PRs are excluded.
The separate unprivileged test job can execute the PR's tests.

PR lifecycle events use `pull_request_target`; review submissions/edits/dismissals
use `pull_request_review`. During rollout, ensure existing stacked review refs
contain the workflow, including feature bases created before it was introduced.
Verify actual review-event runs for those stacks before retiring their old writer.

## Cutover

1. Merge the workflow PR. Verify the app's organization Projects permission and
   run `workflow_dispatch` with `apply: false`. Check links, gates and manual
   override fingerprints against the latest VM policy before enabling writes.
2. Inspect project built-in workflows. An automatic issue-close-to-Done/archive
   rule must not bypass multi-PR completion or explicit gates for these cards.
   Avoid two independent automation rules writing their Status.
3. Stop the VM's `phoebe-workflow-sync.timer` and wait for its service to finish.
   Set `board_writer` to `github-actions` in the VM policy. That setting makes
   even an accidentally restarted old worker refuse all project reads/writes.
4. Install and enable the operational `phoebe-registry-refresh.timer` on the VM.
   It runs `sync.py --metadata-only --apply`. Verify that registry timestamps
   stay fresh. It refreshes dependency/ownership metadata and cannot write
   project fields. The engine rejects a registry older than 15 minutes.
5. Set the core repository variable `PHOEBE_BOARD_WRITER=github-actions` and run
   the workflow with `apply: true`. Confirm actual ready-for-review, review and
   merge event runs before declaring cutover complete. Leave the VM board timer
   disabled. Do not install either writer on the Mac.

The Mac sends activity to the VM and consumes its registry. Starting local Phoebe
does not start an Actions writer. Project status updates no longer require a
supervising chat or a machine polling the board. The metadata refresher remains
separate from board updates.

The old observed CI/deployment/QA/blocker fields are not maintained by this status
workflow. Clear stale values or remove those columns from views at cutover;
deployment and human QA still require actual verification.

For rollback, disable the Actions writer variable and wait for in-flight Actions
jobs to finish before restoring the VM writer. Stop metadata-only scheduling,
set `board_writer=vm`, and enable exactly one VM board timer. Preserve newer
manual decisions and completion gates.

## Validation

```bash
python3 -m unittest discover -s .github/scripts -p 'phoebe_board_test.py' -v
python3 .github/scripts/phoebe_board.py
```

The second command is read-only. Only `--apply` writes project fields.
