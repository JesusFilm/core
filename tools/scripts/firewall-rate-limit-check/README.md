# firewall-rate-limit-check

TypeScript helpers for the manual GitHub Actions workflow
[`.github/workflows/firewall-rate-limit-check.yml`](../../../.github/workflows/firewall-rate-limit-check.yml)
(NES-1581 / [PR #9222](https://github.com/JesusFilm/core/pull/9222)).

The workflow verifies that the Vercel Firewall rule on `/api/chat*` actually
fires under load — without putting the owner's home IP at risk. It runs from
GitHub-Actions-owned IPs only. This is **not** a load test; it is a detection
check paired with the `Log → Challenge → Deny` rollout in NES-1581.

## When to run

Trigger manually (`workflow_dispatch`) after promoting the firewall rule between
stages:

- **Log mode:** probe should complete with all 2xx; firewall logs server-side
  show rule hits.
- **Challenge / Deny:** the probe is expected to see 429s once the configured
  threshold is exceeded. 429 is the **success signal** post-Log.

## Scripts

All scripts read configuration from environment variables and are invoked by
the workflow via `pnpm -s exec tsx tools/scripts/firewall-rate-limit-check/<script>.ts`.

| Script        | Purpose                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `prepare.ts`  | Resolves the target host from `target_env`, validates `probe_count` / `probe_rps`, computes the sentinel duration. Emits to `GITHUB_OUTPUT`. |
| `probe.ts`    | Sends `probe_count` POSTs to `https://<host>/api/chat` at `probe_rps` rps. Tallies 2xx / 429 / other-4xx / 5xx / network-error counts.       |
| `sentinel.ts` | GETs `https://<host><sentinel_path>` at ~1 req/sec for the computed duration. Measures p50 / p95 latency over successful requests.           |
| `types.ts`    | Shared types (`RequestOutcome`, `ProbeSummary`, `SentinelSummary`).                                                                          |

## Pass / fail

### Probe (`probe.ts`)

- **Never** fails on 429 — that's the success signal once past Log mode.
- Fails when **network/error rate > 10%** of total (broken plumbing).
- Fails when **5xx rate > 50%** of total (origin under stress).

### Sentinel (`sentinel.ts`)

- Fails if any response is **not 2xx** (legit traffic is being affected).
- Fails if **p95 latency >= 3.0s** (legit traffic is being slowed).
- p95 is computed over successful requests only so errored rows can't pull it
  artificially low.

## Dependencies

Node 22 built-ins only — `fetch`, `AbortSignal.timeout`, `performance.now()`,
`node:fs/promises`. No additional npm packages.
