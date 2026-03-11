# Engineering Experience Decision Register

Date: 2026-03-11  
Scope: `apps/journeys-admin`, `apps/journeys`, related services in `apis/*`  
Related context: [ENG-3570](https://linear.app/jesus-film-project/issue/ENG-3570/ci-cd-optimisation-cancel-in-progress-builds-on-update)

## Why this exists

The current developer experience has three linked pains:

1. **Shared stage backend creates cross-PR breakage**  
   Backend changes from one PR can overwrite behavior for other PRs that rely on stage.
2. **CI/CD speed and signal quality are uneven**  
   Slow feedback loops reduce iteration speed and confidence.
3. **Regression confidence is low**  
   Team confidence in change safety is limited without reliable full-flow validation.

## Current state observed in repo

- `main.yml` and `app-deploy.yml` already use GitHub `concurrency` with `cancel-in-progress: true`.
- `on stage` labeling appears tied to merging PR work onto shared `stage` (`.github/merge-bot.yml`), which likely triggers shared stage deploy workflows.
- `api-deploy-stage.yml` deploys affected APIs to shared stage ECS services.
- `ecs-frontend-deploy-stage.yml` deploys affected frontends to shared stage ECS services.
- `e2e-tests.yml` already supports scheduled daily E2E and Slack notification on failure.

## Options considered

### Option A: Improve CI cancellation + workflow optimization only
- **Idea:** tighten cancellation behavior and trim duplicate/slow checks.
- **Pros:** low risk, immediate cycle-time wins.
- **Cons:** does not solve shared-stage backend collision.
- **Expected impact:** medium.

### Option B: Keep shared stage, add stronger stage guardrails
- **Idea:** stage change windows, deploy ordering checks, schema compatibility gates.
- **Pros:** lower infrastructure work.
- **Cons:** still shared mutable environment; collisions remain likely.
- **Expected impact:** medium.

### Option C: PR-isolated backend environments (recommended)
- **Idea:** provision backend per PR (or per test namespace) and bind frontend preview to that backend.
- **Pros:** eliminates cross-PR backend blast radius; restores reliable AI-assisted and parallel development.
- **Cons:** highest setup effort (infra automation, secrets, lifecycle cleanup, cost controls).
- **Expected impact:** very high.

### Option D: Nightly full regression as primary safety net
- **Idea:** invest in nightly full-stack regression and triage.
- **Pros:** improves confidence and trends.
- **Cons:** detects issues late; does not improve daytime PR isolation.
- **Expected impact:** medium-high (for confidence), low (for merge-time collisions).

## Biggest win to pursue

## Decision: Prioritize Option C (PR-isolated backend environments)

This is the highest-leverage fix because it addresses the main source of engineering friction: shared stage backend coupling and PR interference. It should reduce rework, unblock parallel PR validation, and improve trust in preview environments.

### Decision rationale
- Directly removes the highest-severity failure mode (cross-PR backend overwrite).
- Enables safer frontend/backend coupling validation for GraphQL and TS typed contracts.
- Improves value of AI-assisted development by stabilizing validation targets.
- Creates a platform for cleaner regression strategy (nightly can validate `main`/`stage`, while PR checks validate isolated stacks).

## Supporting decisions

- **Decision:** keep CI cancellation optimization in scope as a parallel quick win.  
  **Rationale:** low effort, measurable throughput gain.
- **Decision:** keep nightly regression as a confidence layer, not a substitute for PR isolation.  
  **Rationale:** great for drift detection and prioritization, but not enough alone.
- **Decision:** use a default-reset model for stage recovery with opt-out label `"stage-reset-blocked"`.  
  **Rationale:** most resets should proceed quickly; only actively testing PRs should block reset.

## Measurement framework (how we prove improvement)

Track baseline for 2 weeks before rollout, then compare after each phase.

### Primary metrics
- PR lead time (first commit to merge).
- Time-to-first-actionable-signal in CI.
- Reruns per PR due to environment instability.
- Number of PRs blocked by unrelated stage/backend changes.
- Failed deploys caused by shared-stage conflicts.

### Secondary metrics
- Stage hotfix frequency.
- E2E flake rate (retry-required tests / total).
- Mean time to recover stage when broken.
- Developer-reported confidence (light weekly pulse).

### Success criteria (initial targets)
- 50% reduction in PRs blocked by unrelated backend changes.
- 30% reduction in reruns caused by environment instability.
- 20% reduction in median PR lead time for backend-coupled changes.

## Proposed rollout

### Phase 0: Baseline + instrumentation (1 week)
- Add labels/telemetry for "blocked by stage", "rerun due to env".
- Capture CI duration and cancellation stats.
- Define cost guardrails for ephemeral environments.

### Phase 1: Pilot isolated backend for one vertical (2-3 weeks)
- Start with `journeys` + `api-journeys`.
- Provision per-PR backend instance (or namespace/service copy).
- Inject backend URL into frontend preview deployment at PR scope.
- Auto-destroy on PR close/merge.

### Phase 2: Expand + harden (2-4 weeks)
- Extend to related APIs with strongest coupling.
- Add schema compatibility checks before deploy to shared targets.
- Enforce TTL cleanup and budget alerts.

### Phase 3: Align test strategy (ongoing)
- Keep fast PR checks focused on changed/critical paths.
- Run nightly full regression on stable branch target + Slack triage summary.
- Use nightly outcomes to trim redundant PR checks safely.

## Risks and mitigations

- **Infra complexity/cost growth** -> strict TTL, quota caps, auto-cleanup jobs.
- **Secret/config sprawl** -> central templated env generation.
- **Drift between isolated and stage/prod** -> shared deploy templates and parity checks.
- **Operational ownership ambiguity** -> define DRI for CI platform and environment lifecycle.

## Clarifying questions to finalize the architecture

### Environment and workflow
1. What exactly happens today when `on stage` is applied (merge, deploy, both)?
2. Is `stage` always branch-based deployment, or sometimes direct workflow dispatch?
3. Which teams rely on stage as a shared integration target daily?
4. Which apps/apis must always be deployed together?
5. Are there any hard dependencies on static stage hostnames?

### Backend isolation design
6. Do we prefer per-PR ECS services, per-PR namespace in Kubernetes, or another pattern?
7. What is acceptable environment startup time for PR validation?
8. What max concurrent PR backends should we support?
9. Which backing resources can be shared safely (DB, cache, queues), and which must be isolated?
10. Can we use seeded read-only data for most PR validation?

### GraphQL and contract safety
11. Are breaking GraphQL schema changes common between PRs?
12. Should we gate PRs with schema compatibility checks against current stage/main schemas?
13. Do frontend type generations happen in CI for each PR and fail on mismatch?
14. Do we need backward-compatibility windows for schema changes?

### CI/CD optimization
15. Which required checks are currently the slowest by median and P95 runtime?
16. Which checks are known redundant but kept for safety?
17. Where are queue bottlenecks (GitHub runners, Nx cloud, deploy slots, external services)?
18. Are cancellation semantics needed at job level in additional workflows?

### Regression strategy
19. What should nightly regression validate: `main`, `stage`, or both?
20. What is the expected SLA for triaging nightly failures?
21. Who owns nightly-failure triage rotation?
22. Which tests are "must pass nightly" vs "best effort informational"?
23. What Slack channel and severity routing should be used?

### Governance and rollout
24. Who will own platform changes (DevOps/Infra/Feature team)?
25. What budget constraints exist for ephemeral infra?
26. What timeline and milestones are expected before maintenance mode?
27. What is the rollback plan if pilot causes release friction?
28. What objective criteria decide "pilot successful, scale it"?

## Decisions log

- 2026-03-11: Prioritize PR-isolated backend environments as the highest-impact improvement.
- 2026-03-11: Treat CI cancellation/speed improvements as parallel quick wins.
- 2026-03-11: Use nightly regression as confidence and prioritization layer, not as a replacement for PR isolation.

## Next checkpoints

- Confirm answers to clarifying questions.
- Approve pilot architecture for `journeys` + `api-journeys`.
- Convert this register into implementation milestones with owners and target dates.
