"""Update Next Steps issue cards from PR evidence without executing PR code."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import time
from dataclasses import dataclass, field
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

from markdown_it import MarkdownIt

PROJECT_ID = "PVT_kwDOBNwqhs4BeMYJ"
MANUAL_LABEL = "status:manual"
REPOSITORY = "JesusFilm/core"
TRIAGE_BATCH_SIZE = 25
PR_TRUST_FIELDS = (
    "repository { nameWithOwner } authorAssociation headRepository { nameWithOwner }"
)


def trusted_pr(pr: dict) -> bool:
    """Use live PR author/origin metadata, not the actor or uploaded event."""
    return (pr.get("repository") or {}).get("nameWithOwner") == REPOSITORY and (
        pr.get("authorAssociation") in {"MEMBER", "OWNER", "COLLABORATOR"}
        or (pr.get("headRepository") or {}).get("nameWithOwner") == REPOSITORY
    )


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


def eligible_issue(
    pr_id: str, issues: list[dict], linked_prs: list[dict], merged: bool = False
) -> bool:
    if len(issues) != 1:
        return False
    issue = issues[0]
    if (issue["state"] != "OPEN" and not merged) or issue["repository"][
        "nameWithOwner"
    ] != REPOSITORY:
        return False
    active_pr_ids = {pr["id"] for pr in linked_prs if pr["state"] in {"OPEN", "MERGED"}}
    return active_pr_ids == {pr_id}


class ProseHTMLParser(HTMLParser):
    """Keep visible prose outside HTML examples, quotes, and comments."""

    excluded_tags = frozenset({"pre", "code", "blockquote", "q", "script", "style"})
    block_tags = frozenset(
        {
            "p",
            "div",
            "ul",
            "ol",
            "li",
            "dl",
            "dt",
            "dd",
            "table",
            "tr",
            "td",
            "th",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "br",
            "hr",
        }
    )

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.excluded: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag in self.excluded_tags:
            self.excluded.append(tag)
        # Preserve a boundary rather than joining text across excluded content.
        if tag in self.excluded_tags or tag in self.block_tags:
            self.parts.append("\0")

    def handle_endtag(self, tag: str):
        if tag in self.excluded:
            matching = len(self.excluded) - 1 - self.excluded[::-1].index(tag)
            del self.excluded[matching:]
        if tag in self.excluded_tags or tag in self.block_tags:
            self.parts.append("\0")

    def handle_data(self, data: str):
        if not self.excluded:
            self.parts.append(data)

    def handle_comment(self, data: str):
        self.parts.append("\0")


def closing_declaration_prose(body: str) -> str:
    """Parse Markdown structure so nested code and quotes remain excluded."""
    parser = ProseHTMLParser()
    parser.feed(MarkdownIt("commonmark").render(body or ""))
    parser.close()
    return "".join(parser.parts)


def closing_issue_numbers(body: str) -> set[int]:
    """Read closing declarations in prose, including on non-default stack bases."""
    body = closing_declaration_prose(body)
    reference = (
        r"(?:https://github\.com/[\w.-]+/[\w.-]+/issues/\d+|(?:[\w.-]+/[\w.-]+)?#\d+)"
    )
    declaration = re.compile(
        r"(?i)\b(?:close[sd]?|fix(?:es|ed)?|resolve[sd]?)"
        r"\s*:?\s+(" + reference + r"(?:\s*(?:,|and)\s*" + reference + r")*)"
    )
    numbers = set()
    for match in declaration.finditer(body or ""):
        for target in re.findall(reference, match[1]):
            if target.startswith("#"):
                numbers.add(int(target[1:]))
            elif target.lower().startswith(REPOSITORY.lower() + "#"):
                numbers.add(int(target.split("#")[1]))
            elif target.lower().startswith(
                "https://github.com/" + REPOSITORY.lower() + "/issues/"
            ):
                numbers.add(int(target.rsplit("/", 1)[1]))
    return numbers


def linked_issues(github: GitHub, pr: dict) -> list[dict]:
    """Combine native Development links with explicit stack closing declarations."""
    issues = github.connection(
        pr["id"],
        "PullRequest",
        "closingIssuesReferences",
        "id number state repository { nameWithOwner }",
    )
    by_id = {issue["id"]: issue for issue in issues}
    known_numbers = {
        issue["number"]
        for issue in issues
        if issue["repository"]["nameWithOwner"] == REPOSITORY
    }
    for number in sorted(closing_issue_numbers(pr["body"]) - known_numbers):
        issue = github.lookup_issue(number)
        if issue:
            by_id[issue["id"]] = issue
    return list(by_id.values())


def implementation_prs(github: GitHub, issue: dict, current_pr: dict) -> list[dict]:
    """Count native links and stack declarations, excluding mere cross-references."""
    pulls = github.connection(
        issue["id"],
        "Issue",
        "closedByPullRequestsReferences",
        "id state " + PR_TRUST_FIELDS,
        ", includeClosedPrs: true",
    )
    by_id = {pr["id"]: pr for pr in pulls if trusted_pr(pr)}
    events = github.connection(
        issue["id"],
        "Issue",
        "timelineItems",
        "... on CrossReferencedEvent { source { ... on PullRequest { "
        "id state body " + PR_TRUST_FIELDS + " } } }",
        ", itemTypes: [CROSS_REFERENCED_EVENT]",
    )
    for event in events:
        source = event.get("source") or {}
        if trusted_pr(source) and issue["number"] in closing_issue_numbers(
            source.get("body") or ""
        ):
            by_id[source["id"]] = source
    by_id[current_pr["id"]] = current_pr
    return list(by_id.values())


class GitHubGraphQLError(RuntimeError):
    """Keep structured GitHub errors available for narrowly scoped handling."""

    def __init__(self, errors: list[dict]):
        self.errors = errors
        super().__init__(json.dumps(errors))


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
        try:
            response = json.loads(result.stdout)
        except json.JSONDecodeError:
            raise RuntimeError(
                f"GitHub GraphQL failed: {result.stderr}\n{result.stdout}"
            ) from None
        if response.get("errors"):
            raise GitHubGraphQLError(response["errors"])
        if result.returncode:
            raise RuntimeError(
                f"GitHub GraphQL failed: {result.stderr}\n{result.stdout}"
            )
        return response["data"]

    def lookup_issue(self, number: int) -> dict | None:
        """Ignore declared PR/missing numbers, while preserving other API failures."""
        try:
            target = self.graphql(
                'query($number: Int!) { repository(owner: "JesusFilm", name: "core") { '
                "issueOrPullRequest(number: $number) { __typename ... on Issue { "
                "id number state repository { nameWithOwner } } } } }",
                number=number,
            )["repository"]["issueOrPullRequest"]
        except GitHubGraphQLError as error:
            if all(
                item.get("type") == "NOT_FOUND"
                and item.get("path") == ["repository", "issueOrPullRequest"]
                for item in error.errors
            ):
                return None
            raise
        if target and target.get("__typename") == "Issue":
            return target
        return None

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
            next_cursor = connection["pageInfo"]["endCursor"]
            if not next_cursor or next_cursor == cursor:
                raise RuntimeError(f"Pagination for {name} did not advance")
            cursor = next_cursor


def next_steps_item(github: GitHub, issue_id: str) -> dict | None:
    """Board membership is the scope boundary; never enroll issues from PR activity."""
    items = github.connection(
        issue_id,
        "Issue",
        "projectItems",
        "id isArchived project { id } "
        'fieldValueByName(name: "Status") { '
        "... on ProjectV2ItemFieldSingleSelectValue { name updatedAt } }",
        ", includeArchived: true",
    )
    return next((item for item in items if item["project"]["id"] == PROJECT_ID), None)


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

    def labels(self, node_id: str) -> set[str]:
        return {
            label["name"]
            for label in self.github.connection(node_id, "Issue", "labels", "name")
        }

    def set_issue(
        self, node_id: str, status: str, only_if_unset=False, *, review_at: str = ""
    ):
        """Update existing Next Steps issue cards only."""
        if MANUAL_LABEL in self.labels(node_id):
            print(f"Skipping {node_id}: {MANUAL_LABEL}")
            return
        item = next_steps_item(self.github, node_id)
        if item is None:
            print(f"Skipping {node_id}: not on the Next Steps board")
            return
        if item["isArchived"] and status != "Done":
            print(f"Skipping archived item {node_id}")
            return
        value = item.get("fieldValueByName") or {}
        previous = value.get("name")
        if previous == status or (only_if_unset and previous):
            return
        if review_at and not newer_activity(review_at, value.get("updatedAt")):
            # Recovery must not undo a later pickup, manual move or PR event.
            print(f"Skipping {node_id}: status is newer than the recovered review")
            return
        if self.github.dry_run:
            print(f"Would set Issue {node_id}: {previous or '(unset)'} -> {status}")
            return
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
        print(f"Issue {node_id}: {previous or '(unset)'} -> {status}")


def review_timeline(
    github: GitHub, pr_id: str, dismissed_review_id: str | None = None
) -> list[dict]:
    """Allow bounded API visibility lag without guessing a dismissal's meaning."""
    for attempt in range(3):
        timeline = github.connection(
            pr_id,
            "PullRequest",
            "timelineItems",
            "__typename "
            "... on ReviewDismissedEvent { createdAt previousReviewState review { id } } "
            "... on ReviewRequestedEvent { createdAt }",
            ", itemTypes: [REVIEW_DISMISSED_EVENT, REVIEW_REQUESTED_EVENT]",
        )
        if dismissed_review_id is None or any(
            item.get("review", {}).get("id") == dismissed_review_id for item in timeline
        ):
            return timeline
        if attempt < 2:
            time.sleep(2**attempt)
    raise RuntimeError("Dismissed review is not visible after 3 timeline reads")


def initialize_triage(github: GitHub):
    """Initialize unset cards added after their issue-created event was processed."""
    intake_filter = (
        f'repo:{REPOSITORY} is:issue is:open no:status -label:"{MANUAL_LABEL}"'
    )
    items = github.connection(
        PROJECT_ID,
        "ProjectV2",
        "items",
        'isArchived fieldValueByName(name: "Status") { '
        "... on ProjectV2ItemFieldSingleSelectValue { name } } "
        "content { ... on Issue { id state repository { nameWithOwner } } }",
        ", archivedStates: [NOT_ARCHIVED], query: " + json.dumps(intake_filter),
    )
    statuses = None
    processed = 0
    for item in items:
        issue = item.get("content") or {}
        if (
            item["isArchived"]
            or item.get("fieldValueByName")
            or issue.get("state") != "OPEN"
            or issue.get("repository", {}).get("nameWithOwner") != REPOSITORY
        ):
            continue
        if statuses is None:
            statuses = ProjectStatuses(github)
        # Re-read membership and status immediately before writing, in case
        # someone removed the card or started work while this scan was queued.
        statuses.set_issue(issue["id"], "Triage", only_if_unset=True)
        processed += 1
        if processed >= TRIAGE_BATCH_SIZE:
            break


def newer_activity(activity_at: str, status_at: str | None) -> bool:
    """Missing status timestamps cannot prove an old event is safe to replay."""
    return bool(
        activity_at
        and status_at
        and datetime.fromisoformat(activity_at) > datetime.fromisoformat(status_at)
    )


def recover_reviews(github: GitHub):
    """Recover review events missing a collector on an old or conflicting PR ref.

    The schedule runs trusted main code, independent of the PR's merge ref. Use
    Status field timestamps, rather than a rolling time window, so delays do not
    lose events and old reviews cannot repeatedly undo coding pickup/status moves.
    """
    items = github.connection(
        PROJECT_ID,
        "ProjectV2",
        "items",
        'isArchived fieldValueByName(name: "Status") { '
        "... on ProjectV2ItemFieldSingleSelectValue { name updatedAt } } "
        "content { ... on Issue { number state repository { nameWithOwner } } }",
        ", archivedStates: [NOT_ARCHIVED]",
    )
    status_times = {}
    for item in items:
        issue = item.get("content") or {}
        if (
            not item["isArchived"]
            and issue.get("state") == "OPEN"
            and issue.get("repository", {}).get("nameWithOwner") == REPOSITORY
        ):
            status_at = (item.get("fieldValueByName") or {}).get("updatedAt")
            if status_at:
                status_times[issue["number"]] = status_at
    if not status_times:
        return

    repository = github.graphql(
        'query { repository(owner: "JesusFilm", name: "core") { id } }'
    )["repository"]
    pulls = github.connection(
        repository["id"],
        "Repository",
        "pullRequests",
        "id body updatedAt "
        + PR_TRUST_FIELDS
        + " closingIssuesReferences(first: 100) { nodes { number "
        "repository { nameWithOwner } } pageInfo { hasNextPage } }",
        ", states: [OPEN]",
    )
    for pull in pulls:
        if not trusted_pr(pull):
            continue
        links = pull["closingIssuesReferences"]
        # More than 100 native links is necessarily an ambiguous issue mapping.
        if links.get("pageInfo", {}).get("hasNextPage"):
            continue
        numbers = closing_issue_numbers(pull["body"])
        numbers.update(
            issue["number"]
            for issue in links["nodes"]
            if issue["repository"]["nameWithOwner"] == REPOSITORY
        )
        if not any(
            number in status_times
            and newer_activity(pull["updatedAt"], status_times[number])
            for number in numbers
        ):
            continue
        # Reuse all live mapping, multi-PR, trust and opt-out checks. Discovery
        # above is only an optimization; it never supplies authority to write.
        run(
            github,
            "review_recovery",
            {
                "repository": {"full_name": REPOSITORY},
                "action": "review_updated",
                "pull_request": {"node_id": pull["id"]},
            },
        )


def run(github: GitHub, event_name: str, event: dict):
    repository = (event.get("repository") or {}).get("full_name") or os.environ.get(
        "GITHUB_REPOSITORY"
    )
    if repository != REPOSITORY:
        return
    if event_name == "schedule":
        initialize_triage(github)
        recover_reviews(github)
        return
    action = event["action"]
    if event_name == "issues":
        if action != "opened":
            return
        issue_id = event["issue"]["node_id"]
        issue = github.node(issue_id, "Issue", "state")
        if issue["state"] == "OPEN" and next_steps_item(github, issue_id) is not None:
            # A delayed creation run must not undo a subsequent PR/manual update.
            ProjectStatuses(github).set_issue(issue_id, "Triage", only_if_unset=True)
        return

    if event_name not in {
        "pull_request_target",
        "pull_request_review",
        "review_recovery",
    }:
        return
    if event_name == "pull_request_review" and (
        action == "submitted" and event["review"]["state"].lower() == "commented"
    ):
        return
    pr_id = event["pull_request"]["node_id"]
    current = github.node(
        pr_id, "PullRequest", "id state headRefOid body baseRefName " + PR_TRUST_FIELDS
    )
    if not trusted_pr(current):
        print("Skipping PR: author and head repository are outside the trusted scope")
        return
    if event_name == "review_recovery" and current["state"] != "OPEN":
        return
    # Cancellation never updates the issue, even when processing was delayed.
    if action == "closed" and not event["pull_request"].get("merged"):
        return
    if current["state"] == "CLOSED":
        return
    if action == "synchronize" and (
        event["pull_request"]["head"]["sha"] != current["headRefOid"]
    ):
        print("Skipping superseded push")
        return

    issues = linked_issues(github, current)
    if len(issues) != 1:
        return
    issue = issues[0]
    merged = current["state"] == "MERGED"
    if issue["repository"]["nameWithOwner"] != REPOSITORY or (
        issue["state"] != "OPEN" and not merged
    ):
        return
    if next_steps_item(github, issue["id"]) is None:
        print("Skipping issue: not on the Next Steps board")
        return
    linked_prs = implementation_prs(github, issue, current)
    if not eligible_issue(pr_id, issues, linked_prs, merged=merged):
        print("Skipping issue: another open or merged implementation PR is linked")
        return
    statuses = ProjectStatuses(github)
    if merged:
        statuses.set_issue(issue["id"], "Done")
        return
    timeline = review_timeline(
        github, pr_id, event["review"]["node_id"] if action == "dismissed" else None
    )
    # Refresh reviews and requests after any timeline retries, so a delayed
    # dismissal cannot overwrite review activity that arrived while waiting.
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
    review_at = ""
    if event_name == "review_recovery":
        # Recover submitted decisions only. Dismissals/pushes have their own
        # event semantics and an old review must never undo either one.
        review_at = max(
            (
                review.submitted_at
                for review in pr.reviews
                if review.commit_id == pr.head
                and review.state
                in ({"APPROVED"} if status == "Approved" else {"CHANGES_REQUESTED"})
            ),
            default="",
        )
        if (
            not review_at
            or (
                pr.last_approval_dismissed_at
                and status != "Approved"
                and not newer_activity(review_at, pr.last_approval_dismissed_at)
            )
            or status not in {"Approved", "Changes requested", "In review"}
        ):
            return
        latest = github.node(pr_id, "PullRequest", "state headRefOid")
        if latest["state"] != "OPEN" or latest["headRefOid"] != pr.head:
            print(f"Skipping {pr_id}: PR changed during review recovery")
            return
    statuses.set_issue(issue["id"], status, review_at=review_at)


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
