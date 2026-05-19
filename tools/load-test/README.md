# tools/load-test

Lightweight k6-based load tester for Journeys API endpoints. Built for NES-1581 to drive the Vercel Firewall rate-limit rule on `/api/chat` from a controllable load generator, with run parameters defined in YAML scenario files and share-friendly JSON result files written per run.

> **Run against `stage`, not production.** Production sits behind the Vercel Firewall rule this tool exists to exercise. Running against prod will trip the rule and block the source IP until the rate-limit window expires. The owner allowlist (Bypass rule) only protects one IP — if you're not the owner and not running through it, you will get blocked.

## Layout

```
tools/load-test/
  run-chat.ts             # wrapper — takes a YAML scenario, runs k6
  scenarios/              # YAML scenarios (load profiles)
    firewall-trip.yaml
    smoke.yaml
  targets/                # k6 entry files (endpoint payload + headers)
    chat.js
  lib/scenario.js         # shared k6 runner: options, status bucketing, handleSummary
  results/                # per-run JSON output (gitignored)
```

## Install dependencies

```sh
brew install k6
```

`tsx` is already a workspace dependency (used by other `tools/scripts/*.ts`). No YAML library is added — the scenario parser is built in (flat `key: value` only).

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
url: https://your-stage.nextstep.is/api/chat   # required: full target URL

# Required: exactly one of rps OR rpm (mutually exclusive)
rps: 2                # sustained requests per second
# rpm: 200            # sustained requests per minute

# Optional
duration: 30s         # k6 duration string (30s, 2m, 1h). Default: 30s.
vus: 5                # virtual users (concurrency). Default: auto from rate.
max_vus: 20           # ceiling on VUs k6 may spin up. Default: max(vus*2, 20).
max_iterations: 100   # hard cap on total requests. Stops early if hit.
run_id: my-run-tag    # tag for User-Agent + result filename. Default: <scenario-name>-<timestamp>.
message: "load probe" # target-specific (chat): content of the user message.
```

### Bundled scenarios

| File                          | Profile                              | Purpose                                                       |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `scenarios/smoke.yaml`        | 1 RPS, 5s, 1 VU (≈5 reqs)            | Sanity-check the tool. Below any rate-limit threshold.        |
| `scenarios/firewall-trip.yaml`| 200 RPM, 2m, 5 VUs (≈400 reqs)       | Drive the Vercel Firewall rule on `/api/chat`. Expect 429s.   |

## Output

Every run produces two artefacts:

1. **Stdout summary** — human-readable totals (2xx / 429 / other 4xx / 5xx / errors) + latency p50/p95/p99/max.
2. **JSON result file** — written to `tools/load-test/results/<run_id>.json` (gitignored). Filename derives from `run_id` in the YAML, or `<scenario-name>-<iso-timestamp>` if not set.

The JSON shape is stable and report-friendly:

```json
{
  "scenario": "chat",
  "config": {
    "scenario": "chat",
    "runId": "firewall-trip-20260520T103045",
    "url": "https://your-stage.nextstep.is/api/chat",
    "rate": 200, "timeUnit": "1m",
    "vus": 5, "maxVus": 20,
    "duration": "2m", "maxIterations": null,
    "startedAt": "2026-05-20T10:30:45.000Z",
    "finishedAt": "2026-05-20T10:32:46.000Z"
  },
  "totals": {
    "sent": 400,
    "status_2xx": 290, "status_429": 105,
    "status_4xx_other": 2, "status_5xx": 0, "errors": 3
  },
  "latency_ms": { "p50": 420, "p95": 1820, "p99": 2310, "max": 2987, "avg": 580 }
}
```

Share by attaching the file or pasting the `totals` + `latency_ms` blocks. 429s aren't failures here — once the firewall rule is past Log mode, a non-zero 429 count is the success signal.

## Add a new scenario (same target)

1. Copy any `scenarios/*.yaml` to `scenarios/<your-name>.yaml`.
2. Edit the values.
3. `pnpm exec tsx tools/load-test/run-chat.ts tools/load-test/scenarios/<your-name>.yaml`.

No code changes. The result file picks up the new name automatically.

The YAML parser is intentionally minimal — flat `key: scalar` only (with comments). If you need lists, nesting, or multi-line strings, swap to a real YAML library (`yaml` from npm) in `run-chat.ts`.

## Add a new target (different endpoint)

1. Copy `targets/chat.js` to `targets/<name>.js`.
2. Change `buildScenario({ name: '<name>' })` and rewrite `buildRequest` to return the request shape (`url`, `method`, `headers`, `body`). Any field is optional; missing values fall back to the env `URL`, `POST`, and JSON content type.
3. Add a wrapper script (`run-<name>.ts`) modelled on `run-chat.ts`, swapping the `targets/...js` path (the `TARGET_PATH` constant near the top). Or invoke k6 directly:
   ```sh
   k6 run tools/load-test/targets/<name>.js --env URL=... --env RPS=... --env DURATION=...
   ```

The shared runner (`lib/scenario.js`) handles k6 options, VU/rate wiring, status bucketing, and the result file.
