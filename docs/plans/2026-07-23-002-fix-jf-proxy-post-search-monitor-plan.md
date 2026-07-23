---
title: Forward Watch POST requests and monitor production search
type: fix
date: 2026-07-23
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: production-incident
execution: code
deepened: 2026-07-23
---

# Forward Watch POST requests and monitor production search

## Goal Capsule

- **Objective:** Make the existing `jf-proxy` forward every Watch HTTP method,
  request header, and request body to the configured Watch destination, then
  add a real Checkly browser check that opens canonical production search,
  submits `JESUS`, and requires a visible `JESUS` result.
- **Authority:** Production evidence on 2026-07-23 showed canonical
  `GET https://www.jesusfilm.org/watch` succeeds while a Next.js server-action
  `POST` to the same URL returns the proxy's plain `404`. The same action sent
  to Forge's comparison host succeeds.
- **Execution profile:** Small, high-impact Cloudflare Worker routing fix plus
  one outside-in Playwright/Checkly monitor.
- **Stop conditions:** Stop if forwarding a request body requires buffering or
  changes the existing GET contract, if a non-GET upstream failure is replaced
  by the legacy HTML fallback, or if the browser monitor can pass without
  submitting the search form.
- **Tail ownership:** Ship through the repository pull-request flow. Merging to
  `main` lets the existing Worker Deploy workflow publish `jf-proxy`; the
  existing Checkly project is configured to discover `**/*.monitor.ts`.

## Product Contract

### Summary

The production `www.jesusfilm.org/watch*` Cloudflare Route already belongs to
`workers/jf-proxy`. Its generic proxy is registered with `app.get('*')`, so
Hono never invokes it for server-action POSTs. Even if it did, the upstream
`fetch` currently forwards method and headers but omits the request body.

The repair belongs in that existing Worker, not a competing route or a
search-specific endpoint. The synthetic belongs beside the current Watch
Checkly browser checks and must prove the exact interaction a GET healthcheck
missed.

### Requirements

- **R1.** Requests claimed by the existing Worker routes continue to select
  `WATCH_PROXY_DEST` for `/watch*` and `RESOURCES_PROXY_DEST` elsewhere.
- **R2.** The generic proxy handles all HTTP methods, including Next.js
  server-action `POST`s.
- **R3.** The upstream request preserves path, query, method, headers, cookies,
  and body without buffering or decoding the body.
- **R4.** Trusted forwarding metadata represents the public request origin so
  Next.js can compare `Origin` with the effective forwarded host.
- **R5.** GET-only legacy error fallback remains available for document
  navigation, while non-GET 4xx/5xx responses pass through unchanged.
- **R6.** Existing legacy redirect handlers, App Association handlers, GET
  proxying, manual redirect behavior, destination bindings, and route patterns
  remain unchanged.
- **R7.** A browser monitor navigates to
  `https://www.jesusfilm.org/watch`, clicks the English `Search videos`
  control, fills the English `Search videos by keyword` textbox with `JESUS`,
  presses Enter, and requires exact visible `JESUS` result text inside the
  search dialog.
- **R8.** The monitor uses only user-visible roles and labels, relies on
  Playwright soft waits, and contains no fallback selector or hard wait.
- **R9.** Focused Worker tests prove a representative Next.js action request
  reaches the Watch destination byte-for-byte and its RSC response reaches the
  caller.

### Acceptance Examples

- **AE1.** Given `POST /watch` with `Next-Action`,
  `Next-Router-State-Tree`, `Origin`, cookies, and an encoded body, when
  `jf-proxy` handles it, then the Watch destination receives the same method,
  framework headers, cookies, and body.
- **AE2.** Given the Watch destination returns `200 text/x-component` for that
  action, then `jf-proxy` returns the same status, content type, and body.
- **AE3.** Given a non-GET Watch request receives `404` or `500` upstream, then
  the proxy returns that upstream response instead of requesting
  `/not-found.html`.
- **AE4.** Given a GET Watch document receives the existing fallback-triggering
  status, then current not-found behavior remains intact.
- **AE5.** Given a fresh production browser, when Checkly opens search, enters
  `JESUS`, and presses Enter, then exact `JESUS` result text becomes visible in
  the search dialog.

### Scope Boundaries

- Do not create a second Cloudflare Worker or change the Wrangler route/destination
  configuration shipped in PR #9405.
- Do not change Forge search ranking, UI, server actions, or production
  selectors; the current English accessible names are sufficient.
- Do not redesign the proxy's historical GET 404/500 fallback beyond preventing
  it from swallowing non-GET responses.
- Do not replace Checkly with a GET API check; the browser interaction is the
  required outage detector.

## Planning Contract

### Key Technical Decisions

- **KTD1. Extend the existing Hono catch-all to all methods.** The route already
  owns `www.jesusfilm.org/watch*`; changing its generic handler fixes the
  production boundary without creating competing infrastructure.
- **KTD2. Rebuild the upstream `Request` from the incoming raw request and the
  rewritten destination URL.** The platform `Request` contract carries method,
  headers, cookies, and body stream together and avoids an allowlist that will
  drift with Next.js action protocol changes.
- **KTD3. Overwrite only forwarding host/protocol from the trusted incoming
  URL.** The public `Origin` header must agree with the effective forwarded
  host for Next.js action-origin checks; caller-supplied forwarding metadata
  must not be trusted.
- **KTD4. Restrict the legacy fallback to GET.** A server-action 404 or 500 is
  protocol data and must not be replaced with a legacy HTML not-found page.
- **KTD5. Add a separate search monitor.** Search submission deserves an
  independently named Checkly browser check so its failure clearly identifies
  the canonical POST/application boundary rather than being buried in video
  playback diagnostics.
- **KTD6. Assert within the dialog using user-facing semantics.** An exact
  `JESUS` result inside the search dialog proves the interaction completed and
  cannot pass from unrelated JESUS text already present on the home page.

### System-Wide Impact

- **Edge routing:** The catch-all is shared by all Worker-owned paths, so
  Resources and legacy GET behavior need regression coverage even though the
  incident is Watch-specific.
- **Request streams:** The proxy must pass the original body stream through
  once. Reading it for logging or assertions in production would consume it
  before the origin.
- **CSRF/origin checks:** Rewriting only the URL changes the upstream host while
  the browser's `Origin` remains `www`; canonical forwarding headers must close
  that intentional proxy boundary.
- **Failure semantics:** Non-GET upstream failures must remain non-GET protocol
  responses. The current HTML fallback is navigation behavior, not an
  all-method recovery policy.
- **Monitoring:** Existing video and redirect checks stay intact. The new check
  adds the missing canonical search transaction to the Checkly project matched
  by `checkly.config.ts`.

### Assumptions

- PR #9405's Watch destination and unconditional `/watch*` path routing are
  intentional and remain authoritative.
- Forge's English production search opener and textbox retain the current
  accessible names `Search videos` and `Search videos by keyword`.
- Search for `JESUS` returns at least one result with exact visible title text
  `JESUS`; this is the library title the incident report requires.
- `checkly.config.ts` defines the repository's browser-check discovery, but the
  repository contains no Checkly deploy workflow or Checkly API credentials.
  An authorized operator must verify the connected Checkly project
  materializes the new `*.monitor.ts` from `main`; this change does not invent a
  second monitor deployment system without account context.

## Implementation Units

### U1. Forward all proxy methods and bodies

- **Goal:** Make the generic Worker proxy transport-complete for Watch server
  actions without changing destination selection.
- **Requirements:** R1-R6, R9; AE1-AE4; KTD1-KTD4.
- **Dependencies:** None.
- **Files:** `workers/jf-proxy/src/index.ts`,
  `workers/jf-proxy/src/index.spec.ts`.
- **Approach:** Register the generic proxy for all methods, derive the upstream
  URL through the existing destination selection, construct the upstream
  request from the incoming raw `Request`, overwrite canonical forwarding
  metadata, preserve manual redirects, and gate the existing error fallback to
  GET requests.
- **Test scenarios:**
  - POST a representative Next action with framework headers, cookie, query,
    and body; assert the Watch mock receives each unchanged plus canonical
    forwarding metadata.
  - Return a representative `text/x-component` response and assert status,
    content type, and body reach the caller.
  - Return 404 and 500 for non-GET Watch requests and assert no not-found fetch
    occurs.
  - Keep current GET document, cookie forwarding, Resources destination,
    redirect, association-file, and not-found tests green.
- **Verification:** The focused Worker suite and Worker TypeScript/lint checks
  pass; a production-shaped server-action replay is represented by the unit
  fixture.

### U2. Add the canonical Watch search browser monitor

- **Goal:** Detect the user-visible search outage that GET checks cannot see.
- **Requirements:** R7-R8; AE5; KTD5-KTD6.
- **Dependencies:** U1 for production success, but the monitor source can be
  authored and linted independently.
- **Files:** Add `apps/watch-e2e/src/monitoring/search.monitor.ts`.
- **Approach:** Follow the repository's existing `@check` Playwright monitor
  pattern. Start on canonical `www`, scope actions and assertions to the search
  dialog, use visible English roles/labels, press Enter explicitly, and assert
  exact `JESUS` result text.
- **Test scenarios:**
  - The current broken production route causes the monitor to fail after
    submission rather than pass on the initial GET.
  - After the Worker deploy, a fresh run submits the query and renders the exact
    title within the dialog.
- **Verification:** Playwright/Checkly discovery sees the new monitor, Watch E2E
  TypeScript and lint pass, and a browser run captures the expected pre-deploy
  failure or post-deploy success without fallback selectors.

## Risks and Mitigations

- **Request body is consumed or dropped.** Build the subrequest from the raw
  incoming Request and never read the body in production code; assert bytes at
  the mock origin.
- **Next.js rejects the action as cross-origin.** Overwrite forwarded host and
  protocol from `c.req.url`, preserve the browser `Origin`, and assert both in
  the POST fixture.
- **POST errors become HTML.** Gate fallback logic on GET and test both 404 and
  500 non-GET responses.
- **Shared proxy regression.** Retain the full existing Worker suite and avoid
  destination or Wrangler changes.
- **Monitor passes on unrelated page content.** Scope exact result text to the
  open dialog and require click, fill, and Enter first.
- **Monitor flakes on timing.** Use Playwright locator auto-waiting and the
  repository default timeout; add no sleeps or conditional fallbacks.

## Verification Contract

| Gate                                 | Applies to | Done signal                                                          |
| ------------------------------------ | ---------- | -------------------------------------------------------------------- |
| Focused `jf-proxy` Vitest suite      | U1         | Existing coverage plus POST/body/error cases pass.                   |
| Worker TypeScript and scoped lint    | U1         | Changed proxy source is type-safe and lint-clean.                    |
| Watch E2E TypeScript and scoped lint | U2         | New monitor compiles and follows Playwright rules.                   |
| Checkly/Playwright monitor discovery | U2         | The new `*.monitor.ts` is selected as a browser check.               |
| Production canonical browser run     | U2         | Search submits `JESUS` and exact dialog result appears after deploy. |
| Connected Checkly project read-back  | U2         | The new named browser check exists and is active after merge.        |
| Formatting and diff integrity        | U1, U2     | Changed files are formatted and contain no whitespace errors.        |

## Definition of Done

- Worker tests prove a production-shaped server-action POST reaches the Watch
  destination with its headers and body and returns the RSC response.
- Non-GET origin errors pass through; existing GET fallback behavior remains
  green.
- The new Checkly monitor opens canonical production search, submits `JESUS`,
  and requires an exact result inside the dialog.
- Review finds no unresolved issue introduced by the change.
- The branch is committed, pushed, opened as a PR, and required checks are
  green.
- Production resolution is confirmed only after merge deploys `jf-proxy` and a
  connected-project read-back shows the active Checkly check and a fresh
  Checkly/browser run passes. A successful GET alone is not completion evidence.
