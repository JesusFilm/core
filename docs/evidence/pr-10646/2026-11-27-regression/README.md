# Operations timeout regression, 27 November 2026

The second upload can fail during output authorization because the Media service's nested authority request uses the generic five-second budget inside a fifteen-second output flow. A one-shot 5.5-second identity-check delay inside the authority response reproduced `{"error":"Request failed"}` at the original second-start assertion. The safe probe recorded `/internal/reads/media-jobs/accept` timing out after 5011 ms, followed by MCP's output phase returning the generic error. This establishes a reproducible boundary; it does not establish what introduced latency in the original hosted run.

The fix permits fifteen seconds only for deferred output acceptance. Other Media authority calls retain five seconds. The permanent capacity regression delays only the second upload's output check, then retains the existing generation, replacement-worker and final active-job assertions.

## Retained runs

| Run                                        | Passed | Failed | Unselected | Qualification                                       |
| ------------------------------------------ | -----: | -----: | ---------: | --------------------------------------------------- |
| Permanent regression, old implementation   |      0 |      1 |         91 | Expected red at second upload                       |
| Permanent regression, fixed implementation |      1 |      0 |         91 | All capacity assertions reached                     |
| Complete Operations baseline               |    433 |      0 |          0 | Tree `867128c37dc556732978e925abdf8f20d3262df7`     |
| Complete Video baseline                    |    323 |      0 |          0 | Same combined tree, current video parent integrated |

The regression ran on Linux with Node 24.22.3 and isolated PostgreSQL 16. Its raw JSON includes coverage for 69 files. In `apis/api-media/src/lib/mcpMediaJobs.ts`, the authority HTTP call executed 44 times, output acceptance executed 13 times, and the new output/non-output budget branch recorded hits `[6, 7]`. These are focused execution counts, not whole-project coverage percentages.

The VM's complete Operations baseline recorded statements 49.06%, branches 41.82%, functions 52.44% and lines 51.63% across its configured files. It also passed the MCP runtime suite and release-manifest process check. Full VM logs and baseline raw coverage are retained at `/data/phoebe/handoff/chat-mcp-merge-monitor-20261113/local-ci/logs/10646-867128c3-combined-qh7hZp`.

## Reproduction

Use a Linux checkout, Node 24.22.3, pnpm 10.33.4 and a disposable loopback PostgreSQL 16 server. Install locked dependencies and generate Prisma clients. On combined baseline tree `867128c37dc556732978e925abdf8f20d3262df7`, apply the test-file portion of the archived candidate patch to obtain red, then the production-file portion to obtain green. Select the test named `admits one active generation across connections and replacement workers while uploads have independent capacity` through the Operations harness. The permanent test supplies the delay itself; no diagnostic instrumentation is required.

For complete qualification use the unmodified documented commands:

```sh
VITEST_MAX_WORKERS=1 node tools/scripts/test-mcp-operations.mjs
VITEST_MAX_WORKERS=1 node tools/scripts/test-mcp-video-upload.mjs
```

Set `MCP_OPERATIONS_TEST_POSTGRES_URL` and `MCP_UPLOAD_TEST_POSTGRES_URL` to the disposable loopback server. The runners own isolated database setup and coverage validation.

## Archive and limits

[Raw red/green reports, coverage maps, logs and exact patch](regression.tar.gz). SHA-256: `085bbb0a3363ca77a3eca657b5edda4ea0e70af094c23da9ba0443ed6ed8f0f6`. [Manifest and per-file checksums](manifest.json).

The full baseline predates this narrow source fix. Complete final-candidate Operations/video qualification and Acceptance against the updated Operations parent remain pending. Native macOS cannot qualify the Linux executor lifecycle; the restricted desktop run also rejected localhost binding. No staging, provider, browser or client qualification is claimed.
