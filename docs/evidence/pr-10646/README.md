# PR 10646 qualification evidence

[Download the evidence archive](qualification.tar.gz). It contains complete command logs, test results and raw coverage reports. The archive SHA-256 is `7538eb213790cb8fa31a05dcac4898242c5be8d1d8515c709c878043313af655`.

The tested source is [7cfb34c8896082ee72ba748e9d69880ff95d4833](https://github.com/JesusFilm/core/commit/7cfb34c8896082ee72ba748e9d69880ff95d4833), with immediate parent [4888710407feab891daecf37800038d258712b95](https://github.com/JesusFilm/core/commit/4888710407feab891daecf37800038d258712b95) integrated. This evidence commit adds no executable changes.

| Check              | Passed | Failed | Skipped | Report source                                |
| ------------------ | -----: | -----: | ------: | -------------------------------------------- |
| Video              |    309 |      0 |       0 | Complete hosted run on an identical Git tree |
| Operations         |    433 |      0 |       0 | Fresh exact-head local run                   |
| MCP workspace      |    179 |      0 |       0 | Fresh exact-head local run                   |
| CLI process checks |      4 |      0 |       0 | Separate local processes, outside coverage   |

Local runs used Node 24.22.3 and isolated PostgreSQL 16.16. Firebase identity, storage and external providers were controlled. OAuth, grants, MCP HTTP, gateway, owning services and PostgreSQL were real.

The original local logs survive, but their raw video and operations reports were lost. The archive labels original logs separately from replacement reports. Operations was rerun with its standard runner. Video uses the complete [hosted job](https://github.com/JesusFilm/core/actions/runs/45793079642/job/139816740312) and [downloadable artifact](https://github.com/JesusFilm/core/actions/runs/45793079642/artifacts/15106285972). Its checkout `246781fa66ad18579bc0ec9ff019388be3f3161c` and the pinned head both have Git tree `c4b19ffccfa4833ecd1aafdf029eb66c6b00a565`. The entire source, tests and configuration match. A redundant local video attempt was stopped after this proof was obtained; its partial log is included and supplies no qualification claim.

Both exact 1,000,000,000-byte video ingress cases passed, along with staging-lock, status and permission-resume cases. The operations report covers 118/120 changed executable lines against the immediate parent across ten production modules. The remaining lines are `tools/scripts/mcp-operations.mjs:104` and `tools/scripts/mcp-release.mjs:39`. Four separate CLI process checks exercised both entry calls outside instrumentation. Required owning/shared modules have execution hits, and Cobertura filenames are repository-relative.

Extract and verify the bundle in an empty directory:

```sh
tar -xzf qualification.tar.gz
sha256sum -c SHA256SUMS
```

| Files inside the archive                                                                              | Purpose                                                                           |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `run-manifest.json`, `video-tree-proof.json`                                                          | Commit pair, runtime, commands, controlled participants and hosted checkout proof |
| `verified-results.json`                                                                               | Every test name/status, execution hits and per-module changed-line calculation    |
| `operations-test-results.json`, `operations-coverage-final.json`, `operations-cobertura-coverage.xml` | Complete new operations results and coverage                                      |
| `video-test-results.json`, `video-coverage-final.json`, `video-cobertura-coverage.xml`                | Complete hosted video results and coverage for the identical source tree          |
| `rerun-operations.log`, `rerun-video.log`, `rerun-mcp.log`                                            | Complete command output for those reports                                         |
| `cli-smokes.json`, `cli-smokes.mjs`, `cli-smokes.log`                                                 | Separate CLI script, results and output                                           |
| `original-*.log`, `original-coverage-summary.json`                                                    | Retained original logs, earlier lint/type checks and changed-line summary         |
| `cancelled-duplicate-video.log`                                                                       | Partial duplicate attempt, not counted as qualification                           |
| `validate-evidence.mjs`, `SHA256SUMS`                                                                 | Report validation and file integrity                                              |

The [hosted operations job](https://github.com/JesusFilm/core/actions/runs/45793079765/job/139816740580) separately failed five cases, with 428 passed. Its artifact contains test results only. The local rerun passed those cases, but no cause or causal fix for the hosted failures is claimed. At evidence capture, Codecov patch passed and project failed. This bundle does not clear those external gates or establish deployed readiness.

The earlier video failure thread remains open for reviewer assessment. AWS, real ingress, live providers, deployed rollback, browser and real-client checks remain in the PR's deferred feature checklist.
