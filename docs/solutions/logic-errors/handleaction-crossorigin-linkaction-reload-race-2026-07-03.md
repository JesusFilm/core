---
title: 'handleAction LinkAction never opens on non-whitelisted origins (router.push + reload race)'
date: 2026-07-03
category: logic-errors
module: journeys-ui/action
problem_type: logic_error
component: journeys-ui/handleAction
symptoms:
  - 'Link button ripples and fires analytics, but the link never opens; the page reloads in place instead'
  - 'Same button works on your.nextstep.is and your-stage.nextstep.is but fails on Vercel preview deployments'
  - 'No console error visible to the user (unhandled promise at most)'
root_cause: logic_error
resolution_type: code_fix
severity: high
related_components:
  - journeys-ui/Button
  - journeys-ui/RadioOption
  - journeys-ui/SignUp
  - journeys-ui/VideoTrigger
tags:
  - handleaction
  - linkaction
  - router-push
  - cross-origin
  - vercel-preview
  - custom-domain
  - navigation
---

# handleAction LinkAction never opens on non-whitelisted origins (router.push + reload race)

> **Status:** diagnosed and source-verified (Next 16.2.5); fix not yet
> implemented — surfaced during QA-538 verification and belongs in its own
> ticket. This bug exists on `main` and predates the AI chat entirely.

## Problem

`LinkAction`/`ChatAction` URLs that contain a journeys host
(`your.nextstep.is`, `your-stage.nextstep.is`, `localhost:4100`) — or any
relative/scheme-less URL — are navigated via
`void router.push(url)?.then(() => window.location.reload())` in
`libs/journeys/ui/src/libs/action/action.ts`. When the page's origin differs
from the URL's origin, the navigation is silently cancelled: the click
visibly registers but the link never opens.

## Symptoms

- On a Vercel preview (`journeys-<pr>-jesusfilm.vercel.app`), localhost, or a
  custom journey domain, clicking a link button holding a full
  `https://your.nextstep.is/...` URL reloads the page in place.
- The identical button works on production `your.nextstep.is` and stage
  `your-stage.nextstep.is` (same-origin there).
- Relative journey-to-journey links (`/other-journey`) work everywhere.

## What Didn't Work

- **Blaming the newest change.** The failure was first attributed to the
  chat-overlay PR because "main works, the PR doesn't" — but main had been
  tested on production/stage (whitelisted origins) and the PR on its Vercel
  preview (cross-origin). The variable was the domain, not the code: the PR
  diff touched only `ChatOverlay`, which renders `null` when the chat is
  closed, yet the buttons failed with the chat closed too. Holding the
  environment constant (main's own Vercel preview) reproduced the failure on
  unmodified main.
- **Overlay geometry.** Ruled out: at desktop sizes the card CTA sits well
  clear of the chat band, and a scrim-eaten click shows a different
  signature (no ripple, chat visibly closes).

## Solution

Verified mechanism, in Next 16.2.5 pages router
(`next/dist/shared/lib/router/router.js`):

1. `change()` calls `isLocalURL(url)`; a cross-origin absolute URL fails it.
2. It then calls `handleHardNavigation` → `window.location.href = url` and
   **resolves `false` immediately** (no throw).
3. Back in `handleAction`, `.then(() => window.location.reload())` runs in
   the next microtask — the reload supersedes the still-pending cross-origin
   navigation. The page reloads in place; the link is lost.

Proposed fix (pending): replace the host-substring whitelist with a real
origin comparison —

```ts
case 'LinkAction': {
  if (action.url === '') break
  const resolved = new URL(action.url, window.location.origin)
  if (resolved.origin === window.location.origin) {
    // same-origin: SPA navigation (keep the reload that resets journey state)
    void router.push(resolved.pathname + resolved.search + resolved.hash)
      ?.then(() => window.location.reload())
  } else {
    // different origin: hand the whole navigation to the browser — no reload
    window.open(resolved.href, '_blank') ?? window.location.assign(resolved.href)
  }
  break
}
```

This also fixes scheme-less URLs (`www.example.com`) that bypass the current
`startsWith('http')` check, and creates the hook for honoring
`LinkAction.target` (currently ignored).

## Why This Works

The race only exists because a hard (cross-origin) navigation and a reload
are queued back-to-back — the later one wins. Same-origin URLs never hard
navigate (`router.push` completes the SPA transition before the chained
reload), which is exactly why production and stage appear fine: they are the
whitelisted origins. Comparing `resolved.origin === location.origin` makes
the decision match what Next itself does internally, instead of guessing via
host substrings that go stale (preview domains and custom journey domains
are not in the list and never will be).

## Prevention

- Never chain `window.location.reload()` (or any second navigation) onto a
  `router.push` whose URL may be external — in the pages router a
  cross-origin push resolves immediately while its hard navigation is still
  pending.
- Classify URLs by **origin comparison**, not host-substring whitelists.
- Check `window.open`'s return value (null = popup blocked) on paths that
  `await` before opening — submit-enabled Buttons and SignUp navigate after
  network round-trips, and `VideoTrigger` fires with no user gesture at all,
  so external links there are popup-blocker prone.
- When debugging "works in env A, fails in env B", hold the environment
  constant while varying the code (e.g. main's Vercel preview vs the PR's
  Vercel preview) before blaming the diff.

## Related Issues

- Surfaced while verifying QA-538 (PR #9342) — see
  [chat overlay full-viewport click blocking](../ui-bugs/chat-overlay-fullscreen-layer-blocks-journey-clicks-qa538-2026-07-03.md).
- Affects any journey served on a custom domain in production today.
