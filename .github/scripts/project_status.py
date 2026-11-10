"""Update Next Steps issue cards from PR evidence without executing PR code."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from dataclasses import dataclass, field
from html.parser import HTMLParser
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

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.excluded: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag in self.excluded_tags:
            self.excluded.append(tag)
        # Preserve a boundary rather than joining text across excluded content.
        self.parts.append("\0")

    def handle_endtag(self, tag: str):
        if tag in self.excluded:
            matching = len(self.excluded) - 1 - self.excluded[::-1].index(tag)
            del self.excluded[matching:]
        self.parts.append("\0")

    def handle_data(self, data: str):
        if not self.excluded:
            self.parts.append(data)

    def handle_comment(self, data: str):
        self.parts.append("\0")


def closing_declaration_prose(body: str) -> str:
    """Exclude Markdown/HTML code and quotes before interpreting declarations."""
    lines = []
    fence_character = ""
    fence_length = 0
    quoted = False
    for line in (body or "").expandtabs(4).splitlines(keepends=True):
        if fence_character:
            if re.fullmatch(
                r" {0,3}"
                + re.escape(fence_character)
                + "{"
                + str(fence_length)
                + r",}\s*",
                line,
            ):
                fence_character = ""
            lines.append("\0\n")
            continue
        if not line.strip():
            quoted = False
            lines.append(line)
            continue
        if re.match(r" {0,3}>", line):
            quoted = True
        elif re.match(r" {0,3}(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|`{3,}|~{3,})", line):
            quoted = False
        if quoted or line.startswith("    "):
            lines.append("\0\n")
            continue
        fence = re.match(r" {0,3}(`{3,}|~{3,})", line)
        if fence and fence[1][0] == "`" and "`" in line[fence.end() :]:
            fence = None
        if fence:
            fence_character = fence[1][0]
            fence_length = len(fence[1])
            lines.append("\0\n")
            continue
        lines.append(line)

    # Code spans can span lines and use any equal-length pair of backtick runs.
    # Strip them before HTML so an inline `<pre>` example cannot hide later prose.
    body = "".join(lines)
    ticks = list(re.finditer(r"`+", body))
    parts = []
    position = 0
    index = 0
    while index < len(ticks):
        opening = ticks[index]
        prefix = body[: opening.start()]
        escaped = (len(prefix) - len(prefix.rstrip("\\"))) % 2
        closing = next(
            (
                candidate
                for candidate in range(index + 1, len(ticks))
                if len(ticks[candidate][0]) == len(opening[0])
            ),
            None,
        )
        if escaped or closing is None:
            index += 1
            continue
        parts.extend([body[position : opening.start()], "\0"])
        position = ticks[closing].end()
        index = closing + 1
    parts.append(body[position:])
    parser = ProseHTMLParser()
    parser.feed("".join(parts))
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
        issue = github.graphql(
            'query($number: Int!) { repository(owner: "JesusFilm", name: "core") { '
            "issue(number: $number) { id number state repository { nameWithOwner } } } }",
            number=number,
        )["repository"]["issue"]
        if issue:
            by_id[issue["id"]] = issue
    return list(by_id.values())


def implementation_prs(github: GitHub, issue: dict, current_pr: dict) -> list[dict]:
    """Count native links and stack declarations, excluding mere cross-references."""
    pulls = github.connection(
        issue["id"],
        "Issue",
        "closedByPullRequestsReferences",
        "id state",
        ", includeClosedPrs: true",
    )
    by_id = {pr["id"]: pr for pr in pulls}
    events = github.connection(
        issue["id"],
        "Issue",
        "timelineItems",
        "... on CrossReferencedEvent { source { ... on PullRequest { "
        "id state body repository { nameWithOwner } } } }",
        ", itemTypes: [CROSS_REFERENCED_EVENT]",
    )
    for event in events:
        source = event.get("source") or {}
        if source.get("repository", {}).get("nameWithOwner") == REPOSITORY and issue[
            "number"
        ] in closing_issue_numbers(source.get("body") or ""):
            by_id[source["id"]] = source
    by_id[current_pr["id"]] = current_pr
    return list(by_id.values())


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
            next_cursor = connection["pageInfo"]["endCursor"]
            if not next_cursor or next_cursor == cursor:
                raise RuntimeError(f"Pagination for {name} did not advance")
            cursor = next_cursor


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

    def set_issue(self, node_id: str, status: str, only_if_unset=False):
        """Write only issue cards; PRs are never project content."""
        if MANUAL_LABEL in self.labels(node_id):
            print(f"Skipping {node_id}: {MANUAL_LABEL}")
            return
        items = self.github.connection(
            node_id,
            "Issue",
            "projectItems",
            "id isArchived project { id } "
            'fieldValueByName(name: "Status") { '
            "... on ProjectV2ItemFieldSingleSelectValue { name } }",
        )
        item = next(
            (item for item in items if item["project"]["id"] == PROJECT_ID), None
        )
        if item and item["isArchived"] and status != "Done":
            print(f"Skipping archived item {node_id}")
            return
        previous = ((item or {}).get("fieldValueByName") or {}).get("name")
        if previous == status or (only_if_unset and previous):
            return
        if self.github.dry_run:
            print(f"Would set Issue {node_id}: {previous or '(unset)'} -> {status}")
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
        print(f"Issue {node_id}: {previous or '(unset)'} -> {status}")


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
            ProjectStatuses(github).set_issue(issue_id, "Triage", only_if_unset=True)
        return

    if event_name not in {"pull_request_target", "pull_request_review"}:
        return
    if event_name == "pull_request_review" and (
        action == "submitted" and event["review"]["state"].lower() == "commented"
    ):
        return
    pr_id = event["pull_request"]["node_id"]
    current = github.node(pr_id, "PullRequest", "id state headRefOid body baseRefName")
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
    linked_prs = implementation_prs(github, issue, current)
    if not eligible_issue(pr_id, issues, linked_prs, merged=merged):
        print("Skipping issue: another open or merged implementation PR is linked")
        return
    statuses = ProjectStatuses(github)
    if merged:
        statuses.set_issue(issue["id"], "Done")
        return
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
    statuses.set_issue(issue["id"], status)


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
