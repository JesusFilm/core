import copy
import json
import subprocess
import unittest
from unittest.mock import patch

from project_status import (
    MANUAL_LABEL,
    PROJECT_ID,
    GitHub,
    PullRequest,
    Review,
    closing_issue_numbers,
    pull_request_status,
    run,
)
from project_status_review import validate_review_event


class MemoryGitHub(GitHub):
    """Project API fixture: exercise the handler through its GitHub boundary."""

    def __init__(self):
        super().__init__()
        self.pr = {
            "id": "pr",
            "updatedAt": "2026-11-10T02:00:00Z",
            "state": "OPEN",
            "headRefOid": "head",
            "body": "",
            "baseRefName": "main",
            "authorAssociation": "MEMBER",
            "headRepository": {"nameWithOwner": "JesusFilm/core"},
            "repository": {"nameWithOwner": "JesusFilm/core"},
        }
        self.issue = {
            "id": "issue",
            "number": 1,
            "state": "OPEN",
            "repository": {"nameWithOwner": "JesusFilm/core"},
        }
        self.issues = [self.issue]
        self.linked_prs = [{"id": "pr", "state": "OPEN"}]
        self.reviews = []
        self.requests = []
        self.dismissals = []
        self.cross_references = []
        self.added = []
        self.labels = {"pr": set(), "issue": set()}
        self.statuses = {}
        self.status_updated_at = {"issue": "2026-11-10T00:00:00Z"}
        self.archived = set()
        self.writes = []
        self.declared_pull_requests = set()
        self.lookup_errors = {}
        self.timeline_snapshots = []
        self.timeline_reads = 0
        self.project_memberships = {"issue": [PROJECT_ID]}
        self.board_scan_items = None

    def node(self, node_id, node_type, selection):
        return self.pr if node_type == "PullRequest" else self.issue

    def connection(self, node_id, node_type, name, selection, arguments=""):
        if name == "timelineItems" and node_type == "PullRequest":
            self.timeline_reads += 1
            if self.timeline_snapshots:
                return self.timeline_snapshots.pop(0)
        if name == "fields":
            return [
                {
                    "id": "status",
                    "name": "Status",
                    "options": [
                        {"id": status, "name": status}
                        for status in [
                            "Triage",
                            "In progress",
                            "In review",
                            "Changes requested",
                            "Approved",
                            "Done",
                            "QA",
                            "Ready",
                        ]
                    ],
                }
            ]
        if name == "labels":
            return [{"name": label} for label in self.labels[node_id]]
        if name == "projectItems":
            return [
                {
                    "id": node_id if project == PROJECT_ID else "other:" + node_id,
                    "project": {"id": project},
                    "isArchived": node_id in self.archived,
                    "fieldValueByName": {
                        "name": self.statuses[node_id],
                        "updatedAt": self.status_updated_at.get(node_id),
                    }
                    if self.statuses.get(node_id)
                    else None,
                }
                for project in self.project_memberships.get(node_id, [])
            ]
        if name == "items":
            if self.board_scan_items is not None:
                return self.board_scan_items
            return (
                [
                    {
                        "isArchived": "issue" in self.archived,
                        "fieldValueByName": {
                            "name": self.statuses["issue"],
                            "updatedAt": self.status_updated_at.get("issue"),
                        }
                        if self.statuses.get("issue")
                        else None,
                        "content": self.issue,
                    }
                ]
                if PROJECT_ID in self.project_memberships.get("issue", [])
                else []
            )
        return {
            "pullRequests": [
                dict(self.pr, closingIssuesReferences={"nodes": self.issues})
            ],
            "latestOpinionatedReviews": self.reviews,
            "reviewRequests": self.requests,
            "timelineItems": self.cross_references
            if node_type == "Issue"
            else self.dismissals,
            "closingIssuesReferences": self.issues,
            "closedByPullRequestsReferences": self.linked_prs,
        }[name]

    def graphql(self, query, **variables):
        if "repository(owner:" in query and "{ id }" in query:
            return {"repository": {"id": "repository"}}
        if "issue(number:" in query or "issueOrPullRequest(number:" in query:
            number = variables["number"]
            field = (
                "issueOrPullRequest"
                if "issueOrPullRequest(number:" in query
                else "issue"
            )
            target = None
            errors = self.lookup_errors.get(number, [])
            if not errors and number == self.issue["number"]:
                target = dict(self.issue, __typename="Issue")
            elif (
                not errors
                and number in self.declared_pull_requests
                and field == "issueOrPullRequest"
            ):
                target = {"__typename": "PullRequest"}
            elif not errors:
                errors = [{"type": "NOT_FOUND", "path": ["repository", field]}]
            response = {"data": {"repository": {field: target}}, "errors": errors}
            # Exercise the real gh response/error adapter rather than returning
            # a misleading null for GitHub's NOT_FOUND error response.
            result = subprocess.CompletedProcess(
                args=["gh", "api", "graphql"],
                returncode=1 if errors else 0,
                stdout=json.dumps(response),
                stderr="GraphQL lookup failed" if errors else "",
            )
            with patch("project_status.subprocess.run", return_value=result):
                return GitHub.graphql(self, query, **variables)
        if "addProjectV2ItemById" in query:
            raise AssertionError("The status workflow must never create project cards")
        if "updateProjectV2ItemFieldValue" in query:
            if variables["item"] != self.issue["id"]:
                raise AssertionError("Only issue cards may be updated")
            self.statuses[variables["item"]] = variables["option"]
            self.writes.append((variables["item"], variables["option"]))
            return {}
        raise AssertionError(f"Unexpected API call: {query}")


def event(action="opened", review_state="APPROVED"):
    return {
        "repository": {"full_name": "JesusFilm/core"},
        "action": action,
        "pull_request": {
            "node_id": "pr",
            "head": {"sha": "head"},
            "merged": False,
            "updated_at": "2026-11-10T00:00:00Z",
        },
        "issue": {"node_id": "issue"},
        "review": {"node_id": "review", "state": review_state},
    }


def api_review(
    author="alice", state="APPROVED", head="head", submitted="2026-11-10T01:00:00Z"
):
    return {
        "author": {"id": author},
        "state": state,
        "submittedAt": submitted,
        "commit": {"oid": head},
    }


class StatusPolicyTests(unittest.TestCase):
    def test_only_explicit_closing_declarations_identify_issues(self):
        body = """Closes #12. Part of #99. Related to #100.
Fixes JesusFilm/core#13
Resolves https://github.com/JesusFilm/core/issues/14
Closes #15, #16 and #17
Closes #23. Fixes #24, resolves #25
Closes other/repo#18
> Closes #19
`Closes #20`
<!-- Closes #21 -->
```text
Closes #22
```
"""
        self.assertEqual(
            closing_issue_numbers(body), {12, 13, 14, 15, 16, 17, 23, 24, 25}
        )

    def test_approval_wins_over_other_reviews_and_pending_requests(self):
        pr = PullRequest(
            "pr",
            "OPEN",
            "head",
            reviews=[
                Review("alice", "APPROVED", "head", "01"),
                Review("bob", "CHANGES_REQUESTED", "head", "02"),
            ],
            requested_reviewers={"charlie"},
        )
        self.assertEqual(pull_request_status(pr, "submitted"), "Approved")
        self.assertEqual(pull_request_status(pr, "review_requested"), "Approved")

    def test_push_and_last_approval_dismissal_reset_despite_pending_reviews(self):
        pr = PullRequest(
            "pr",
            "OPEN",
            "new-head",
            reviews=[
                Review("alice", "APPROVED", "old-head", "01"),
                Review("bob", "CHANGES_REQUESTED", "new-head", "02"),
            ],
            requested_reviewers={"charlie"},
        )
        for action in ["synchronize", "dismissed"]:
            with self.subTest(action=action):
                self.assertEqual(pull_request_status(pr, action), "In progress")

    def test_remaining_approval_survives_another_dismissal(self):
        pr = PullRequest(
            "pr",
            "OPEN",
            "head",
            reviews=[
                Review("alice", "DISMISSED", "head", "01"),
                Review("bob", "APPROVED", "head", "02"),
            ],
        )
        self.assertEqual(pull_request_status(pr, "dismissed"), "Approved")

    def test_change_request_waits_for_its_reviewer_to_be_requested_again(self):
        pr = PullRequest(
            "pr",
            "OPEN",
            "head",
            reviews=[
                Review("alice", "CHANGES_REQUESTED", "head", "01"),
            ],
            requested_reviewers={"bob"},
        )
        self.assertEqual(pull_request_status(pr, "submitted"), "Changes requested")
        pr.requested_reviewers.add("alice")
        self.assertEqual(pull_request_status(pr, "review_requested"), "In review")

    def test_old_change_request_does_not_return_after_approval_dismissal(self):
        pr = PullRequest(
            "pr",
            "OPEN",
            "head",
            reviews=[
                Review("alice", "CHANGES_REQUESTED", "head", "01"),
            ],
            last_approval_dismissed_at="02",
        )
        self.assertEqual(pull_request_status(pr, "reopened"), "In progress")


class HandlerTests(unittest.TestCase):
    def setUp(self):
        self.github = MemoryGitHub()

    def handle(self, action="opened", event_name="pull_request_target", payload=None):
        run(self.github, event_name, payload or event(action))

    def merge(self, base="main"):
        self.github.pr["state"] = "MERGED"
        payload = event("closed")
        payload["pull_request"].update(merged=True, base={"ref": base})
        self.handle(payload=payload)

    def test_schedule_recovers_change_request_without_a_review_workflow_run(self):
        # #10131 had a real current-head review but no collector workflow on its
        # old stack ref. Only the trusted main-branch schedule can reach here.
        self.github.statuses["issue"] = "In review"
        self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
        self.handle(event_name="schedule")
        self.assertEqual(self.github.statuses["issue"], "Changes requested")
        self.assertEqual(self.github.writes, [("issue", "Changes requested")])

    def test_schedule_recovers_approval_and_deduplicates_repeated_checks(self):
        self.github.statuses["issue"] = "In review"
        self.github.reviews = [api_review()]
        self.handle(event_name="schedule")
        self.handle(event_name="schedule")
        self.assertEqual(self.github.writes, [("issue", "Approved")])

    def test_recovery_preserves_a_later_pickup_or_manual_status_move(self):
        for status in ["In progress", "QA", "In review", "Done"]:
            for changed_at in ["2026-11-10T01:00:00Z", "2026-11-10T01:30:00Z"]:
                with self.subTest(status=status, changed_at=changed_at):
                    self.setUp()
                    self.github.statuses["issue"] = status
                    self.github.status_updated_at["issue"] = changed_at
                    self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
                    self.handle(event_name="schedule")
                    self.assertEqual(self.github.writes, [])

    def test_recovery_does_not_guess_when_status_timestamp_is_missing(self):
        self.github.statuses["issue"] = "In review"
        self.github.status_updated_at.clear()
        self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
        self.handle(event_name="schedule")
        self.assertEqual(self.github.writes, [])

    def test_recovery_ignores_non_decisions_and_reviews_of_earlier_heads(self):
        for review in [
            api_review(state="COMMENTED"),
            api_review(state="DISMISSED"),
            api_review(state="CHANGES_REQUESTED", head="old-head"),
            api_review(head="old-head"),
        ]:
            with self.subTest(review=review):
                self.setUp()
                self.github.statuses["issue"] = "In review"
                self.github.reviews = [review]
                self.handle(event_name="schedule")
                self.assertEqual(self.github.writes, [])

    def test_recovery_does_not_restore_a_review_before_approval_dismissal(self):
        self.github.statuses["issue"] = "In review"
        self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
        self.github.dismissals = [
            {
                "createdAt": "2026-11-10T01:30:00Z",
                "previousReviewState": "APPROVED",
                "review": {"id": "old-approval"},
            }
        ]
        self.handle(event_name="schedule")
        self.assertEqual(self.github.writes, [])

    def test_recovery_preserves_an_approval_when_another_is_dismissed_later(self):
        self.github.statuses["issue"] = "In review"
        self.github.reviews = [api_review(author="alice")]
        self.github.dismissals = [
            {
                "createdAt": "2026-11-10T01:30:00Z",
                "previousReviewState": "APPROVED",
                "review": {"id": "bob-approval"},
            }
        ]
        self.handle(event_name="schedule")
        self.assertEqual(self.github.writes, [("issue", "Approved")])

    def test_unrelated_newer_change_request_does_not_refresh_an_old_approval(self):
        self.github.statuses["issue"] = "In progress"
        self.github.status_updated_at["issue"] = "2026-11-10T01:15:00Z"
        self.github.reviews = [
            api_review(author="alice"),
            api_review(author="carol", state="CHANGES_REQUESTED", submitted="2026-11-10T01:45:00Z"),
        ]
        self.handle(event_name="schedule")
        self.assertEqual(self.github.writes, [])

    def test_recovery_uses_the_existing_pending_reviewer_policy(self):
        self.github.statuses["issue"] = "In progress"
        self.github.reviews = [api_review(author="alice", state="CHANGES_REQUESTED")]
        self.github.requests = [{"requestedReviewer": {"id": "alice"}}]
        self.handle(event_name="schedule")
        self.assertEqual(self.github.writes, [("issue", "In review")])

    def test_recovery_respects_manual_opt_out_and_archival(self):
        for manual, archived in [(True, False), (False, True)]:
            with self.subTest(manual=manual, archived=archived):
                self.setUp()
                self.github.statuses["issue"] = "In review"
                self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
                if manual:
                    self.github.labels["issue"].add(MANUAL_LABEL)
                if archived:
                    self.github.archived.add("issue")
                self.handle(event_name="schedule")
                self.assertEqual(self.github.writes, [])

    def test_recovery_preserves_ambiguous_issue_and_implementation_mappings(self):
        for ambiguous_issues in [True, False]:
            with self.subTest(ambiguous_issues=ambiguous_issues):
                self.setUp()
                self.github.statuses["issue"] = "In review"
                self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
                if ambiguous_issues:
                    self.github.issues.append(dict(self.github.issue, id="second-issue"))
                else:
                    self.github.linked_prs.append(dict(self.github.pr, id="another-pr"))
                self.handle(event_name="schedule")
                self.assertEqual(self.github.writes, [])

    def test_recovery_supports_explicit_stack_closing_declarations(self):
        self.github.statuses["issue"] = "In review"
        self.github.pr["body"] = "Closes #1"
        self.github.pr["baseRefName"] = "phoebe/parent"
        self.github.issues = []
        self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
        self.handle(event_name="schedule")
        self.assertEqual(self.github.writes, [("issue", "Changes requested")])

    def test_recovery_ignores_ordinary_mentions_and_untrusted_forks(self):
        for untrusted in [True, False]:
            with self.subTest(untrusted=untrusted):
                self.setUp()
                self.github.statuses["issue"] = "In review"
                self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
                if untrusted:
                    self.github.pr.update(
                        authorAssociation="NONE",
                        headRepository={"nameWithOwner": "outside/core"},
                    )
                else:
                    self.github.issues = []
                    self.github.pr["body"] = "Related to #1"
                self.handle(event_name="schedule")
                self.assertEqual(self.github.writes, [])

    def test_recovery_never_creates_cards_or_updates_closed_or_foreign_issues(self):
        for issue_changes, memberships in [
            ({}, []),
            ({}, ["other-project"]),
            ({"state": "CLOSED"}, [PROJECT_ID]),
            ({"repository": {"nameWithOwner": "outside/repo"}}, [PROJECT_ID]),
        ]:
            with self.subTest(issue_changes=issue_changes, memberships=memberships):
                self.setUp()
                self.github.issue.update(issue_changes)
                self.github.project_memberships["issue"] = memberships
                self.github.statuses["issue"] = "In review"
                self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
                self.handle(event_name="schedule")
                self.assertEqual(self.github.writes, [])
                self.assertEqual(self.github.added, [])

    def test_recovery_rechecks_status_immediately_before_writing(self):
        self.github.statuses["issue"] = "In review"
        self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
        original = self.github.connection

        def concurrent_pickup(*args, **kwargs):
            if args[2] == "latestOpinionatedReviews":
                self.github.statuses["issue"] = "In progress"
                self.github.status_updated_at["issue"] = "2026-11-10T01:30:00Z"
            return original(*args, **kwargs)

        with patch.object(self.github, "connection", side_effect=concurrent_pickup):
            self.handle(event_name="schedule")
        self.assertEqual(self.github.statuses["issue"], "In progress")
        self.assertEqual(self.github.writes, [])

    def test_recovery_rechecks_pr_state_and_head_before_writing(self):
        for changes in [{"state": "CLOSED"}, {"state": "MERGED"}, {"headRefOid": "new"}]:
            with self.subTest(changes=changes):
                self.setUp()
                self.github.statuses["issue"] = "In review"
                self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
                original = self.github.node
                calls = 0

                def concurrent_change(node_id, node_type, selection):
                    nonlocal calls
                    calls += 1
                    result = dict(original(node_id, node_type, selection))
                    if calls > 1:
                        result.update(changes)
                    return result

                with patch.object(self.github, "node", side_effect=concurrent_change):
                    self.handle(event_name="schedule")
                self.assertEqual(self.github.writes, [])

    def test_recovery_dry_run_does_not_mutate_the_issue(self):
        self.github.dry_run = True
        self.github.statuses["issue"] = "In review"
        self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
        self.handle(event_name="schedule")
        self.assertEqual(self.github.statuses["issue"], "In review")
        self.assertEqual(self.github.writes, [])

    def test_new_issue_enters_triage_without_overwriting_later_work(self):
        self.handle(event_name="issues")
        self.assertEqual(self.github.statuses, {"issue": "Triage"})
        self.github.statuses["issue"] = "Ready"
        self.handle(event_name="issues")
        self.assertEqual(self.github.statuses["issue"], "Ready")

    def test_off_board_issues_are_not_enrolled_by_creation_or_pr_activity(self):
        for memberships in [[], ["qa-project"]]:
            with self.subTest(memberships=memberships):
                self.setUp()
                self.github.project_memberships["issue"] = memberships
                self.github.statuses["issue"] = "Ready"
                self.handle(event_name="issues")
                self.handle()
                self.github.reviews = [api_review()]
                self.handle("submitted", "pull_request_review")
                self.merge()
                self.assertEqual(self.github.statuses, {"issue": "Ready"})
                self.assertEqual(self.github.writes, [])
                self.assertEqual(self.github.added, [])

    def test_dual_membership_updates_only_the_next_steps_card(self):
        self.github.project_memberships["issue"] = ["qa-project", PROJECT_ID]
        self.github.reviews = [api_review()]
        self.handle("submitted", "pull_request_review")
        self.assertEqual(self.github.writes, [("issue", "Approved")])
        self.assertEqual(self.github.added, [])

    def test_triage_initializes_an_issue_added_after_its_creation_event(self):
        self.github.project_memberships["issue"] = []
        self.handle(event_name="issues")
        self.assertEqual(self.github.writes, [])
        self.github.project_memberships["issue"] = [PROJECT_ID]
        self.handle(event_name="schedule")
        self.assertEqual(self.github.statuses, {"issue": "Triage"})
        self.assertEqual(self.github.added, [])

    def test_triage_scan_preserves_assigned_statuses_and_explicit_overrides(self):
        for status, manual in [("Ready", False), ("QA", False), (None, True)]:
            with self.subTest(status=status, manual=manual):
                self.setUp()
                if status:
                    self.github.statuses["issue"] = status
                if manual:
                    self.github.labels["issue"].add(MANUAL_LABEL)
                self.handle(event_name="schedule")
                self.assertEqual(self.github.writes, [])

    def test_triage_scan_rechecks_membership_and_status_before_writing(self):
        stale = {
            "content": self.github.issue,
            "fieldValueByName": None,
            "isArchived": False,
        }
        self.github.board_scan_items = [stale]
        self.github.project_memberships["issue"] = []
        self.handle(event_name="schedule")
        self.assertEqual(self.github.writes, [])
        self.github.project_memberships["issue"] = [PROJECT_ID]
        self.github.statuses["issue"] = "In progress"
        self.handle(event_name="schedule")
        self.assertEqual(self.github.statuses, {"issue": "In progress"})
        self.assertEqual(self.github.writes, [])

    def test_triage_backlog_is_bounded_per_run(self):
        self.github.board_scan_items = [
            {
                "content": self.github.issue,
                "isArchived": False,
                "fieldValueByName": None,
            }
        ] * 30
        with patch("project_status.ProjectStatuses.set_issue") as writer:
            self.handle(event_name="schedule")
        self.assertEqual(writer.call_count, 25)

    def test_triage_scan_ignores_closed_archived_and_other_repository_items(self):
        for changed in [
            {"state": "CLOSED"},
            {"repository": {"nameWithOwner": "JesusFilm/forge"}},
        ]:
            with self.subTest(changed=changed):
                self.setUp()
                self.github.issue.update(changed)
                self.handle(event_name="schedule")
                self.assertEqual(self.github.writes, [])
        self.setUp()
        self.github.archived.add("issue")
        self.handle(event_name="schedule")
        self.assertEqual(self.github.writes, [])

    def test_outside_fork_cannot_move_or_complete_an_issue(self):
        self.github.pr.update(
            authorAssociation="NONE", headRepository={"nameWithOwner": "outside/core"}
        )
        self.github.statuses["issue"] = "Ready"
        self.handle()
        self.merge()
        self.assertEqual(self.github.statuses, {"issue": "Ready"})
        self.assertEqual(self.github.writes, [])
        self.assertEqual(self.github.added, [])

    def test_trusted_fork_authors_and_same_repository_bots_are_allowed(self):
        for association, head_repo in [
            ("MEMBER", "outside/core"),
            ("OWNER", "outside/core"),
            ("COLLABORATOR", "outside/core"),
            ("NONE", "JesusFilm/core"),
        ]:
            with self.subTest(association=association, head_repo=head_repo):
                self.setUp()
                self.github.pr.update(
                    authorAssociation=association,
                    headRepository={"nameWithOwner": head_repo},
                )
                self.handle()
                self.assertEqual(self.github.statuses, {"issue": "In progress"})

    def test_review_artifact_cannot_override_live_pr_author_trust(self):
        self.github.pr.update(
            authorAssociation="NONE", headRepository={"nameWithOwner": "outside/core"}
        )
        payload = event("submitted")
        payload["pull_request"]["author_association"] = "MEMBER"
        self.github.reviews = [api_review()]
        self.handle("submitted", "pull_request_review", payload)
        self.assertEqual(self.github.writes, [])

    def test_fork_trust_is_also_applied_to_the_multiple_pr_guard(self):
        for association, should_complete in [("NONE", True), ("COLLABORATOR", False)]:
            for native_link in [True, False]:
                with self.subTest(association=association, native_link=native_link):
                    self.setUp()
                    other = {
                        "id": "fork-pr",
                        "state": "OPEN",
                        "body": "Closes #1",
                        "authorAssociation": association,
                        "headRepository": {"nameWithOwner": "outside/core"},
                        "repository": {"nameWithOwner": "JesusFilm/core"},
                    }
                    if native_link:
                        self.github.linked_prs.append(other)
                    else:
                        self.github.cross_references.append({"source": other})
                    self.merge()
                    self.assertEqual(
                        self.github.statuses == {"issue": "Done"}, should_complete
                    )

    def test_dismissal_retries_until_its_timeline_event_is_visible(self):
        self.github.timeline_snapshots = [
            [],
            [],
            [
                {
                    "createdAt": "2026-11-10T02:00:00Z",
                    "previousReviewState": "APPROVED",
                    "review": {"id": "review"},
                }
            ],
        ]
        self.github.statuses["issue"] = "Approved"
        with patch("project_status.time.sleep") as sleep:
            self.handle("dismissed", "pull_request_review")
        self.assertEqual(self.github.statuses, {"issue": "In progress"})
        self.assertEqual(self.github.timeline_reads, 3)
        self.assertEqual(sleep.call_count, 2)

    def test_ownership_of_another_repository_does_not_confer_core_trust(self):
        other = {
            "id": "foreign-pr",
            "state": "OPEN",
            "body": "Closes JesusFilm/core#1",
            "authorAssociation": "OWNER",
            "repository": {"nameWithOwner": "outside/core"},
            "headRepository": {"nameWithOwner": "outside/core"},
        }
        self.github.linked_prs.append(other)
        self.github.cross_references.append({"source": other})
        self.merge()
        self.assertEqual(self.github.statuses, {"issue": "Done"})

    def test_dismissal_retry_exhaustion_leaves_status_unchanged(self):
        self.github.statuses["issue"] = "Approved"
        with (
            patch("project_status.time.sleep") as sleep,
            self.assertRaisesRegex(RuntimeError, "Dismissed review"),
        ):
            self.handle("dismissed", "pull_request_review")
        self.assertEqual(self.github.statuses, {"issue": "Approved"})
        self.assertEqual(self.github.timeline_reads, 3)
        self.assertEqual(sleep.call_count, 2)

    def test_open_pr_moves_only_ready_issue_into_progress(self):
        self.github.statuses["issue"] = "Ready"
        self.handle()
        self.assertEqual(self.github.statuses, {"issue": "In progress"})
        self.assertEqual(self.github.added, [])

    def test_existing_pr_card_is_never_updated(self):
        self.github.statuses["pr"] = "Ready"
        self.handle()
        self.assertEqual(self.github.statuses, {"pr": "Ready", "issue": "In progress"})
        self.assertEqual(self.github.added, [])

    def test_bot_review_request_moves_issue_to_review(self):
        self.github.requests = [{"requestedReviewer": {"id": "csiyang"}}]
        payload = event("review_requested")
        payload["sender"] = {"login": "siyang-bot"}
        self.handle(payload=payload)
        self.assertEqual(self.github.statuses, {"issue": "In review"})

    def test_open_with_pending_reviewer_enters_review(self):
        self.github.requests = [{"requestedReviewer": {"id": "alice"}}]
        self.handle()
        self.assertEqual(self.github.statuses["issue"], "In review")

    def test_approval_moves_issue_out_of_manual_qa_position(self):
        self.github.statuses = {"issue": "QA"}
        self.github.reviews = [api_review()]
        self.handle("submitted", "pull_request_review")
        self.assertEqual(self.github.statuses, {"issue": "Approved"})

    def test_explicit_manual_label_waits_for_next_event_after_removal(self):
        self.github.statuses = {"issue": "QA"}
        self.github.labels["issue"].add(MANUAL_LABEL)
        self.handle()
        self.assertEqual(self.github.statuses["issue"], "QA")
        self.github.labels["issue"].clear()
        self.handle("unlabeled", event_name="issues")
        self.assertEqual(self.github.statuses["issue"], "QA")
        self.handle("review_requested")
        self.assertEqual(self.github.statuses["issue"], "In progress")

    def test_cancellation_never_changes_issue_or_pr_even_if_pr_was_reopened(self):
        self.github.statuses["issue"] = "Changes requested"
        for state in ["CLOSED", "OPEN"]:
            with self.subTest(state=state):
                self.github.pr["state"] = state
                self.handle("closed")
                self.assertEqual(self.github.writes, [])
                self.assertEqual(self.github.statuses, {"issue": "Changes requested"})

    def test_merge_moves_open_issue_to_done(self):
        self.merge()
        self.assertEqual(self.github.statuses, {"issue": "Done"})

    def test_merge_completes_issue_already_closed_by_github_without_reopening(self):
        self.github.issue["state"] = "CLOSED"
        self.merge()
        self.assertEqual(self.github.statuses, {"issue": "Done"})
        self.assertEqual(self.github.issue["state"], "CLOSED")

    def test_child_merge_into_stack_branch_completes_child_issue(self):
        self.github.pr.update(
            body="Closes #1. Part of #999.", baseRefName="feature/parent"
        )
        self.github.issues = []
        self.github.linked_prs = []
        self.merge(base="feature/parent")
        self.assertEqual(self.github.statuses, {"issue": "Done"})

    def test_code_examples_do_not_link_current_stack_pr(self):
        examples = [
            "Example command:\n\n    Closes #123\n",
            "Example command:\n\n\tCloses #123\n",
            "``Closes #123``",
            "```Closes #123```",
            "Example: ``a `Closes #123` command``",
            "Example: ``\nCloses #123\n``",
            "Inline example: ```Closes #123```",
            "<pre>Closes #123</pre>",
            "<pre><code>This PR fixes #123.</code></pre>",
            "<pre><pre>nested example</pre>Closes #123</pre>",
            '<PRE class="example">\nCloses #123\n</PRE>',
            "<code>Closes #123</code>",
            "```text\nCloses #123\n```",
            "~~~text\nCloses #123\n~~~",
            "````text\n```\nCloses #123\n````",
            "```text\nCloses #123\n",
            "> Closes #123",
            "> Example command:\nCloses #123\n",
            "<blockquote>Closes #123</blockquote>",
            "This fixes `an example` #123.",
            "- > Closes #123",
            "- ```text\n  Closes #123\n  ```\n",
            "1. Example:\n   > Closes #123\n",
            "- Examples:\n  - > Closes #123\n",
        ]
        for body in examples:
            with self.subTest(body=body):
                self.setUp()
                self.github.issue["number"] = 123
                self.github.statuses["issue"] = "In review"
                self.github.issues = []
                self.github.linked_prs = []
                self.github.pr["body"] = body
                self.merge(base="feature/parent")
                self.assertEqual(self.github.statuses, {"issue": "In review"})
                self.assertEqual(self.github.writes, [])
                self.assertEqual(self.github.added, [])

    def test_code_examples_in_other_prs_do_not_block_stack_completion(self):
        for body in [
            "Example command:\n\n    Closes #123\n",
            "``Closes #123``",
            "<pre>Closes #123</pre>",
            "> Example command:\nCloses #123\n",
            "- > Closes #123",
            "- ```text\n  Closes #123\n  ```\n",
        ]:
            with self.subTest(body=body):
                self.setUp()
                self.github.issue["number"] = 123
                self.github.issues = []
                self.github.linked_prs = []
                self.github.pr["body"] = "Closes #123"
                self.github.cross_references = [
                    {
                        "source": {
                            "id": "example-pr",
                            "authorAssociation": "MEMBER",
                            "state": "OPEN",
                            "body": body,
                            "repository": {"nameWithOwner": "JesusFilm/core"},
                        }
                    }
                ]
                self.merge(base="feature/parent")
                self.assertEqual(self.github.statuses, {"issue": "Done"})
                self.assertEqual(self.github.added, [])

    def test_prose_implementation_pr_blocks_stack_completion(self):
        for declaration in [
            "This PR fixes #123.",
            "This change resolves JesusFilm/core#123.",
            "It closes https://github.com/JesusFilm/core/issues/123.",
            "- Parent\n  - Child\n    - This PR fixes #123.",
        ]:
            with self.subTest(declaration=declaration):
                self.setUp()
                self.github.issue["number"] = 123
                self.github.statuses["issue"] = "In progress"
                self.github.issues = []
                self.github.linked_prs = []
                self.github.pr["body"] = "Closes #123"
                self.github.cross_references = [
                    {
                        "source": {
                            "id": "other-implementation",
                            "authorAssociation": "MEMBER",
                            "state": "OPEN",
                            "body": declaration,
                            "repository": {"nameWithOwner": "JesusFilm/core"},
                        }
                    }
                ]
                self.merge(base="feature/parent")
                self.assertEqual(self.github.statuses, {"issue": "In progress"})
                self.assertEqual(self.github.writes, [])
                self.assertEqual(self.github.added, [])

    def test_genuine_closing_declarations_in_nested_list_prose_complete_issue(self):
        for body in [
            "- This PR fixes #123.",
            "- Parent\n  - Child\n    - This PR fixes #123.",
            "1. Parent\n   - This PR fixes #123.",
            "- **Closes** #123.",
        ]:
            with self.subTest(body=body):
                self.setUp()
                self.github.issue["number"] = 123
                self.github.issues = []
                self.github.linked_prs = []
                self.github.pr["body"] = body
                self.merge(base="feature/parent")
                self.assertEqual(self.github.statuses, {"issue": "Done"})

    def test_single_prose_stack_pr_completes_issue_despite_unrelated_references(self):
        self.github.issue["number"] = 123
        self.github.issues = []
        self.github.linked_prs = []
        self.github.pr["body"] = "This PR fixes #123. Related to #999."
        self.github.cross_references = [
            {
                "source": {
                    "id": "reference-pr",
                    "authorAssociation": "MEMBER",
                    "state": "OPEN",
                    "body": "This PR mentions #123. It fixes other/repo#123. "
                    "It resolves https://github.com/other/repo/issues/123.",
                    "repository": {"nameWithOwner": "JesusFilm/core"},
                }
            }
        ]
        self.merge(base="feature/parent")
        self.assertEqual(self.github.statuses, {"issue": "Done"})
        self.assertEqual(self.github.added, [])

    def test_genuine_declaration_after_code_example_completes_stack_issue(self):
        for example in [
            "```Closes #999```",
            "Inline example: ``<pre>Closes #999</pre>``",
            "<pre>This PR fixes #999.</pre>",
            "> This PR fixes #999.\nThis is still quoted.",
        ]:
            with self.subTest(example=example):
                self.setUp()
                self.github.issues = []
                self.github.linked_prs = []
                self.github.pr["body"] = example + "\n\nThis PR fixes #1."
                self.merge(base="feature/parent")
                self.assertEqual(self.github.statuses, {"issue": "Done"})

    def test_archived_closed_issue_can_complete_without_being_restored(self):
        self.github.statuses["issue"] = "In review"
        self.github.archived.add("issue")
        self.github.issue["state"] = "CLOSED"
        self.merge()
        self.assertEqual(self.github.statuses, {"issue": "Done"})
        self.assertIn("issue", self.github.archived)
        self.assertEqual(self.github.added, [])

    def test_multiple_implementation_prs_also_block_completion_of_closed_issue(self):
        self.github.issue["state"] = "CLOSED"
        self.github.pr["state"] = "MERGED"
        payload = event("closed")
        payload["pull_request"]["merged"] = True
        for other_state in ["OPEN", "MERGED"]:
            with self.subTest(other_state=other_state):
                self.github.linked_prs = [
                    dict(self.github.pr, id="other-pr", state=other_state)
                ]
                self.handle(payload=payload)
                self.assertEqual(self.github.writes, [])

    def test_another_stack_declaration_blocks_automatic_movement(self):
        self.github.cross_references = [
            {
                "source": {
                    "id": "another-stack-pr",
                    "authorAssociation": "MEMBER",
                    "state": "OPEN",
                    "body": "Closes #1",
                    "repository": {"nameWithOwner": "JesusFilm/core"},
                }
            }
        ]
        self.handle()
        self.assertEqual(self.github.writes, [])

    def test_ordinary_mentions_from_other_prs_do_not_block_movement(self):
        self.github.cross_references = [
            {
                "source": {
                    "id": "reference-pr",
                    "authorAssociation": "MEMBER",
                    "state": "OPEN",
                    "body": "Related to #1. Part of #1.",
                    "repository": {"nameWithOwner": "JesusFilm/core"},
                }
            }
        ]
        self.handle()
        self.assertEqual(self.github.statuses, {"issue": "In progress"})

    def test_duplicate_native_link_and_closing_declaration_are_one_issue(self):
        self.github.pr["body"] = "Closes #1"
        self.handle()
        self.assertEqual(self.github.statuses, {"issue": "In progress"})

    def test_body_mentions_alone_do_not_create_or_move_an_issue_card(self):
        self.github.issues = []
        self.github.pr["body"] = "Related to #1. Part of #1. Source requirements: #1."
        self.handle()
        self.assertEqual(self.github.statuses, {})
        self.assertEqual(self.github.added, [])

    def test_closed_issue_is_never_updated_or_reopened(self):
        self.github.issue["state"] = "CLOSED"
        self.handle("reopened")
        self.assertEqual(self.github.statuses, {})

    def test_reopened_pr_recalculates_eligible_open_issue(self):
        self.github.reviews = [api_review()]
        self.handle("reopened")
        self.assertEqual(self.github.statuses, {"issue": "Approved"})

    def test_multiple_issues_are_never_updated(self):
        self.github.issues.append(dict(self.github.issue, id="another-issue"))
        self.handle()
        self.assertEqual(self.github.statuses, {})

    def test_other_open_or_merged_pr_blocks_issue_but_closed_pr_does_not(self):
        for state, expected in [("OPEN", False), ("MERGED", False), ("CLOSED", True)]:
            with self.subTest(state=state):
                self.setUp()
                self.github.linked_prs.append(
                    dict(self.github.pr, id="other-pr", state=state)
                )
                self.handle()
                self.assertEqual("issue" in self.github.statuses, expected)
                self.assertNotIn("pr", self.github.statuses)

    def test_superseded_push_and_commented_review_are_ignored(self):
        self.github.pr["headRefOid"] = "newer-head"
        self.handle("synchronize")
        self.handle("submitted", "pull_request_review", event("submitted", "commented"))
        self.assertEqual(self.github.writes, [])

    def test_last_approval_dismissal_resets_issue(self):
        self.github.statuses = {"issue": "Approved"}
        self.github.requests = [{"requestedReviewer": {"id": "alice"}}]
        self.github.reviews = [api_review(state="DISMISSED")]
        self.github.dismissals = [
            {
                "createdAt": "2026-11-10T02:00:00Z",
                "previousReviewState": "APPROVED",
                "review": {"id": "review"},
            }
        ]
        self.handle("dismissed", "pull_request_review")
        self.assertEqual(self.github.statuses, {"issue": "In progress"})

    def test_dismissal_of_changes_does_not_reset_an_existing_review_request(self):
        self.github.requests = [{"requestedReviewer": {"id": "alice"}}]
        self.github.dismissals = [
            {
                "createdAt": "2026-11-10T02:00:00Z",
                "previousReviewState": "CHANGES_REQUESTED",
                "review": {"id": "review"},
            }
        ]
        self.handle("dismissed", "pull_request_review")
        self.assertEqual(self.github.statuses["issue"], "In review")

    def test_repeated_event_is_idempotent(self):
        self.handle()
        before = list(self.github.writes)
        self.handle()
        self.assertEqual(self.github.writes, before)

    def test_dry_run_does_not_add_or_update_items(self):
        self.github.dry_run = True
        self.handle()
        self.assertEqual(self.github.statuses, {})

    def test_archived_items_are_not_restored(self):
        self.github.statuses["issue"] = "Done"
        self.github.archived.add("issue")
        self.handle()
        self.assertEqual(self.github.statuses["issue"], "Done")

    def test_pr_without_linked_issue_creates_no_card(self):
        self.github.issues = []
        self.handle()
        self.assertEqual(self.github.statuses, {})

    def test_delayed_push_does_not_override_a_newer_change_request(self):
        self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
        self.handle("synchronize")
        self.assertEqual(self.github.statuses["issue"], "Changes requested")

    def test_delayed_dismissal_does_not_override_a_newer_review_request(self):
        self.github.requests = [{"requestedReviewer": {"id": "alice"}}]
        self.github.dismissals = [
            {
                "createdAt": "2026-11-10T02:00:00Z",
                "previousReviewState": "APPROVED",
                "review": {"id": "review"},
            },
            {
                "__typename": "ReviewRequestedEvent",
                "createdAt": "2026-11-10T03:00:00Z",
            },
        ]
        self.handle("dismissed", "pull_request_review")
        self.assertEqual(self.github.statuses["issue"], "In review")


class IssueLookupTests(unittest.TestCase):
    def handle_merge(self, github):
        github.pr["state"] = "MERGED"
        payload = event("closed")
        payload["pull_request"]["merged"] = True
        run(github, "pull_request_target", payload)

    def test_declared_pr_number_is_ignored_without_creating_a_card(self):
        github = MemoryGitHub()
        github.issues = []
        github.pr["body"] = "Closes #200"
        github.declared_pull_requests.add(200)
        self.handle_merge(github)
        self.assertEqual(github.writes, [])
        self.assertEqual(github.added, [])

    def test_nonexistent_issue_number_is_ignored_without_creating_a_card(self):
        github = MemoryGitHub()
        github.issues = []
        github.pr["body"] = "Closes #999"
        self.handle_merge(github)
        self.assertEqual(github.writes, [])
        self.assertEqual(github.added, [])

    def test_invalid_numbers_do_not_prevent_valid_issue_completion(self):
        github = MemoryGitHub()
        github.pr["body"] = "Closes #1. Closes #200. Closes #999."
        github.declared_pull_requests.add(200)
        self.handle_merge(github)
        self.assertEqual(github.statuses, {"issue": "Done"})

    def test_lookup_permission_and_other_not_found_errors_still_fail(self):
        for errors in [
            [{"type": "FORBIDDEN", "path": ["repository", "issueOrPullRequest"]}],
            [{"type": "NOT_FOUND", "path": ["repository"]}],
            [{"type": "RATE_LIMITED"}],
            [
                {"type": "NOT_FOUND", "path": ["repository", "issueOrPullRequest"]},
                {"type": "FORBIDDEN", "path": ["repository"]},
            ],
        ]:
            with self.subTest(errors=errors):
                github = MemoryGitHub()
                github.issues = []
                github.pr["body"] = "Closes #200"
                github.lookup_errors[200] = errors
                with self.assertRaises(RuntimeError):
                    self.handle_merge(github)
                self.assertEqual(github.writes, [])
                self.assertEqual(github.added, [])

    def test_unstructured_authentication_failure_is_not_ignored(self):
        result = subprocess.CompletedProcess(
            args=["gh"], returncode=1, stdout="", stderr="authentication failed"
        )
        with (
            patch("project_status.subprocess.run", return_value=result),
            self.assertRaisesRegex(RuntimeError, "authentication failed"),
        ):
            GitHub().graphql("query { viewer { login } }")


class PaginationTests(unittest.TestCase):
    def test_missing_or_repeated_cursor_fails_instead_of_looping(self):
        class StalledGitHub(GitHub):
            next_cursor = None

            def graphql(self, query, **variables):
                return {
                    "node": {
                        "reviews": {
                            "nodes": [],
                            "pageInfo": {
                                "hasNextPage": True,
                                "endCursor": self.next_cursor,
                            },
                        }
                    }
                }

        for next_cursor in [None, "same"]:
            with self.subTest(next_cursor=next_cursor):
                github = StalledGitHub()
                github.next_cursor = next_cursor
                with self.assertRaisesRegex(RuntimeError, "did not advance"):
                    github.connection("pr", "PullRequest", "reviews", "state")

    def test_connection_reads_past_first_hundred_items(self):
        class PagedGitHub(GitHub):
            def graphql(self, query, **variables):
                second_page = variables["after"] == "next"
                return {
                    "node": {
                        "reviews": {
                            "nodes": [{"state": "APPROVED"}]
                            if second_page
                            else [{}] * 100,
                            "pageInfo": {
                                "hasNextPage": not second_page,
                                "endCursor": "next",
                            },
                        }
                    }
                }

        reviews = PagedGitHub().connection("pr", "PullRequest", "reviews", "state")
        self.assertEqual(len(reviews), 101)
        self.assertEqual(reviews[-1]["state"], "APPROVED")


class ReviewArtifactTests(unittest.TestCase):
    def setUp(self):
        self.payload = event("submitted")
        self.payload["review"].update(id=12)
        self.payload["pull_request"].update(
            number=1,
            head={"sha": "head", "ref": "feature", "repo": {"full_name": "fork/core"}},
        )
        self.source = {
            "event": "pull_request_review",
            "head_sha": "head",
            "head_branch": "feature",
            "head_repository": {"full_name": "fork/core"},
        }
        self.pr = {
            "node_id": "pr",
            "base": {"repo": {"full_name": "JesusFilm/core"}},
            "head": copy.deepcopy(self.payload["pull_request"]["head"]),
        }
        self.review = {"node_id": "review", "id": 12, "state": "APPROVED"}

    def test_fork_review_is_validated_and_uses_live_review_state(self):
        self.payload["review"]["state"] = "COMMENTED"
        self.assertTrue(
            validate_review_event(self.payload, self.source, self.pr, self.review)
        )
        self.assertEqual(self.payload["review"]["state"], "APPROVED")

    def test_review_of_old_head_and_dismissed_submission_are_skipped(self):
        self.pr["head"]["sha"] = "new-head"
        self.assertFalse(
            validate_review_event(self.payload, self.source, self.pr, self.review)
        )
        self.pr["head"]["sha"] = "head"
        self.review["state"] = "DISMISSED"
        self.assertFalse(
            validate_review_event(self.payload, self.source, self.pr, self.review)
        )

    def test_artifacts_cannot_select_another_pr_run_or_review(self):
        for target, key, value in [
            ("source", "head_sha", "wrong"),
            ("source", "head_branch", "wrong"),
            ("source", "event", "pull_request"),
            ("pr", "node_id", "another-pr"),
            ("review", "node_id", "another-review"),
        ]:
            with self.subTest(target=target, key=key):
                payload, source, pr, review = copy.deepcopy(
                    (self.payload, self.source, self.pr, self.review)
                )
                {"source": source, "pr": pr, "review": review}[target][key] = value
                with self.assertRaises(ValueError):
                    validate_review_event(payload, source, pr, review)


if __name__ == "__main__":
    unittest.main()
