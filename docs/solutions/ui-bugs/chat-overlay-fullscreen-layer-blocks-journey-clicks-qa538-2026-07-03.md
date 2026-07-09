---
title: "AI chat overlay's invisible full-viewport layer swallowed all journey clicks"
date: 2026-07-03
category: ui-bugs
linear: QA-538
module: journeys/ChatOverlay
problem_type: ui_bug
component: journeys-ui/ChatOverlay
symptoms:
  - 'Once the AI chat opened on a card, every button outside the chat went dead on desktop (poll options, nav arrows, footer)'
  - 'Keyboard left-arrow still navigated backwards while all pointer clicks were silently swallowed'
  - 'Only the chat frame stayed interactive; no error anywhere'
  - 'Mobile was unaffected; only sm+ (ChatOverlay) breakpoints broke'
root_cause: logic_error
resolution_type: code_fix
severity: critical
related_components:
  - journeys/Conductor
  - journeys-ui/AiChatButton
  - journeys-ui/PinnedChatBar
tags:
  - pointer-events
  - overlay
  - z-index
  - apologist-chat
  - hit-testing
  - journeys
---

# AI chat overlay's invisible full-viewport layer swallowed all journey clicks

## Problem

When the apologist AI chat engaged on a journey card (desktop, sm+), every
interactive element outside the chat stopped responding to clicks — poll
options, navigation arrows, footer buttons. Since NES-1734 auto-opens the
chat, journeys entered this state with zero user action, ending the journey
for the visitor.

## Symptoms

- Buttons unclickable the moment the chat surface appears; no hover/ripple.
- Keyboard hotkeys still worked (document-level listeners bypass hit-testing).
- Only the chat panel and its scrim responded to the pointer.
- Desktop-only: the xs `PinnedChatBar` drawer never covered the card.

## What Didn't Work

- **NES-1738 ("reveal card behind chat") shrank only the visible surface.**
  The dark backdrop became a bottom sheet (144px idle / 80% active), but the
  overlay's root `Box` stayed `position: fixed; inset: 0` at
  `theme.zIndex.modal` with default pointer-events — a transparent
  full-viewport click shield. The card was _visually_ revealed but not
  interactively.
- **Existing tests couldn't catch it.** jsdom performs no hit-testing
  (`fireEvent.click` dispatches on the target regardless of covering
  layers), and `Conductor.spec.tsx` mocks `ChatOverlay` away entirely, so
  its nav-click tests never ran against the real overlay.
- **An interim `pointerEvents: 'none'` root + `'auto'` children fix worked**
  but was superseded: it kept the full-viewport layer and relied on
  inheritance staying correct forever (fail-open for future children).

## Solution

Size the overlay container to the chat itself instead of the viewport
(`libs/journeys/ui/src/components/ChatOverlay/ChatOverlay.tsx`):

```tsx
// Before: full-viewport layer, children sized to the sheet
<Box sx={{ position: 'fixed', inset: 0, zIndex: (t) => t.zIndex.modal, ... }}>
  <Box onClick={onClose} sx={{ position: 'absolute', bottom: 0, height, ... }} />
  <Box sx={{ maxWidth: '48rem', height, ... }}><AiChat ... /></Box>
</Box>

// After: bottom-anchored band exactly as tall as the sheet; children fill it
<Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, height, // 144px idle / '80%' active
           transition: HEIGHT_TRANSITION, zIndex: (t) => t.zIndex.modal, ... }}>
  <Box onClick={onClose} sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, ... }} />
  <Box sx={{ maxWidth: '48rem', height: '100%', ... }}><AiChat ... /></Box>
</Box>
```

Regression tests pin the band geometry at the style level in
`ChatOverlay.spec.tsx` (bottom-anchored, 144px idle → 80% active, scrim and
panel filling the band).

## Why This Works

Nothing chat-related exists above the sheet anymore, so the journey above it
is natively interactive by construction — no pointer-events juggling to keep
correct. `height: '80%'` on a `position: fixed` element resolves against the
viewport exactly as the old inset-0 root did, and px↔% height transitions
interpolate via calc() in all supported browsers, so the idle→active grow
animation is unchanged. This mirrors how the mobile `PinnedChatBar` was
already shaped (bottom-anchored drawer), which is why mobile never had the
bug.

## Prevention

- Never leave a `position: fixed; inset: 0` container with default
  pointer-events over content that must stay interactive. Size overlay
  containers to their visual surface; reach for full-viewport layers only
  when true modality (focus trap, backdrop) is intended.
- When a design change "reveals" content behind an overlay, the interactive
  half of the reveal must ship with the visual half — grep the overlay for
  `inset: 0` / full-viewport styles whenever its visible footprint shrinks.
- jsdom cannot catch occlusion bugs. Pin the overlay's geometry with
  `toHaveStyle` assertions, and verify hit-testing manually or via e2e
  (clicking a card button while the chat is open).
- Children of the band must stay within it — an escapee with its own fixed
  positioning silently reintroduces the bug (comment now in the component).

## Related Issues

- Linear QA-538; regression introduced by NES-1738 (PR #9308), amplified by
  the NES-1734 auto-open default. Fixed in PR #9342.
- While verifying the fix, a separate latent navigation bug surfaced — see
  [handleAction cross-origin LinkAction reload race](../logic-errors/handleaction-crossorigin-linkaction-reload-race-2026-07-03.md).
