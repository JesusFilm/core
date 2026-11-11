"""Validate an unprivileged review artifact before the privileged writer runs."""

import json
import os
import subprocess
from pathlib import Path


def validate_review_event(
    event: dict, source_run: dict, current_pr: dict, review: dict
):
    if event["repository"]["full_name"] != "JesusFilm/core":
        raise ValueError("Review event is for another repository")
    if source_run["event"] != "pull_request_review":
        raise ValueError("Source run is not a PR review")
    if event["action"] not in {"submitted", "dismissed"}:
        raise ValueError("Unsupported review event action")
    pr = event["pull_request"]
    if pr["node_id"] != current_pr["node_id"]:
        raise ValueError("PR identity does not match GitHub")
    if current_pr["base"]["repo"]["full_name"] != "JesusFilm/core":
        raise ValueError("PR targets another repository")
    if (
        pr["head"]["sha"] != source_run["head_sha"]
        or pr["head"]["ref"] != source_run["head_branch"]
        or pr["head"]["repo"]["full_name"] != source_run["head_repository"]["full_name"]
    ):
        raise ValueError("Review artifact does not match its source run")
    if (
        current_pr["head"]["ref"] != source_run["head_branch"]
        or current_pr["head"]["repo"]["full_name"]
        != source_run["head_repository"]["full_name"]
    ):
        raise ValueError("Source run does not belong to this PR's branch")
    if (
        review["node_id"] != event["review"]["node_id"]
        or review["id"] != event["review"]["id"]
    ):
        raise ValueError("Review identity does not match GitHub")
    if current_pr["head"]["sha"] != source_run["head_sha"]:
        return False
    if event["action"] == "submitted" and review["state"] == "DISMISSED":
        return False
    if event["action"] == "dismissed" and review["state"] != "DISMISSED":
        raise ValueError("Review has not been dismissed")
    # Use the API's review state rather than trusting the artifact's state.
    event["review"]["state"] = review["state"]
    return True


if __name__ == "__main__":
    source_run = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())[
        "workflow_run"
    ]
    event_path = Path(os.environ["REVIEW_EVENT_PATH"])
    event = json.loads(event_path.read_text())
    number = int(event["pull_request"]["number"])
    review_number = int(event["review"]["id"])
    current_pr = json.loads(
        subprocess.check_output(
            [
                "gh",
                "api",
                f"repos/JesusFilm/core/pulls/{number}",
            ],
            text=True,
        )
    )
    review = json.loads(
        subprocess.check_output(
            [
                "gh",
                "api",
                f"repos/JesusFilm/core/pulls/{number}/reviews/{review_number}",
            ],
            text=True,
        )
    )
    apply = validate_review_event(event, source_run, current_pr, review)
    with open(os.environ["GITHUB_OUTPUT"], "a") as output:
        output.write(f"apply={'true' if apply else 'false'}\n")
    event_path.write_text(json.dumps(event))
