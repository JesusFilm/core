import copy
import unittest

from project_status import (
    MANUAL_LABEL,
    PROJECT_ID,
    GitHub,
    PullRequest,
    Review,
    pull_request_status,
    run,
)
from project_status_review import validate_review_event


class MemoryGitHub(GitHub):
    """Project API fixture: exercise the handler through its GitHub boundary."""

    def __init__(self):
        super().__init__()
        self.pr = {"id": "pr", "state": "OPEN", "headRefOid": "head"}
        self.issue = {
            "id": "issue",
            "state": "OPEN",
            "repository": {"nameWithOwner": "JesusFilm/core"},
        }
        self.issues = [self.issue]
        self.linked_prs = [{"id": "pr", "state": "OPEN"}]
        self.reviews = []
        self.requests = []
        self.dismissals = []
        self.labels = {"pr": set(), "issue": set()}
        self.statuses = {}
        self.archived = set()
        self.writes = []

    def node(self, node_id, node_type, selection):
        return self.pr if node_type == "PullRequest" else self.issue

    def connection(self, node_id, node_type, name, selection, arguments=""):
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
            if node_id not in self.statuses:
                return []
            return [
                {
                    "id": node_id,
                    "project": {"id": PROJECT_ID},
                    "isArchived": node_id in self.archived,
                    "fieldValueByName": {"name": self.statuses[node_id]},
                }
            ]
        return {
            "latestOpinionatedReviews": self.reviews,
            "reviewRequests": self.requests,
            "timelineItems": self.dismissals,
            "closingIssuesReferences": self.issues,
            "closedByPullRequestsReferences": self.linked_prs,
        }[name]

    def graphql(self, query, **variables):
        if "addProjectV2ItemById" in query:
            node_id = variables["content"]
            self.statuses[node_id] = None
            return {"addProjectV2ItemById": {"item": {"id": node_id}}}
        if "updateProjectV2ItemFieldValue" in query:
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

    def test_new_issue_enters_triage_without_overwriting_later_work(self):
        self.handle(event_name="issues")
        self.assertEqual(self.github.statuses, {"issue": "Triage"})
        self.github.statuses["issue"] = "Ready"
        self.handle(event_name="issues")
        self.assertEqual(self.github.statuses["issue"], "Ready")

    def test_open_pr_moves_ready_issue_and_pr_into_progress(self):
        self.github.statuses["issue"] = "Ready"
        self.handle()
        self.assertEqual(
            self.github.statuses, {"pr": "In progress", "issue": "In progress"}
        )

    def test_open_with_pending_reviewer_enters_review(self):
        self.github.requests = [{"requestedReviewer": {"id": "alice"}}]
        self.handle()
        self.assertEqual(self.github.statuses["pr"], "In review")

    def test_approval_updates_both_items_and_leaves_qa(self):
        self.github.statuses = {"issue": "QA", "pr": "In review"}
        self.github.reviews = [api_review()]
        self.handle("submitted", "pull_request_review")
        self.assertEqual(self.github.statuses, {"pr": "Approved", "issue": "Approved"})

    def test_manual_overrides_are_independent_and_removal_waits_for_next_event(self):
        for frozen, moving in [("issue", "pr"), ("pr", "issue")]:
            with self.subTest(frozen=frozen):
                self.setUp()
                self.github.statuses = {"issue": "QA", "pr": "QA"}
                self.github.labels[frozen].add(MANUAL_LABEL)
                self.handle()
                self.assertEqual(self.github.statuses[frozen], "QA")
                self.assertEqual(self.github.statuses[moving], "In progress")
                self.github.labels[frozen].clear()
                self.handle("unlabeled", event_name="issues")
                self.assertEqual(self.github.statuses[frozen], "QA")
                self.handle("review_requested")
                self.assertEqual(self.github.statuses[frozen], "In progress")

    def test_cancellation_never_changes_issue_or_pr_even_if_pr_was_reopened(self):
        for state in ["CLOSED", "OPEN"]:
            with self.subTest(state=state):
                self.github.pr["state"] = state
                self.handle("closed")
                self.assertEqual(self.github.writes, [])

    def test_merge_moves_both_open_items_to_done(self):
        self.github.pr["state"] = "MERGED"
        self.github.linked_prs[0]["state"] = "MERGED"
        payload = event("closed")
        payload["pull_request"]["merged"] = True
        self.handle(payload=payload)
        self.assertEqual(self.github.statuses, {"pr": "Done", "issue": "Done"})

    def test_closed_issue_is_never_updated_or_reopened(self):
        self.github.issue["state"] = "CLOSED"
        self.handle("reopened")
        self.assertEqual(self.github.statuses, {"pr": "In progress"})

    def test_reopened_pr_recalculates_eligible_open_issue(self):
        self.github.reviews = [api_review()]
        self.handle("reopened")
        self.assertEqual(self.github.statuses, {"pr": "Approved", "issue": "Approved"})

    def test_multiple_issues_are_never_updated(self):
        self.github.issues.append(dict(self.github.issue, id="another-issue"))
        self.handle()
        self.assertEqual(self.github.statuses, {"pr": "In progress"})

    def test_other_open_or_merged_pr_blocks_issue_but_closed_pr_does_not(self):
        for state, expected in [("OPEN", False), ("MERGED", False), ("CLOSED", True)]:
            with self.subTest(state=state):
                self.setUp()
                self.github.linked_prs.append({"id": "other-pr", "state": state})
                self.handle()
                self.assertEqual("issue" in self.github.statuses, expected)
                self.assertEqual(self.github.statuses["pr"], "In progress")

    def test_superseded_push_and_commented_review_are_ignored(self):
        self.github.pr["headRefOid"] = "newer-head"
        self.handle("synchronize")
        self.handle("submitted", "pull_request_review", event("submitted", "commented"))
        self.assertEqual(self.github.writes, [])

    def test_last_approval_dismissal_resets_both_items(self):
        self.github.statuses = {"issue": "Approved", "pr": "Approved"}
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
        self.assertEqual(
            self.github.statuses, {"pr": "In progress", "issue": "In progress"}
        )

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
        self.assertEqual(self.github.statuses["pr"], "In review")

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

    def test_pr_without_linked_issue_still_updates_itself(self):
        self.github.issues = []
        self.handle()
        self.assertEqual(self.github.statuses, {"pr": "In progress"})

    def test_delayed_push_does_not_override_a_newer_change_request(self):
        self.github.reviews = [api_review(state="CHANGES_REQUESTED")]
        self.handle("synchronize")
        self.assertEqual(self.github.statuses["pr"], "Changes requested")

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
        self.assertEqual(self.github.statuses["pr"], "In review")


class PaginationTests(unittest.TestCase):
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
