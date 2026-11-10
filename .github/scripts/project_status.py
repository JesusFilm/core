"""Update Next Steps statuses without checking out or executing PR code."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

PROJECT_ID = "PVT_kwDOBNwqhs4BeMYJ"
MANUAL_LABEL = "status:manual"
REPOSITORY = "JesusFilm/core"


@dataclass(frozen=True)
class Review:
    author_id: str
    state: str
    commit_id: str
    submitted_at: str


@dataclass
class PullRequest:
    id: str
    state: str
    head: str
    reviews: list[Review] = field(default_factory=list)
    requested_reviewers: set[str] = field(default_factory=set)
    last_approval_dismissed_at: str = ""


def pull_request_status(pr: PullRequest, action: str) -> str | None:
    if pr.state == "MERGED":
        return "Done"
    if pr.state != "OPEN":
        return None

    # A push invalidates approvals of earlier commits even when branch protection
    # has not dismissed them yet. Any remaining approval of HEAD wins.
    reviews = [review for review in pr.reviews if review.commit_id == pr.head]
    if any(review.state == "APPROVED" for review in reviews):
        return "Approved"
    if action in {"synchronize", "dismissed"}:
        return "In progress"

    change_requests = [
        review
        for review in reviews
        if review.state == "CHANGES_REQUESTED"
        and review.submitted_at > pr.last_approval_dismissed_at
    ]
    if any(
        review.author_id not in pr.requested_reviewers for review in change_requests
    ):
        return "Changes requested"
    if pr.requested_reviewers:
        return "In review"
    return "In progress"


def eligible_issue(pr_id: str, issues: list[dict], linked_prs: list[dict]) -> bool:
    if len(issues) != 1:
        return False
    issue = issues[0]
    if issue["state"] != "OPEN" or issue["repository"]["nameWithOwner"] != REPOSITORY:
        return False
    active_pr_ids = {pr["id"] for pr in linked_prs if pr["state"] in {"OPEN", "MERGED"}}
    return active_pr_ids == {pr_id}


class GitHub:
    """Small gh GraphQL adapter; every connection is paginated."""

    def __init__(self, dry_run=False):
        self.dry_run = dry_run

    def graphql(self, query: str, **variables) -> dict:
        result = subprocess.run(
            ["gh", "api", "graphql", "--input", "-"],
            input=json.dumps({"query": query, "variables": variables}),
            text=True,
            capture_output=True,
            check=False,
        )
        if result.returncode:
            raise RuntimeError(
                f"GitHub GraphQL failed: {result.stderr}\n{result.stdout}"
            )
        response = json.loads(result.stdout)
        if response.get("errors"):
            raise RuntimeError(json.dumps(response["errors"]))
        return response["data"]

    def node(self, node_id: str, node_type: str, selection: str) -> dict:
        data = self.graphql(
            "query($id: ID!) { node(id: $id) { ... on "
            + node_type
            + " { "
            + selection
            + " } } }",
            id=node_id,
        )
        if not data["node"]:
            raise RuntimeError(f"Cannot read {node_type} {node_id}")
        return data["node"]

    def connection(
        self,
        node_id: str,
        node_type: str,
        name: str,
        selection: str,
        arguments: str = "",
    ) -> list[dict]:
        nodes = []
        cursor = None
        while True:
            data = self.graphql(
                "query($id: ID!, $after: String) { node(id: $id) { ... on "
                + node_type
                + " { "
                + name
                + "(first: 100, after: $after"
                + arguments
                + ") { nodes { "
                + selection
                + " } pageInfo { hasNextPage endCursor } } } } }",
                id=node_id,
                after=cursor,
            )
            connection = data["node"][name]
            nodes.extend(node for node in connection["nodes"] if node is not None)
            if not connection["pageInfo"]["hasNextPage"]:
                return nodes
            cursor = connection["pageInfo"]["endCursor"]


class ProjectStatuses:
    def __init__(self, github: GitHub):
        self.github = github
        fields = github.connection(
            PROJECT_ID,
            "ProjectV2",
            "fields",
            "... on ProjectV2SingleSelectField { id name options { id name } }",
        )
        status_field = next(item for item in fields if item.get("name") == "Status")
        self.field_id = status_field["id"]
        self.options = {
            option["name"]: option["id"] for option in status_field["options"]
        }
        required = {
            "Triage",
            "In progress",
            "In review",
            "Changes requested",
            "Approved",
            "Done",
        }
        if missing := required - self.options.keys():
            raise RuntimeError(f"Missing project statuses: {sorted(missing)}")

    def labels(self, node_id: str, node_type: str) -> set[str]:
        return {
            label["name"]
            for label in self.github.connection(node_id, node_type, "labels", "name")
        }

    def set(self, node_id: str, node_type: str, status: str, only_if_unset=False):
        # Read labels again immediately before writing, independently for each item.
        if MANUAL_LABEL in self.labels(node_id, node_type):
            print(f"Skipping {node_id}: {MANUAL_LABEL}")
            return
        items = self.github.connection(
            node_id,
            node_type,
            "projectItems",
            "id isArchived project { id } "
            'fieldValueByName(name: "Status") { '
            "... on ProjectV2ItemFieldSingleSelectValue { name } }",
        )
        item = next(
            (item for item in items if item["project"]["id"] == PROJECT_ID), None
        )
        if item and item["isArchived"]:
            print(f"Skipping archived item {node_id}")
            return
        previous = ((item or {}).get("fieldValueByName") or {}).get("name")
        if previous == status or (only_if_unset and previous):
            return
        if self.github.dry_run:
            print(
                f"Would set {node_type} {node_id}: {previous or '(unset)'} -> {status}"
            )
            return
        if item is None:
            item = self.github.graphql(
                "mutation($project: ID!, $content: ID!) { addProjectV2ItemById("
                "input: {projectId: $project, contentId: $content}) { item { id } } }",
                project=PROJECT_ID,
                content=node_id,
            )["addProjectV2ItemById"]["item"]
        self.github.graphql(
            "mutation($project: ID!, $item: ID!, $field: ID!, $option: String!) { "
            "updateProjectV2ItemFieldValue(input: {projectId: $project, itemId: $item, "
            "fieldId: $field, value: {singleSelectOptionId: $option}}) { "
            "projectV2Item { id } } }",
            project=PROJECT_ID,
            item=item["id"],
            field=self.field_id,
            option=self.options[status],
        )
        print(f"{node_type} {node_id}: {previous or '(unset)'} -> {status}")


def run(github: GitHub, event_name: str, event: dict):
    if event["repository"]["full_name"] != REPOSITORY:
        return
    action = event["action"]
    if event_name == "issues":
        if action != "opened":
            return
        issue_id = event["issue"]["node_id"]
        issue = github.node(issue_id, "Issue", "state")
        if issue["state"] == "OPEN":
            # A delayed creation run must not undo a subsequent PR/manual update.
            ProjectStatuses(github).set(issue_id, "Issue", "Triage", only_if_unset=True)
        return

    if event_name not in {"pull_request_target", "pull_request_review"}:
        return
    if event_name == "pull_request_review" and (
        action == "submitted" and event["review"]["state"].lower() == "commented"
    ):
        return
    pr_id = event["pull_request"]["node_id"]
    current = github.node(pr_id, "PullRequest", "id state headRefOid")
    # Cancellation never updates either item, even when processing was delayed.
    if action == "closed" and not event["pull_request"].get("merged"):
        return
    if current["state"] == "CLOSED":
        return
    if action == "synchronize" and (
        event["pull_request"]["head"]["sha"] != current["headRefOid"]
    ):
        print("Skipping superseded push")
        return

    statuses = ProjectStatuses(github)
    reviews = github.connection(
        pr_id,
        "PullRequest",
        "latestOpinionatedReviews",
        "author { ... on User { id } ... on Bot { id } ... on Mannequin { id } } "
        "state submittedAt commit { oid }",
    )
    requests = github.connection(
        pr_id,
        "PullRequest",
        "reviewRequests",
        "requestedReviewer { ... on User { id } ... on Team { id } "
        "... on Mannequin { id } }",
    )
    timeline = github.connection(
        pr_id,
        "PullRequest",
        "timelineItems",
        "__typename "
        "... on ReviewDismissedEvent { createdAt previousReviewState review { id } } "
        "... on ReviewRequestedEvent { createdAt }",
        ", itemTypes: [REVIEW_DISMISSED_EVENT, REVIEW_REQUESTED_EVENT]",
    )
    dismissals = [item for item in timeline if "previousReviewState" in item]
    pr = PullRequest(
        id=pr_id,
        state=current["state"],
        head=current["headRefOid"],
        reviews=[
            Review(
                author_id=(review["author"] or {}).get("id", ""),
                state=review["state"],
                commit_id=(review["commit"] or {}).get("oid", ""),
                submitted_at=review["submittedAt"] or "",
            )
            for review in reviews
        ],
        requested_reviewers={
            request["requestedReviewer"]["id"]
            for request in requests
            if request["requestedReviewer"]
        },
        last_approval_dismissed_at=max(
            (
                dismissal["createdAt"]
                for dismissal in dismissals
                if dismissal["previousReviewState"] == "APPROVED"
            ),
            default="",
        ),
    )
    # Identify this dismissal, rather than an earlier dismissal in the timeline.
    policy_action = action
    reset_at = ""
    if action == "synchronize":
        reset_at = event["pull_request"]["updated_at"]
    if action == "dismissed":
        dismissed_id = event["review"]["node_id"]
        dismissed = next(
            (item for item in dismissals if item["review"]["id"] == dismissed_id), None
        )
        if dismissed is None:
            raise RuntimeError("Dismissed review is not yet visible in the timeline")
        if dismissed["previousReviewState"] != "APPROVED":
            policy_action = "review_updated"
        else:
            reset_at = dismissed["createdAt"]
    # Runs can reach the queue out of order. A delayed reset must not overwrite
    # a newer review or re-review request already visible through the API.
    if reset_at and (
        any(
            review.commit_id == pr.head
            and review.submitted_at > reset_at
            and review.state in {"APPROVED", "CHANGES_REQUESTED"}
            for review in pr.reviews
        )
        or any(
            item.get("__typename") == "ReviewRequestedEvent"
            and item["createdAt"] > reset_at
            for item in timeline
        )
    ):
        policy_action = "review_updated"
    status = pull_request_status(pr, policy_action)
    if status is None:
        return
    statuses.set(pr_id, "PullRequest", status)
    issues = github.connection(
        pr_id,
        "PullRequest",
        "closingIssuesReferences",
        "id state repository { nameWithOwner }",
    )
    if len(issues) != 1 or issues[0]["state"] != "OPEN":
        return
    issue = issues[0]
    if issue["repository"]["nameWithOwner"] != REPOSITORY:
        return
    linked_prs = github.connection(
        issue["id"],
        "Issue",
        "closedByPullRequestsReferences",
        "id state",
        ", includeClosedPrs: true",
    )
    if eligible_issue(pr_id, issues, linked_prs):
        statuses.set(issue["id"], "Issue", status)
    else:
        print("Skipping issue: another open or merged PR is linked")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--event-name", default=os.environ.get("GITHUB_EVENT_NAME"))
    parser.add_argument("--event-path", default=os.environ.get("GITHUB_EVENT_PATH"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(
        GitHub(dry_run=args.dry_run),
        args.event_name,
        json.loads(Path(args.event_path).read_text()),
    )
