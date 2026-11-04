import json
import unittest
from unittest.mock import patch

import phoebe_board as board


POLICY = {"repo": "JesusFilm/core", "organization": "JesusFilm", "project": 8,
          "default_branch": "main", "links": {"1": [10]}}


def pr(number=1, **extra):
    value = {"number": number, "id": f"PR{number}", "state": "OPEN", "isDraft": False,
             "baseRefName": "main", "reviewDecision": "REVIEW_REQUIRED", "labels": []}
    value.update(extra)
    return value


class StateTests(unittest.TestCase):
    def test_review_cycle_and_stacked_merges(self):
        for changes, expected in [
            ({"isDraft": True}, "In progress"),
            ({}, "In review"),
            ({"reviewDecision": "CHANGES_REQUESTED"}, "Changes requested"),
            ({"reviewDecision": "CHANGES_REQUESTED", "feedback": False}, "In review"),
            ({"reviewDecision": "APPROVED"}, "Approved"),
            ({"reviewDecision": "APPROVED", "feedback": True}, "Changes requested"),
            ({"state": "MERGED"}, "Done"),
            ({"state": "MERGED", "baseRefName": "feature/parent"}, "In review"),
            ({"state": "CLOSED"}, "Needs Human"),
        ]:
            with self.subTest(changes=changes):
                self.assertEqual(board.pr_status(pr(**changes), "main"), expected)

    def test_all_required_prs_and_explicit_gate(self):
        merged = pr(state="MERGED")
        self.assertEqual(board.issue_status([merged, pr(2)], "main"), "In review")
        self.assertEqual(board.issue_status([merged, pr(2, state="MERGED")], "main"), "Done")
        self.assertEqual(board.issue_status([merged], "main", {"verified": False}), "Approved")
        self.assertEqual(board.issue_status([merged], "main", {"verified": True}), "Done")

    def test_explicit_links_and_stacked_closing_lines(self):
        self.assertEqual(board.issue_links(pr(body="Closes #20"), POLICY), [10])
        self.assertEqual(board.issue_links(pr(2, body="Closes #20\nSource #30\nFixes other/repo#99"), POLICY), [20])
        self.assertEqual(board.issue_links(pr(2, body="Reference #30"), POLICY), [])
        references = [{"number": 20, "url": "https://github.com/JesusFilm/core/issues/20"},
                      {"number": 99, "url": "https://github.com/other/repo/issues/99"}]
        self.assertEqual(board.issue_links(pr(2, closingIssuesReferences=references), POLICY), [20])

    def test_exclusive_ownership(self):
        for label in board.OWNERS:
            self.assertEqual(board.owner(pr(labels=[{"name": label}])), label)
        with self.assertRaises(ValueError):
            board.owner(pr(labels=[{"name": label} for label in board.OWNERS]))

    def test_manual_move_sticks_until_release(self):
        want, state = board.resolve_status("In review", "Approved", {"last": "Changes requested"})
        self.assertEqual(want, "In review")
        self.assertEqual(board.resolve_status("In review", "Done", state)[0], "In review")
        self.assertEqual(board.resolve_status("In review", "Done", state, release=True)[0], "Done")

    def test_partial_status_write_is_retried_without_false_manual_override(self):
        for have in ["In review", "Approved"]:
            want, state = board.resolve_status(have, "Approved", {"last": "In review", "pending": "Approved"})
            self.assertEqual(want, "Approved")
            self.assertNotIn("manual", state)

    def test_bootstrap_keeps_human_gates_but_advances_ready_pr(self):
        for have in ["QA", "Needs Human", "Done"]:
            self.assertEqual(board.resolve_status(have, "In review", {})[0], have)
        self.assertEqual(board.resolve_status("In progress", "In review", {})[0], "In review")

    def test_restored_position_expires_only_for_its_own_new_activity(self):
        state = {"last": "Approved", "manual": "Approved", "until_activity": "old"}
        self.assertEqual(board.resolve_status("Approved", "Changes requested", state, fingerprint="old")[0], "Approved")
        self.assertEqual(board.resolve_status("Approved", "Changes requested", state, fingerprint="new")[0], "Changes requested")


class Project:
    def __init__(self):
        self.status = {1: "In progress", 10: "In progress"}
        self.state = {}
        self.fail_status = False
        self.concurrent_move = False
        self.unowned = set()
        self.mutations = []
        names = ["In progress", "In review", "Changes requested", "Approved", "Done", "Needs Human", "QA"]
        self.project = {"id": "project", "fields": {"nodes": [
            {"id": "status", "name": "Status", "options": [{"name": name, "id": name} for name in names]},
            {"id": "state", "name": board.STATE_FIELD},
        ]}}

    def item(self, number):
        nodes = [{"name": self.status[number], "field": {"name": "Status"}}]
        if number in self.state:
            nodes.append({"text": self.state[number], "field": {"name": board.STATE_FIELD}})
        labels = [] if number in self.unowned else [{"name": "phoebe-siyang-vm"}]
        return {"id": str(number), "content": {"labels": {"nodes": labels}}, "fieldValues": {"nodes": nodes}}

    def snapshot(self, *args):
        return self.project, {n: self.item(n) for n in self.status}

    def query(self, query, **variables):
        if query.startswith("query"):
            return {"node": self.item(int(variables["id"]))}
        self.mutations.append(variables)
        number = int(variables["i"])
        if variables["f"] == "state":
            self.state[number] = variables["text"]
            if self.concurrent_move and "pending" in json.loads(variables["text"]):
                self.concurrent_move = False
                self.status[number] = "QA"
        elif self.fail_status:
            self.fail_status = False
            raise RuntimeError("temporary project failure")
        else:
            self.status[number] = variables["option"]


class WriterTests(unittest.TestCase):
    def run_update(self, project, pulls, policy=None, apply=True, release=None):
        rows = {10: {"number": 10, "node_id": "I10", "labels": [{"name": "phoebe-siyang-vm"}]}}
        with patch.object(board, "collect", return_value=(rows, pulls)), patch.object(board, "snapshot", side_effect=project.snapshot):
            return board.update_board(project, policy or POLICY, apply, release)

    def test_both_cards_follow_repeated_review_cycle_and_merge(self):
        for owner in board.OWNERS:
            project = Project()
            view = pr(labels=[{"name": owner}])
            for changes, expected in [
                ({}, "In review"),
                ({"feedback": True, "reviewDecision": "CHANGES_REQUESTED"}, "Changes requested"),
                ({"feedback": False}, "In review"),
                ({"reviewDecision": "APPROVED"}, "Approved"),
                ({"feedback": True}, "Changes requested"),
                ({"state": "MERGED"}, "Done"),
            ]:
                view.update(changes)
                self.run_update(project, {1: view})
                self.assertEqual(project.status, {1: expected, 10: expected})

    def test_dry_run_never_writes(self):
        project = Project()
        self.assertEqual(self.run_update(project, {1: pr()}, apply=False), [1, 10])
        self.assertEqual(project.mutations, [])

    def test_unchanged_event_does_not_write(self):
        project = Project()
        self.run_update(project, {1: pr()})
        project.mutations.clear()
        self.run_update(project, {1: pr()})
        self.assertEqual(project.mutations, [])

    def test_failure_then_retry_is_idempotent(self):
        project = Project()
        project.fail_status = True
        with self.assertRaises(RuntimeError):
            self.run_update(project, {1: pr()})
        self.run_update(project, {1: pr()})
        self.assertEqual(project.status, {1: "In review", 10: "In review"})
        self.assertNotIn("manual", json.loads(project.state[1]))

    def test_concurrent_manual_move_is_not_overwritten(self):
        project = Project()
        project.concurrent_move = True
        self.run_update(project, {1: pr()})
        self.assertEqual(project.status[1], "QA")
        self.assertEqual(json.loads(project.state[1])["manual"], "QA")

    def test_removed_ownership_is_respected_before_writing(self):
        project = Project()
        project.unowned.add(1)
        self.run_update(project, {1: pr()})
        self.assertEqual(project.status[1], "In progress")

    def test_manual_override_is_preserved_and_can_be_released(self):
        project = Project()
        self.run_update(project, {1: pr()})
        project.status[10] = "QA"
        self.run_update(project, {1: pr(state="MERGED")})
        self.assertEqual(project.status[10], "QA")
        self.run_update(project, {1: pr(state="MERGED")}, release={10})
        self.assertEqual(project.status[10], "Done")

    def test_missing_required_pr_prevents_issue_completion(self):
        project = Project()
        policy = dict(POLICY, links={"1": [10], "2": [10]})
        self.run_update(project, {1: pr(state="MERGED")}, policy)
        self.assertEqual(project.status[10], "In progress")

    def test_bookkeeping_done_is_not_reopened(self):
        project = Project()
        project.status[10] = "Done"
        self.run_update(project, {1: pr(feedback=True)}, dict(POLICY, bookkeeping_done=[10]))
        self.assertEqual(project.status[10], "Done")

    def test_existing_restored_positions_are_imported_once(self):
        project = Project()
        project.status[10] = "Approved"
        policy = dict(POLICY, manual_overrides={"10": "Approved"})
        self.run_update(project, {1: pr(feedback=True)}, policy)
        self.assertEqual(project.status[10], "Approved")
        self.run_update(project, {1: pr(feedback=True)}, policy, release={10})
        self.run_update(project, {1: pr(feedback=True)}, policy)
        self.assertEqual(project.status[10], "Changes requested")

    def test_new_pr_activity_releases_a_restored_card(self):
        project = Project()
        project.status[10] = "Approved"
        policy = dict(POLICY, manual_overrides={"10": "Approved"})
        self.run_update(project, {1: pr(feedback=True, headRefOid="old")}, policy)
        self.assertEqual(project.status[10], "Approved")
        self.run_update(project, {1: pr(feedback=True, headRefOid="new")}, policy)
        self.assertEqual(project.status[10], "Changes requested")


class FeedbackTests(unittest.TestCase):
    def request_scenario(self, inline=True, approved=False):
        class Fake:
            def call(self, *args):
                return [[{'user': {'login': 'siyang-bot'}, 'body': '<!-- phoebe-reviews-handled: latest=2026-11-04T01:00:00Z -->'}]]
            def query(self, *args, **kwargs):
                if 'latestOpinionatedReviews' in args[0]:
                    reviews = [{'databaseId': 8 if approved else 7, 'author': {'login': 'csiyang'},
                                'state': 'APPROVED' if approved else 'CHANGES_REQUESTED'}]
                    return {'repository': {'pullRequest': {'latestOpinionatedReviews': {
                        'pageInfo': {'hasNextPage': False}, 'nodes': reviews}}}}
                nodes = [{'id': 'thread', 'isResolved': False, 'isOutdated': False,
                          'comments': {'pageInfo': {'hasNextPage': False}, 'nodes': [
                              {'author': {'login': 'csiyang'}, 'createdAt': '2026-11-04T00:00:00Z',
                               'pullRequestReview': {'databaseId': 7}}]}}] if inline else []
                return {'repository': {'pullRequest': {'author': {'login': 'siyang-bot'}, 'reviewThreads': {
                    'pageInfo': {'hasNextPage': False}, 'nodes': nodes}}}}
        return board.feedback(Fake(), 'org/repo', 1, 'CHANGES_REQUESTED')

    def test_handled_inline_review_does_not_keep_old_request_blocking(self):
        self.assertFalse(self.request_scenario())

    def test_body_only_change_request_is_not_cleared_by_unrelated_marker(self):
        self.assertTrue(self.request_scenario(inline=False))

    def test_later_approval_clears_body_only_change_request(self):
        self.assertFalse(self.request_scenario(inline=False, approved=True))

    def test_only_feedback_newer_than_bot_handled_marker_counts(self):
        class Fake:
            def call(self, *args):
                return [[{'user': {'login': 'siyang-bot'}, 'body': '<!-- phoebe-reviews-handled: latest=2026-11-04T00:00:00Z -->'}]]
            def query(self, *args, **kwargs):
                return {'repository': {'pullRequest': {'author': {'login': 'siyang-bot'}, 'reviewThreads': {
                    'pageInfo': {'hasNextPage': False}, 'nodes': [{'id': 'thread', 'isResolved': False, 'isOutdated': False,
                    'comments': {'pageInfo': {'hasNextPage': False}, 'nodes': [{'author': {'login': 'csiyang'}, 'createdAt': self.created}]}}]}}}}
        gh = Fake()
        gh.created = '2026-11-03T23:00:00Z'
        self.assertFalse(board.feedback(gh, 'org/repo', 1))
        gh.created = '2026-11-04T01:00:00Z'
        self.assertTrue(board.feedback(gh, 'org/repo', 1))




if __name__ == "__main__":
    unittest.main()
