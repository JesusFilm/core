---
title: 'Add global dismiss button to SnackbarProvider in journeys-admin'
category: ui-bugs
date: 2026-03-20
tags:
  - snackbar
  - notistack
  - mobile
  - accessibility
  - journeys-admin
  - android
  - scroll-blocking
  - dismissibility
module: apps/journeys-admin
symptom: 'Snackbars block critical UI elements on mobile (add button, max platforms message) and prevent scrolling on Android during 5s auto-dismiss window'
root_cause: 'SnackbarProvider in _app.tsx lacked a global action prop, leaving snackbars with no manual dismiss mechanism'
severity: medium
resolution_time_estimate: '1-2 hours'
---

# Mobile Snackbar Blocking UI — No Dismiss Button

## Problem Description

On mobile devices, snackbars in the Chat Widget editor block critical UI elements ("+ Add 2nd Custom Button", "You can add no more than two chat platforms" message). On Android specifically, users cannot scroll past the snackbar overlay. No manual dismiss option existed — users were forced to wait the full 5-second auto-dismiss duration before they could interact with the blocked UI.

**Reported in:** [NES-1466](https://linear.app/jesus-film-project/issue/NES-1466/snackbar-behaviour-observations-and-questions)
**Parent ticket:** [NES-1452](https://linear.app/jesus-film-project/issue/NES-1452/fix-chat-editor-only-renders-1-of-2-custom-chat-buttons)

## Investigation Steps

1. **Corrected initial assumption about notistack defaults**: Initially assumed notistack's default `autoHideDuration` was `null` (persist indefinitely). A deep dive into `node_modules/notistack/notistack.esm.js:759` revealed the actual default is `5000ms`. Production behavior confirmed this. The TypeScript type declarations are misleading — they say "set to null if you don't want auto-close," implying the default does auto-close.

2. **Audited all 39 snackbar callsites** across `journeys-admin`:
   - 0 use `persist: true`
   - 0 have undo/retry action buttons
   - 8 set an explicit `autoHideDuration` (2000ms or 4000ms)
   - 31 rely on the 5000ms default with no close button
   - The existing `showSnackbar` utility already renders its own per-snackbar close button (used by ~10 files)

3. **Evaluated five solution options**:
   - **Option A** — Add `autoHideDuration` to Chat snackbars only: too narrow, doesn't solve the general problem
   - **Option B** — Global `autoHideDuration` on `SnackbarProvider`: unnecessary since the 5s default is acceptable and within M3's 4-10s range
   - **Option C** — Global close button via `action` prop on `SnackbarProvider`: directly solves the problem with minimal diff. **Chosen.**
   - **Option D** — Refactor all callsites to use `showSnackbar` utility: larger diff for the same end result
   - **Option E** — Responsive snackbar positioning: too complex for the actual problem

4. **Confirmed no side effects** via 7 parallel review agents:
   - Per-snackbar `action` overrides provider-level action (notistack merge order: `options[name] || props[name] || defaults[name]`) — no duplicate buttons
   - Tests use their own bare `SnackbarProvider` — no test breakage
   - Zero bundle impact (imports already in dependency graph)
   - No race conditions (`closeSnackbar` on dismissed snackbar is a no-op)
   - SSR safe (`onClick` never fires server-side)
   - Hover pauses auto-dismiss timer (built into notistack)

## Root Cause

The `SnackbarProvider` in `apps/journeys-admin/pages/_app.tsx` had no `action` prop. All snackbars that did not explicitly set their own action lacked a dismiss button. Mobile users (especially on Android) were blocked by the snackbar overlay for the full 5-second default auto-hide duration with no way to dismiss it.

## Solution

Single file change to `apps/journeys-admin/pages/_app.tsx`:

```tsx
import IconButton from '@mui/material/IconButton'
import { SnackbarKey, SnackbarProvider, closeSnackbar } from 'notistack'
import XCircleContainedIcon from '@core/shared/ui/icons/XCircleContained'

// Module-scope for stable reference (no re-creation on render)
const snackbarAction = (snackbarKey: SnackbarKey): ReactElement => (
  <IconButton
    size="small"
    aria-label="dismiss notification"
    color="inherit"
    onClick={() => closeSnackbar(snackbarKey)}
  >
    <XCircleContainedIcon />
  </IconButton>
)

// Added action prop to the existing SnackbarProvider:
<SnackbarProvider
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  action={snackbarAction}
>
```

### Key Decisions

1. **Global close button over targeted fix**: A global `action` prop ensures every snackbar gets a dismiss button, preventing the same problem elsewhere.
2. **Module-scope function**: Stable reference avoids unnecessary re-renders from prop changes.
3. **Standalone `closeSnackbar` export**: Works at module scope without hooks or context consumers.
4. **`XCircleContainedIcon`**: Uses the project's custom icon set (`@core/shared/ui/icons`) instead of direct `@mui/icons-material` imports.
5. **No `autoHideDuration` change**: The 5s default is within M3's 4-10s range. The problem was lack of manual dismiss, not the duration.

## Prevention Strategies

### 1. Provider-Level Defaults as Single Source of Truth

Treat `SnackbarProvider` as the canonical configuration point. Any behavior that should apply to all snackbars (dismiss action, duration, position) belongs at the provider level. Per-callsite overrides should be rare and intentional.

### 2. Mobile UX Review Checklist for Overlay Components

Any component that overlays content (snackbar, toast, dialog, bottom sheet) should be evaluated:

- **Dismissable:** Can the user close it without waiting?
- **Non-blocking:** Does it obstruct interactive elements?
- **Timed appropriately:** Is the auto-hide duration reasonable?
- **Accessible:** Screen reader support and keyboard/gesture dismissal?

### 3. Future: Lint Rule for Direct enqueueSnackbar Usage

Consider adding an ESLint `no-restricted-imports` rule that flags direct `enqueueSnackbar` imports from notistack, directing developers to use the `showSnackbar` wrapper utility instead. This would prevent new callsites from bypassing global UX defaults.

## Gotcha: notistack Default autoHideDuration

The notistack TypeScript types say "set autoHideDuration to null if you don't want snackbars to automatically close." This is misleading — it implies the default might be null. **The actual default is `5000ms`**, hardcoded in `notistack.esm.js:759`. Always verify library defaults in the source code, not just the type declarations.

## Related

- **Plan document:** `docs/plans/2026-03-20-001-fix-snackbar-mobile-blocking-autodismiss-plan.md`
- **Precedent fix:** Commit `c9f9f97d8` — "fix: media screen snackbar settings (#8769)" — addressed the same class of issue for MediaScreen by adding per-callsite `autoHideDuration: 2000`
- **Related ticket:** [NES-1363](https://linear.app/jesus-film-project/issue/NES-1363) — "Feedback: reduce or remove snackbar for image upload"
- **Future cleanup:** Remove redundant `action` and `autoHideDuration` from `createShowSnackbar` utility (`MuxVideoUploadProvider/utils/showSnackbar/showSnackbar.tsx`) now that the provider handles it globally
- [Material Design 3 — Snackbar Guidelines](https://m3.material.io/components/snackbar/guidelines)
- [Notistack API Reference](https://notistack.com/api-reference)
- [Notistack Issue #156](https://github.com/iamhosseindhv/notistack/issues/156) — global close button feature request
