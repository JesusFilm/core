---
title: Simplify JF Proxy Routing - Plan
type: fix
date: 2026-07-23
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
---

# Simplify JF Proxy Routing - Plan

## Goal Capsule

- **Objective:** Route all claimed `/watch*` traffic to the Watch Proxy Destination without an Experimental Cookie gate, retain Resources routing for `/journeys*`, the claimed `/resources` forms, and other worker-owned proxy paths, and deploy the user-specified Watch hostname.
- **Authority:** The user's routing and destination directives override the existing cookie-gated behavior and environment-specific Watch hostnames.
- **Execution profile:** Standard, bounded Cloudflare Worker behavior and deployment-configuration change.
- **Stop conditions:** Stop if the new Watch hostname is unreachable, Wrangler rejects either deployed environment, or the route change breaks legacy redirects, App Association Files, header forwarding, or Error Fallback behavior.
- **Tail ownership:** Ship through the repository's pull-request and `main` deployment workflow; do not deploy the Worker out of band.

---

## Product Contract

### Summary

JF Proxy will select its Proxy Destination from the claimed path rather than the Experimental Cookie, with a single Watch destination configured for stage and production.

### Problem Frame

The current Worker sends `/watch*` to Watch only when the request carries an Experimental Cookie, otherwise falling back to Resources.
That rollout gate is no longer the intended routing contract, and the deployed Watch hostname has changed.

### Requirements

#### Path routing

- R1. Every request whose path begins with `/watch` goes to `WATCH_PROXY_DEST`, regardless of cookies.
- R2. Requests under `/journeys` go to `RESOURCES_PROXY_DEST`.
- R3. The currently claimed `/resources` and `/resources/` paths go to `RESOURCES_PROXY_DEST`.
- R4. Other paths already claimed by JF Proxy continue to use `RESOURCES_PROXY_DEST` unless handled by a specialized Worker handler.

#### Preservation

- R5. Original headers and cookies continue to pass to the selected Proxy Destination.
- R6. Legacy JF watch-ID redirects, App Association Files, manual redirect handling, and Error Fallback behavior remain unchanged.

#### Deployment

- R7. Stage and production set `WATCH_PROXY_DEST` to `dd541ea7-e468-4159-af6c-25a59cba326c.jesusfilm.org`.
- R8. Local development retains its localhost Watch destination.
- R9. Documentation describes path-only routing and the existing Cloudflare Route Pattern boundaries accurately.

### Acceptance Examples

- AE1. Given `/watch` without cookies, when JF Proxy selects a destination, then it forwards to `WATCH_PROXY_DEST`.
- AE2. Given `/watch/video/123` with either an unrelated cookie or `EXPERIMENTAL=true`, when JF Proxy selects a destination, then it forwards to `WATCH_PROXY_DEST` and preserves the cookie header.
- AE3. Given `/journeys/123`, `/resources`, or `/resources/`, when JF Proxy selects a destination, then it forwards to `RESOURCES_PROXY_DEST`.
- AE4. Given `/api/test` with an Experimental Cookie, when JF Proxy reaches the generic proxy handler, then it still forwards to `RESOURCES_PROXY_DEST`.
- AE5. Given either deployed Wrangler environment, when its configuration is validated, then the Watch binding resolves to the user-specified hostname.

### Scope Boundaries

- Preserve the existing `/watch*` prefix semantics, including paths such as `/watching`; changing to path-segment matching is separate work.
- Preserve Cloudflare ownership of exact `/resources` and `/resources/`; do not add `/resources/*` Route Patterns in this change.
- Do not alter Proxy Destination protocols, request methods, cache behavior, legacy redirect resolution, or Error Fallback behavior.

---

## Planning Contract

### Key Technical Decisions

- KTD1. Remove the Experimental Cookie from Proxy Destination selection and route every claimed `/watch*` request to Watch. (session-settled: user-directed — chosen over cookie-gated Watch routing: the user requested path-only routing.)
- KTD2. Retain Resources as the destination for `/journeys*`, the claimed `/resources` forms, and all other generic Worker proxy traffic. (session-settled: user-directed — chosen over maintaining multiple conditional destination rules: the user requested a small path-based contract.)
- KTD3. Use `dd541ea7-e468-4159-af6c-25a59cba326c.jesusfilm.org` for the stage and production Watch bindings; repository research confirmed the hostname is reachable and both Wrangler environments accept it.
- KTD4. Keep specialized handlers registered before the generic catch-all so legacy redirects and App Association Files remain outside Proxy Destination selection.

### Assumptions

- The existing `/watch*` Route Patterns and `startsWith('/watch')` behavior are intentional prefix semantics.
- The user's `/resources` requirement covers the currently claimed exact and trailing-slash forms, not nested paths that Cloudflare does not send to this Worker.
- Production delivery remains merge-to-`main` through `.github/workflows/worker-deploy.yml`.

### Sequencing

The path-routing tests, cookie-gate removal, deployed bindings, and documentation edits already exist in the working tree.
Inspect and preserve those changes, correct any remaining drift, validate both Wrangler environments, and ship through the normal PR, merge, and production deployment path.

---

## Implementation Units

### U1. Make routing path-only

- **Goal:** Select the Watch destination for every `/watch*` request while preserving Resources routing and proxy behavior elsewhere.
- **Requirements:** R1-R6; AE1-AE4; KTD1, KTD2, KTD4.
- **Dependencies:** None.
- **Files:** `workers/jf-proxy/src/index.ts`, `workers/jf-proxy/src/index.spec.ts`.
- **Approach:** Remove cookie presence from destination selection, keep cookie extraction for header forwarding, and consolidate the routing cases around the path contract.
- **Execution note:** Preserve the proof-first history already established in this session: the no-cookie `/watch` test failed against the old implementation before the production routing change made it pass.
- **Patterns to follow:** Existing Hono catch-all and `cloudflare:test` `fetchMock` request assertions in `workers/jf-proxy/src/index.spec.ts`.
- **Test scenarios:**
  - Covers AE1. Request `/watch` without cookies and assert Watch responds.
  - Covers AE2. Request nested Watch paths with unrelated and Experimental cookies and assert Watch responds.
  - Covers AE2. Assert a Watch request still forwards its cookie header.
  - Covers AE3. Request `/journeys`, nested journeys, `/resources`, and `/resources/` and assert Resources responds.
  - Covers AE4. Request another claimed generic path with an Experimental Cookie and assert Resources responds.
- **Verification:** The focused Worker suite proves destination selection and existing redirect/error/association coverage remains green.

### U2. Configure and document deployed routing

- **Goal:** Point both deployed environments at the new Watch hostname and make routing documentation match the executable contract.
- **Requirements:** R7-R9; AE5; KTD3.
- **Dependencies:** U1.
- **Files:** `workers/jf-proxy/wrangler.toml`, `workers/jf-proxy/README.md`, `workers/jf-proxy/CONTEXT.md`, `CONTEXT-MAP.md`.
- **Approach:** Replace only the stage and production Watch bindings, preserve localhost development and Resources bindings, remove cookie-gate descriptions, and describe the exact Resources ownership boundary.
- **Execution note:** This unit is configuration and documentation; use Wrangler dry runs for both environments as the primary proof.
- **Patterns to follow:** Existing `[env.stage.vars]` and `[env.prod.vars]` bindings and the JF Proxy domain vocabulary.
- **Test scenarios:** Test expectation: none -- the destination values and prose are static configuration; Wrangler parsing and binding output provide the relevant proof.
- **Verification:** Both Wrangler environment dry runs show the new Watch hostname, changed markdown is formatted, and the diff contains no whitespace errors.

---

## Verification Contract

| Gate                                                                                                    | Applies to | Done signal                                                   |
| ------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| `pnpm exec vitest run --config workers/jf-proxy/vitest.config.ts workers/jf-proxy/src --coverage=false` | U1         | All Worker tests pass.                                        |
| `pnpm exec tsc --noEmit -p workers/jf-proxy/tsconfig.app.json`                                          | U1         | Application TypeScript passes.                                |
| `pnpm exec eslint --config workers/jf-proxy/eslint.config.mjs workers/jf-proxy/src/index.ts`            | U1         | Changed production source passes lint.                        |
| Wrangler stage dry run                                                                                  | U2         | Stage config parses and reports the new Watch binding.        |
| Wrangler production dry run                                                                             | U2         | Production config parses and reports the new Watch binding.   |
| Prettier and `git diff --check`                                                                         | U1, U2     | Changed files are formatted and contain no whitespace errors. |

The spec TypeScript project and full Worker lint currently expose pre-existing configuration/lint failures outside this diff; those failures must be distinguished from regressions introduced here.

---

## Definition of Done

- U1 satisfies AE1-AE4 with the full JF Proxy suite green.
- U2 configures the user-specified hostname in stage and production while keeping local development unchanged.
- README and domain context no longer describe Experimental Cookie routing or unsupported nested Resources ownership.
- Both Wrangler environment dry runs pass.
- The final review has no unresolved actionable findings introduced by this change.
- The branch is committed, pushed, opened as a PR, and required CI checks are green or any unrelated baseline failure is documented through the shipping workflow.
- The PR is merged to `main`, the `Worker Deploy` production job for `jf-proxy` completes successfully, and public smoke checks confirm `/watch` reaches Watch without a cookie while `/journeys` and `/resources` remain on Resources.
- No abandoned implementation attempts or unrelated cleanup remain in the diff.
