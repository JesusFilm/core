---
title: 'Verify infrastructure findings against prod config before escalating in /ce:review'
category: workflow-issues
date: 2026-05-18
problem_type: workflow_issue
component: development_workflow
tags:
  - ce-code-review
  - agent-orchestration
  - infrastructure
  - prod-topology
  - terraform
  - synthesis-failure
  - autoscaling
  - cache-invalidation
related_pr: 9217
related_ticket: NES-1677
---

## Context

During `/ce:review` on PR #9217 (NES-1677, backend cache invalidation in `apis/api-journeys-modern`), the review orchestrator escalated a "fix is partial in multi-replica prod" finding to **P1** and drafted a follow-up Linear ticket for a Redis-backed cache migration. The finding came out of one reviewer reading `apis/api-journeys-modern/infrastructure/locals.tf:72-74` and citing `max_capacity = 4` under autoscaling — five reviewers then "agreed" by reading the same file and arriving at the same conclusion.

Reality, after Siyang pushed back and the agent actually opened the file:

- `apis/api-journeys-modern/infrastructure/locals.tf:66` — `desired_count = var.env == "stage" ? 1 : 1`. Prod's **baseline is a single replica**.
- `apis/api-journeys-modern/infrastructure/locals.tf:72-74` — `max_capacity = 4` is only the autoscaling ceiling, gated on CPU/memory > 75%. Not the steady-state replica count.
- No `stickiness` block configured anywhere on the ALB target group.
- Siyang's manual publish/unpublish/republish testing had succeeded end-to-end (real counter-evidence, even though it ran locally).
- No production complaints citing the multi-replica fingerprint ("works in one browser, 404 in another").

The escalation was the agent's fault: the reviewer's framing ("If >1, this is a P0") was conditional, but synthesis dropped the conditional and counted the unconditional version five times.

## Guidance

When a `/ce:review` reviewer flags an infrastructure concern (replica counts, deployment topology, autoscaling, cache backends, queue workers, etc.), the orchestrator MUST verify the underlying premise against actual prod config and real-world evidence before promoting the finding to P0/P1 or drafting a follow-up ticket for substantial infra work.

Concrete rules:

1. **Distinguish `desired_count` from `max_capacity`.** When reading Terraform/k8s manifests, the baseline replica count is `desired_count` (or `replicas`). `max_capacity` / `maxReplicas` is the autoscaling ceiling — only relevant when load actually triggers scaling. A finding that conflates the two is structurally wrong.
2. **Verify which service the infra file describes.** `apis/<service>/infrastructure/locals.tf` is per-service. Confirm the file describes the service where the bug lives, not an adjacent one.
3. **Successful manual end-to-end testing IS evidence.** Don't dismiss it as "only single-process" — it confirms the user-visible scenario for the path the user actually exercised. A finding that contradicts a passing manual repro needs explicit reconciliation, not silent escalation.
4. **Pause before drafting infra follow-up tickets** (Redis backend, new services, observability stacks, queue migrations). Verify the underlying concern is real with prod evidence: logs, support tickets, repro, or load-test result. "Theoretical concern in a file I just read" is not enough.
5. **Hedging language belongs in design docs, not shipped PR copy.** PR-description caveats that hedge against unverified concerns ("fix is partial in multi-replica prod") create confusion for future readers. If the concern is unverified, leave the caveat out.

## Why This Matters

The `/ce:review` skill's cross-reviewer-agreement logic promotes findings when N reviewers cite the same issue. The intent is "if multiple independent passes flag the same thing, it's more credible." In practice, when reviewers all derive their conclusion from the same artifact (a Terraform file, a comment, a single line in a config), N reviewers agreeing is one signal counted N times — not N independent signals.

The cost of getting this wrong is asymmetric:

- **False positive cost** (this incident): an over-engineered follow-up ticket (Redis migration), confusing PR copy that future readers waste time interpreting, scope creep on a focused fix.
- **False negative cost**: a real infra bug ships. But this cost only applies when the finding was actually true — and the orchestrator's job is to verify which case it's in.

Verifying takes <5 minutes (open the file, check `desired_count` vs `max_capacity`, grep for `stickiness`, ask the user "did your manual test cover the multi-replica case?"). Not verifying creates PR cleanup work and bad institutional habits.

## When to Apply

This rule fires when ANY of the following appear in `/ce:review` findings:

- Mentions of replica count, autoscaling, deployment topology
- Recommendations to migrate to Redis, shared cache, queue backend, or other infra component
- Recommendations to add observability/metrics/dashboards as a "follow-up"
- Hedging language: "partial in prod", "fully closes only in single-replica", "tracked separately"
- A finding promoted to P0/P1 based on `infrastructure/`, `terraform/`, or `k8s/` files

At synthesis time, treat reviewer-count as a **weaker** signal than the **diversity of evidence sources** the reviewers relied on. If 5 reviewers all cite the same file, that's 1 signal. If 5 reviewers cite logs + repro + config + threat model + a comparable past incident, that's 5 signals.

## Examples

**This incident — the bad path:**

```
Finding: "fix is partial in multi-replica prod"
Severity: P1 (escalated from individual reviewer suggestions)
Evidence cited: infrastructure/locals.tf:72-74 (`max_capacity = 4`)
Action taken: drafted follow-up ticket for Redis migration,
             added multi-replica caveat to PR description and
             yoga.ts comment block
```

**The same incident — the path the rule prescribes:**

```
Finding: "fix is partial in multi-replica prod"  ← infrastructure-flavored
Pre-escalation check:
  - open infrastructure/locals.tf — confirm `desired_count`, not just `max_capacity`
  - check ALB target_group for stickiness
  - confirm manual test scenario vs claimed failure mode
Result: desired_count = 1; baseline is single-replica; manual test
        passed end-to-end; no production reports
Action: leave finding out of P0/P1; if there's residual value, capture
        as one-line note in plan doc's "deferred" section — NOT in the
        PR description, NOT as a Linear follow-up ticket
```

**General template for an infrastructure-flavored finding:**

```
Before promoting to P0/P1 or drafting an infra follow-up, ask:
1. Have I opened the actual infra config file the reviewer cited?
2. Is the user's manual testing consistent or inconsistent with the
   claimed failure mode?
3. Are there production logs / support tickets / repros that
   independently confirm the concern?
4. If yes to (3), promote. If no, the finding belongs in the
   reviewer's "residual risk" notes, not in the actionable findings
   table.
```
