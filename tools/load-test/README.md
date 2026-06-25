# tools/load-test

Lightweight k6-based load tester for Journeys API endpoints. Built for NES-1581 to drive the Vercel Firewall rate-limit rule on `/api/chat` from a controllable load generator, with run parameters defined in YAML scenario files and share-friendly JSON result files written per run.

> **Run against `stage`, not production.** Production sits behind the Vercel Firewall rule this tool exists to exercise. Running against prod will trip the rule and block the source IP until the rate-limit window expires. The owner allowlist (Bypass rule) only protects one IP — if you're not the owner and not running through it, you will get blocked.

## Layout

```text
tools/load-test/
  run-chat.ts             # wrapper — takes a YAML scenario, runs k6
  scenarios/              # YAML scenarios (load profiles)
    firewall-trip.yaml
    smoke.yaml
  targets/                # k6 entry files (endpoint payload + headers)
    chat.js
  lib/scenario.js         # shared k6 runner: options, status bucketing, handleSummary
  results/                # per-run JSON output (committed as evidence; pruned manually — see retention rule below)
```

## Install dependencies

```sh
brew install k6
```

`tsx` is already a workspace dependency (used by other `tools/scripts/*.ts`). The wrapper uses the `yaml` package (`^2.9.0`) to parse scenario files, then validates each key against an allowlist (`SCENARIO_KEYS` in `run-chat.ts`) and requires scalar values.

## Run a scenario

The wrapper takes exactly one argument — the path to a YAML scenario file:

```sh
pnpm exec tsx tools/load-test/run-chat.ts tools/load-test/scenarios/smoke.yaml
pnpm exec tsx tools/load-test/run-chat.ts tools/load-test/scenarios/firewall-trip.yaml
```

Calling it with no args prints the available scenarios.

## Scenario file format

YAML keys map 1:1 to env vars consumed by `lib/scenario.js`. Only `url` and one of `rps` / `rpm` are required.

```yaml
# tools/load-test/scenarios/<name>.yaml
url: https://your-stage.nextstep.is/api/chat # required: full target URL

# Required: exactly one of rps OR rpm (mutually exclusive)
rps: 2 # sustained requests per second
# rpm: 200            # sustained requests per minute

# Optional
duration: 30s # k6 duration string (30s, 2m, 1h). Default: 30s.
vus: 5 # virtual users (concurrency). Default: auto from rate.
max_vus: 20 # ceiling on VUs k6 may spin up. Default: max(vus*2, 20).
max_iterations: 100 # hard cap on total requests. Stops early if hit.
run_id: my-run-tag # tag for User-Agent + result filename. Default: <scenario-name>-<timestamp>.
message: 'load probe' # target-specific (chat): content of the user message.
```

### Bundled scenarios

| File                                | Profile                        | Purpose                                                                               |
| ----------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| `scenarios/smoke.yaml`              | 1 RPS, 5s, 1 VU (≈5 reqs)      | Sanity-check the tool. Below any rate-limit threshold.                                |
| `scenarios/sustained-single.yaml`   | 1 RPS, 60s, 1 VU (≈60 reqs)    | One sustained session. Steady single-client perf check.                               |
| `scenarios/concurrent-clients.yaml` | 5 RPS, 30s, 5 VUs (≈150 reqs)  | Five concurrent sessions sharing this machine's IP. Tests concurrency & trace splits. |
| `scenarios/firewall-trip.yaml`      | 200 RPM, 2m, 5 VUs (≈400 reqs) | Drive the Vercel Firewall rule on `/api/chat`. Expect 429s.                           |

## Identity model

`/api/chat` does **not** authenticate today — no token, cookie, or header is checked. The Vercel Firewall rule (NES-1581) sits in front of the endpoint and keys on **source IP**, not on any application identity.

Implications for this tool, all running from a single machine:

- **`sessionId`** is set to `<runId>-vu-<__VU>` — stable across a VU's iterations, distinct between VUs. This splits Langfuse traces by VU so you can inspect them separately. It is **not** seen by the firewall and does not change rate-limit behaviour.
- **All VUs share one source IP** (yours). Adding more VUs cannot simulate "more IPs" against the firewall. Use it for concurrency, queuing, and per-conversation trace shape only.
- **True multi-IP load** requires distributed runners — GitHub Actions matrix jobs, multiple machines, or `k6 cloud`. Out of scope for this tool today.
- **Firebase / per-uid limits** are not in this code path. The per-uid gate (NES-1580 → NES-1584) lives on `api-journeys`, not on `apps/journeys`'s `/api/chat`. Add a token-sending scenario only when that gate lands.

## Output

Every run produces two artefacts:

1. **Stdout summary** — human-readable per-status breakdown + categorical buckets + latency p50/p95/p99/max.
2. **JSON result file** — written to `tools/load-test/results/<run_id>.json` (committed as evidence; see retention rule below). Filename derives from `run_id` in the YAML, or `<scenario-name>-<iso-timestamp>` if not set.

The JSON shape is stable and report-friendly:

```json
{
  "scenario": "chat",
  "config": {
    "scenario": "chat",
    "runId": "firewall-trip-20260520T103045",
    "url": "https://your-stage.nextstep.is/api/chat",
    "method": "POST",
    "rate": 200,
    "timeUnit": "1m",
    "vus": 5,
    "maxVus": 20,
    "duration": "2m",
    "maxIterations": null,
    "startedAt": "2026-05-20T10:30:45.123Z",
    "finishedAt": "2026-05-20T10:32:45.876Z",
    "durationMs": 120753
  },
  "totals": {
    "sent": 400,
    "by_status": { "200": 290, "401": 2, "429": 105, "error": 3 },
    "buckets": {
      "success_2xx": 290,
      "rate_limited_429": 105,
      "client_errors_4xx_excluding_429": 2,
      "server_errors_5xx": 0,
      "network_errors": 3,
      "unexpected": 0
    }
  },
  "latency_ms": { "p50": 420, "p95": 1820, "p99": 2310, "max": 2987, "avg": 580 }
}
```

`by_status` gives the exact code distribution (only non-zero codes appear), and `buckets` gives the categorical roll-up. Anything outside the tracked code list (see `TRACKED_CODES` in `lib/scenario.js`) lands in `by_status.other` with a `console.warn` during the run. 429s aren't failures here — once the firewall rule is past Log mode, a non-zero 429 count is the success signal.

### Result file retention

Result files are committed to git as evidence (see initial verification runs under `results/`). To keep the history readable, **prune to the last 2 files per scenario** before pushing — the most recent one as the current baseline, the one before it for direct comparison.

When a run produces something genuinely worth preserving beyond that (a one-off configuration like the firewall rule in Challenge/Deny that's no longer reproducible on demand), rename it descriptively so the retention rule won't sweep it up:

```text
results/sustained-single-20260519T225718.json
  → results/sustained-single-challenge-deny-baseline.json
```

Prune older timestamped files manually, e.g.:

```sh
# Show what would be deleted (keep newest 2 per scenario prefix)
for prefix in smoke sustained-single concurrent-clients firewall-trip; do
  ls -t tools/load-test/results/${prefix}-*.json 2>/dev/null | tail -n +3
done

# Then `rm` them once you're happy with the list.
```

## Add a new scenario (same target)

1. Copy any `scenarios/*.yaml` to `scenarios/<your-name>.yaml`.
2. Edit the values.
3. `pnpm exec tsx tools/load-test/run-chat.ts tools/load-test/scenarios/<your-name>.yaml`.

No code changes. The result file picks up the new name automatically.

YAML is parsed by the `yaml` package — full YAML 1.2 support, so lists, nesting, anchors, and multi-line strings all work syntactically. The wrapper still validates against an allowlist of keys (`SCENARIO_KEYS` in `run-chat.ts`) and requires each value to be a scalar — if you need a structured value, add the key to the allowlist and extend the env mapping in the wrapper.

## Add a new target (different endpoint)

1. Copy `targets/chat.js` to `targets/<name>.js`.
2. Change `buildScenario({ name: '<name>' })` and rewrite `buildRequest` to return the request shape (`url`, `method`, `headers`, `body`). Any field is optional; missing values fall back to the env `URL`, `POST`, and JSON content type.
3. Add a wrapper script (`run-<name>.ts`) modelled on `run-chat.ts`, swapping the `targets/...js` path (the `TARGET_PATH` constant near the top). Or invoke k6 directly:
   ```sh
   k6 run tools/load-test/targets/<name>.js --env URL=... --env RPS=... --env DURATION=...
   ```

The shared runner (`lib/scenario.js`) handles k6 options, VU/rate wiring, status bucketing, and the result file.
