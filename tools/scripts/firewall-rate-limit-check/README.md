# firewall-rate-limit-check

Scripts behind [`.github/workflows/firewall-rate-limit-check.yml`](../../../.github/workflows/firewall-rate-limit-check.yml) (NES-1581 / PR #9222).

Verifies the Vercel Firewall rule on paths starting with `/api/chat` (configured in Vercel as `Path Starts With /api/chat`) actually fires under load — without putting the owner's home IP at risk. Runs from GitHub-Actions-owned IPs. **Not a load test**; a detection check paired with the `Log → Challenge → Deny` rollout in NES-1581.

## Scripts

Each is invoked from the workflow via `pnpm -s exec tsx tools/scripts/firewall-rate-limit-check/<script>.ts`. Configuration comes from env vars set in the workflow.

| Script        | What it does                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `prepare.ts`  | Maps `target_env` → host, validates `probe_count` / `probe_rps`, computes sentinel duration, writes both to `GITHUB_OUTPUT`.                  |
| `probe.ts`    | Loops `probe_count` POSTs to `/api/chat` at `probe_rps`, collects status codes into an array, tallies buckets, writes a markdown summary.     |
| `sentinel.ts` | Loops GETs to `sentinel_path` at ~1 req/sec for `duration_seconds`, collects status + latency, computes p50 / p95, writes a markdown summary. |

## Pass / fail

**Probe** — never fails on 429 (that's the success signal post-Log mode). Fails when network errors > 10% of total, or 5xx rate > 50%.

**Sentinel** — fails on any non-2xx (legit traffic is being affected) or p95 latency ≥ 3.0s. p95 is over successful requests only so errored rows can't pull it artificially low.

## Dependencies

Node 22 built-ins only — `fetch`, `AbortSignal.timeout`, `performance.now()`, `node:fs/promises`. No npm packages.
