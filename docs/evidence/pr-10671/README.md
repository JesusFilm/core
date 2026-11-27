# Release acceptance local qualification

The video fixture now derives the ticket number from its validated Media database namespace and passes it to the shared Auth/Journeys fixture. Both isolation guards remain active. This fixes the nested setup failure after the outer guard had admitted #10565.

## Tested revision and results

The complete twelve-suite Linux route passed on clean revision [db82f8b35](https://github.com/JesusFilm/core/commit/db82f8b35699482d5435b4488264329a5159eb2f), with immediate base `a07efa60b27c56a4861efb77fcce4bad0bee69cd`. The recorded runtime is Node 24.22.3, pnpm 10.33.4 and PostgreSQL 13.23 (Debian 13.23-1.pgdg13+1). These are local artifact results.

| Suite            | Passed | Failed | Skipped | Todo |
| ---------------- | -----: | -----: | ------: | ---: |
| reads            |    171 |      0 |       0 |    0 |
| edits            |    500 |      0 |       0 |    0 |
| structure        |    129 |      0 |       0 |    0 |
| forms            |    200 |      0 |       0 |    0 |
| appearance       |     83 |      0 |       0 |    0 |
| media            |    421 |      0 |       0 |    0 |
| image-upload     |    388 |      0 |       0 |    0 |
| video-upload     |    323 |      0 |       0 |    0 |
| image-generation |    407 |      0 |       0 |    0 |
| operations       |    433 |      0 |       0 |    0 |
| protocol         |    203 |      0 |       0 |    0 |
| admin-components |     35 |      0 |       0 |    0 |

Each suite passed its executed-test and repository-relative owning-module coverage checks. The manifest lists required modules and their statement execution counts. Raw test reports, raw coverage maps and Cobertura remain separate for every suite.

Additional checks passed:

- Independent #10554 video compatibility, 323 tests with zero failures, skips or todos, in fresh isolated databases. Its temporary databases and runtime role were removed after completion.
- Acceptance tooling, 31 tests with zero skips on Node 24.22.3, including a real 500-test saved-edit run and unavailable-database recovery. Focused coverage is 98.13% lines, 97.36% statements and 94.48% branches.
- MCP workspace head, 203 tests; actual-base workspace, 179 tests. Both have separate repository-relative coverage. The workspace reports started at `de94fb2c9`; their MCP and tooling source trees are identical to the tested final code revision. Its successor only formatted one video-fixture line.
- Focused guards accepted both supported tickets, rejected six unsafe/lookalike names and rejected mismatched Auth/Journeys ticket namespaces.
- Required lint/fix and all 40 affected type-check projects. The successful lint run used an 8 GiB Node heap after the initial default-heap attempt exhausted memory.

## Retained reports

[Complete synthetic report archive](2026-11-27-review/acceptance.tar.gz). SHA-256: `3ba1ca25f98c861fe17761a01dc256c89f328fed302889de32e4331da0c64dde`.

[Manifest, runtime versions, per-suite counts, required-module hits and per-file checksums](2026-11-27-review/manifest.json).

The archive preserves the aggregate's referenced test reports and their recorded digests. It also preserves focused tooling, saved-edit, head/base workspace and independent #10554 reports separately. All capability participants and data are local or synthetic. OAuth, MCP HTTP, Hive gateway, owning handlers and PostgreSQL execute through the existing integration boundaries. Firebase, external storage/providers, feature gates and explicit clock/fault hooks are controlled as documented by each suite.

## Reproduction

Use a Linux checkout at the tested revision, the recorded Node/pnpm versions, locked dependencies and an isolated loopback PostgreSQL server. The acceptance runner creates and removes its own randomly suffixed databases and Auth runtime roles. Set `MCP_ACCEPTANCE_POSTGRES_URL` for the local server when its defaults do not apply.

```sh
pnpm exec vitest run --config apis/api-mcp/vitest.acceptance.config.mts
pnpm exec tsx tools/scripts/mcp-acceptance.mjs local /tmp/phoebe-issue-10565/fresh-review-run
```

Use a fresh output directory for each invocation. See [the acceptance runbook](../../../apis/api-mcp/ACCEPTANCE.md) for supported focused reruns and the complete release checklist.

## Coverage service status

For incoming remote head `8913934a2`, [Codecov patch](https://github.com/JesusFilm/core/runs/140246859979) passed at 96.10% against a 63.36% target. [Codecov project](https://github.com/JesusFilm/core/runs/140246856700) passed at 77.62%, compared with actual base `a07efa6`. The archive retains that head's check snapshot. The new publication requires its own external checks; this index does not report those as passed.

## Deferred feature checks

Every stage and real-client check in the generated plan remains unexecuted and required under the original acceptance criteria and [release runbook](https://github.com/JesusFilm/core/blob/db82f8b35699482d5435b4488264329a5159eb2f/apis/api-mcp/ACCEPTANCE.md#deferred-feature-checks).

- [ ] #10583 AWS setup and deployment, actual IAM/ingress/deployment digests, and complete-registry deployed full-stack qualification.
- [ ] Normal-browser private preview, human Admin Publish, permissions and publication fences.
- [ ] Actual Claude and ChatGPT web sign-in, consent, discovery, compatibility, tools-only conversations, history, uploads, generation, expiry/renewal and conflict recovery across every canonical case.
- [ ] Live providers, multi-replica races, operational alert delivery, grant/key rotation, limits, retention and previous-digest rollback.
- [ ] Incorporate client fixes into the feature, redeploy to stage, repeat affected checks and review the full evidence before enabling the initial production cohort.

The supervising chat retains the deferred ledger on #10153 and owns feature merges. Merge, deployment and release gates remain in place.
