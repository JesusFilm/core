#!/usr/bin/env python3
"""Project updates from PR events. Uses trusted default-branch code only."""

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path


STATE_FIELD = "Phoebe board automation"
OWNERS = {"phoebe-siyang-vm", "phoebe-siyang-local"}


class GitHub:
    def call(self, *args, payload=None):
        command = ["gh", *args]
        if payload is not None:
            command += ["--input", "-"]
        result = subprocess.run(
            command, input=json.dumps(payload) if payload is not None else None,
            text=True, capture_output=True, check=True, timeout=120,
        )
        return json.loads(result.stdout) if result.stdout.strip() else None

    def query(self, query, **variables):
        result = self.call("api", "graphql", payload={"query": query, "variables": variables})
        if result.get("errors"):
            raise RuntimeError(json.dumps(result["errors"]))
        return result["data"]


def owner(row):
    matches = {label["name"] for label in row.get("labels", [])} & OWNERS
    if len(matches) > 1:
        raise ValueError(f"Conflicting Phoebe ownership on #{row['number']}")
    return next(iter(matches), None)


def pr_status(pr, default_branch):
    if pr["state"] == "MERGED":
        return "Done" if pr["baseRefName"] == default_branch else "In review"
    if pr["state"] == "CLOSED":
        return "Needs Human"
    if any(label["name"] == "phoebe:quarantined" for label in pr.get("labels", [])):
        return "Needs Human"
    if pr.get("isDraft"):
        return "In progress"
    if pr.get("feedback", pr.get("reviewDecision") == "CHANGES_REQUESTED"):
        return "Changes requested"
    if pr.get("reviewDecision") == "APPROVED":
        return "Approved"
    return "In review"


def issue_status(prs, default_branch, gate=None):
    states = [pr_status(pr, default_branch) for pr in prs]
    if not states:
        raise ValueError("Cannot infer issue progress without a required PR")
    if all(state == "Done" for state in states):
        return "Approved" if gate and gate.get("verified") is not True else "Done"
    for state in ["Needs Human", "Changes requested", "In progress", "In review", "Approved"]:
        if state in states:
            return state
    raise ValueError("Unknown aggregate state")


def issue_links(pr, policy):
    explicit = policy.get("links", {}).get(str(pr["number"]))
    if explicit is not None:
        return explicit
    # A stacked PR's native closing references can be empty. Require a complete
    # closing-reference line; ordinary mentions/source requirements are not links.
    lines = re.findall(
        r"(?im)^\s*(?:closes|fixes|resolves)\s+#([1-9][0-9]*)\s*[.]?\s*$",
        pr.get("body") or "",
    )
    return sorted(set(map(int, lines)) | {i["number"] for i in pr.get("closingIssuesReferences", [])})


def feedback(gh, repo, number, review_decision=None):
    pages = gh.call("api", "--paginate", "--slurp", f"repos/{repo}/issues/{number}/comments?per_page=100")
    marks = [match[1] for page in pages for comment in page
             if comment.get("user", {}).get("login") == "siyang-bot"
             for match in [re.search(r"phoebe-reviews-handled: latest=(\S+?) -->", comment.get("body") or "")]
             if match]
    watermark = max(marks, default="")
    org, name = repo.split("/")
    query = """query($owner:String!,$repo:String!,$n:Int!,$cursor:String){repository(owner:$owner,name:$repo){pullRequest(number:$n){author{login} reviewThreads(first:100,after:$cursor){pageInfo{hasNextPage endCursor} nodes{id isResolved isOutdated comments(first:100){pageInfo{hasNextPage endCursor} nodes{author{login} createdAt pullRequestReview{databaseId}}}}}}}}"""
    cursor = None
    inline_reviews = set()
    while True:
        pr = gh.query(query, owner=org, repo=name, n=number, cursor=cursor)["repository"]["pullRequest"]
        skip = {"siyang-bot", (pr["author"] or {}).get("login")}
        for thread in pr["reviewThreads"]["nodes"]:
            comments = thread["comments"]
            while True:
                for comment in comments["nodes"]:
                    review = comment.get("pullRequestReview") or {}
                    if review.get("databaseId") is not None:
                        inline_reviews.add(review["databaseId"])
                    if not thread["isResolved"] and not thread["isOutdated"] and (comment["author"] or {}).get("login") not in skip and comment["createdAt"] > watermark:
                        return True
                if not comments["pageInfo"]["hasNextPage"]:
                    break
                more = """query($id:ID!,$cursor:String){node(id:$id){...on PullRequestReviewThread{comments(first:100,after:$cursor){pageInfo{hasNextPage endCursor} nodes{author{login} createdAt pullRequestReview{databaseId}}}}}}"""
                comments = gh.query(more, id=thread["id"], cursor=comments["pageInfo"]["endCursor"])["node"]["comments"]
        page = pr["reviewThreads"]["pageInfo"]
        if not page["hasNextPage"]:
            break
        cursor = page["endCursor"]
    if review_decision != "CHANGES_REQUESTED":
        return False
    query = """query($owner:String!,$repo:String!,$n:Int!,$cursor:String){repository(owner:$owner,name:$repo){pullRequest(number:$n){latestOpinionatedReviews(first:100,after:$cursor){pageInfo{hasNextPage endCursor} nodes{databaseId state author{login}}}}}}"""
    cursor = None
    while True:
        reviews = gh.query(query, owner=org, repo=name, n=number, cursor=cursor)["repository"]["pullRequest"]["latestOpinionatedReviews"]
        if any(review["state"] == "CHANGES_REQUESTED" and (review["author"] or {}).get("login") not in skip and review["databaseId"] not in inline_reviews for review in reviews["nodes"]):
            return True
        if not reviews["pageInfo"]["hasNextPage"]:
            return False
        cursor = reviews["pageInfo"]["endCursor"]


def snapshot(gh, policy):
    query = """query($org:String!,$number:Int!,$cursor:String){organization(login:$org){projectV2(number:$number){id fields(first:100){nodes{...on ProjectV2Field{id name} ...on ProjectV2SingleSelectField{id name options{id name}}}} items(first:100,after:$cursor){pageInfo{hasNextPage endCursor} nodes{id content{...on Issue{number repository{nameWithOwner}} ...on PullRequest{number repository{nameWithOwner}}} fieldValues(first:100){nodes{...on ProjectV2ItemFieldSingleSelectValue{name field{...on ProjectV2SingleSelectField{name}}} ...on ProjectV2ItemFieldTextValue{text field{...on ProjectV2Field{name}}}}}}}}}}"""
    cursor, items = None, {}
    while True:
        project = gh.query(query, org=policy["organization"], number=policy["project"], cursor=cursor)["organization"]["projectV2"]
        if project is None:
            raise ValueError("Project is unavailable; check organization Projects access")
        for item in project["items"]["nodes"]:
            content = item.get("content") or {}
            if content.get("repository", {}).get("nameWithOwner") == policy["repo"]:
                items[content["number"]] = item
        page = project["items"]["pageInfo"]
        if not page["hasNextPage"]:
            return project, items
        cursor = page["endCursor"]


def field_values(item):
    return {value["field"]["name"]: value.get("text", value.get("name"))
            for value in item.get("fieldValues", {}).get("nodes", []) if value.get("field")}


def activity_key(prs, gate=None):
    fields = ["number", "headRefOid", "baseRefName", "state", "isDraft", "reviewDecision", "updatedAt"]
    evidence = [[pr.get(field) for field in fields] + [bool(pr.get("feedback"))]
                for pr in sorted(prs, key=lambda pr: pr["number"])]
    return hashlib.sha256(json.dumps([evidence, gate], sort_keys=True).encode()).hexdigest()


def resolve_status(have, proposed, state, release=False, fingerprint=None):
    """Keep manual board moves until explicitly released, across Actions runs."""
    state = dict(state)
    if "until_activity" in state and state["until_activity"] != fingerprint:
        state.pop("manual", None)
        state.pop("until_activity", None)
    if state.pop("pending", None) == have:
        state["last"] = have
    if release:
        state.pop("manual", None)
        state.pop("until_activity", None)
    elif "last" in state and have != state["last"]:
        state["manual"] = have
    elif "last" not in state and have in {"QA", "Needs Human", "Done"} and have != proposed:
        state["manual"] = have
    want = state.get("manual", proposed)
    state["last"] = want
    return want, state


def collect(gh, policy):
    rows = {}
    for label in sorted(OWNERS):
        pages = gh.call("api", "--paginate", "--slurp", f"repos/{policy['repo']}/issues?state=all&labels={label}&per_page=100")
        rows.update({row["number"]: row for page in pages for row in page})
    pulls = {}
    fields = "number,id,body,state,isDraft,headRefOid,headRefName,baseRefName,updatedAt,labels,reviewDecision,closingIssuesReferences"
    for number, row in rows.items():
        if "pull_request" not in row or not owner(row):
            continue
        pr = gh.call("pr", "view", str(number), "--repo", policy["repo"], "--json", fields)
        if not owner(pr):
            continue
        if pr["state"] == "OPEN":
            pr["feedback"] = feedback(gh, policy["repo"], number, pr.get("reviewDecision"))
        pulls[number] = pr
    return rows, pulls


def update_board(gh, policy, apply=False, release=None):
    rows, pulls = collect(gh, policy)
    project, items = snapshot(gh, policy)
    fields = {f.get("name"): f for f in project["fields"]["nodes"] if f.get("id")}
    status_field = fields["Status"]
    options = {option["name"]: option["id"] for option in status_field["options"]}
    state_field = fields.get(STATE_FIELD)
    if apply and not state_field:
        result = gh.query("""mutation($p:ID!,$name:String!){createProjectV2Field(input:{projectId:$p,dataType:TEXT,name:$name}){projectV2Field{...on ProjectV2Field{id name}}}}""", p=project["id"], name=STATE_FIELD)
        state_field = result["createProjectV2Field"]["projectV2Field"]
    links = {n: issue_links(pr, policy) for n, pr in pulls.items()}
    wants = {n: pr_status(pr, policy["default_branch"]) for n, pr in pulls.items()}
    fingerprints = {n: activity_key([pr]) for n, pr in pulls.items()}
    # A missing, de-authorized or excluded required PR cannot imply delivery.
    required_links = {int(n): targets for n, targets in policy.get("links", {}).items()}
    required_links.update(links)
    for n, row in rows.items():
        if "pull_request" in row or not owner(row):
            continue
        if n in policy.get("bookkeeping_done", []):
            continue
        required = [pr for pr, issues in required_links.items() if n in issues]
        if not required or any(pr not in pulls for pr in required):
            continue
        wants[n] = issue_status([pulls[pr] for pr in required], policy["default_branch"], policy.get("gates", {}).get(str(n)))
        fingerprints[n] = activity_key([pulls[pr] for pr in required], policy.get("gates", {}).get(str(n)))
    changes = []
    for number, proposed in wants.items():
        item = items.get(number)
        if not item:
            if not apply:
                print(f"#{number}: add project card -> {proposed}")
                continue
            node = pulls[number]["id"] if number in pulls else rows[number]["node_id"]
            result = gh.query("""mutation($p:ID!,$c:ID!){addProjectV2ItemById(input:{projectId:$p,contentId:$c}){item{id}}}""", p=project["id"], c=node)
            item = {"id": result["addProjectV2ItemById"]["item"]["id"]}
        # Re-read each item immediately before writing, including its durable
        # state. A human move during the API scan takes precedence.
        if apply:
            item = gh.query("""query($id:ID!){node(id:$id){...on ProjectV2Item{id fieldValues(first:100){nodes{...on ProjectV2ItemFieldSingleSelectValue{name field{...on ProjectV2SingleSelectField{name}}} ...on ProjectV2ItemFieldTextValue{text field{...on ProjectV2Field{name}}}}}}}}""", id=item["id"])["node"]
        values = field_values(item)
        state = json.loads(values.get(STATE_FIELD) or "{}")
        if not state and str(number) in policy.get("manual_overrides", {}):
            state["manual"] = policy["manual_overrides"][str(number)]
            state["until_activity"] = policy.get("manual_override_guards", {}).get(str(number), fingerprints[number])
        have = values.get("Status")
        want, state = resolve_status(have, proposed, state, number in (release or set()), fingerprints[number])
        print(f"#{number}: {have} -> {want}; PR evidence: {proposed}")
        if want is None:
            continue
        if want not in options:
            raise ValueError(f"Missing project Status option {want!r}")
        # Persist intent first. If the status write fails, the next event retries
        # rather than misidentifying our partial write as a human override.
        if apply and have != want:
            state["last"] = have
            state["pending"] = want
            gh.query("""mutation($p:ID!,$i:ID!,$f:ID!,$text:String!){updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,value:{text:$text}}){projectV2Item{id}}}""", p=project["id"], i=item["id"], f=state_field["id"], text=json.dumps(state, sort_keys=True))
        if have != want:
            if apply:
                gh.query("""mutation($p:ID!,$i:ID!,$f:ID!,$option:String!){updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,value:{singleSelectOptionId:$option}}){projectV2Item{id}}}""", p=project["id"], i=item["id"], f=status_field["id"], option=options[want])
            changes.append(number)
        if apply and json.dumps(state, sort_keys=True) != values.get(STATE_FIELD):
            state.update(last=want)
            state.pop("pending", None)
            gh.query("""mutation($p:ID!,$i:ID!,$f:ID!,$text:String!){updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,value:{text:$text}}){projectV2Item{id}}}""", p=project["id"], i=item["id"], f=state_field["id"], text=json.dumps(state, sort_keys=True))
    print(json.dumps({"apply": apply, "changed": changes}))
    return changes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--policy", type=Path, default=Path(__file__).parents[1] / "phoebe-board-policy.json")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--release", type=int, action="append", default=[])
    args = parser.parse_args()
    update_board(GitHub(), json.loads(args.policy.read_text()), args.apply, set(args.release))


if __name__ == "__main__":
    main()
