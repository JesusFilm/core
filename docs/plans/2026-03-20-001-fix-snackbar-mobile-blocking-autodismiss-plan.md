---
title: 'fix: Snackbar auto-dismiss and close button for mobile UX'
type: fix
status: completed
date: 2026-03-20
---

# fix: Snackbar auto-dismiss and close button for mobile UX

## Enhancement Summary

**Deepened on:** 2026-03-20
**Sections enhanced:** 6
**Research agents used:** Framework docs (notistack v3), UX best practices, frontend races, pattern recognition, performance, code simplicity, TypeScript

### Key Improvements

1. Dropped `autoHideDuration` change — the 5s default is fine; close button alone solves the problem
2. Added `aria-label` for accessibility compliance (WCAG)
3. Extracted action function to module scope for stable reference
4. Confirmed zero risk: no race conditions, no duplicate buttons, no test breakage, no bundle impact

### New Considerations Discovered

- notistack pauses auto-dismiss timer on hover (built-in) — users aiming for the close button won't have the snackbar vanish
- Per-snackbar `action` completely overrides provider-level `action` (no merging, no duplicates)
- `showSnackbar` utility's close button is redundant once global action is added (future cleanup opportunity)
- Import ordering matters — `@mui/icons-material` sorts before `@mui/material`

---

## Overview

On mobile, snackbars in the Chat Widget editor block critical UI elements ("+ Add 2nd Custom Button", "You can add no more than two chat platforms" message). On Android, users cannot scroll past the snackbar while it's visible. The notistack default `autoHideDuration` is **5000ms** (confirmed in `notistack.esm.js:759`), so snackbars do auto-dismiss — but 5 seconds is too long on mobile where the snackbar blocks scrolling and overlays critical UI.

**Linear ticket:** [NES-1466](https://linear.app/jesus-film-project/issue/NES-1466/snackbar-behaviour-observations-and-questions)

## Problem Statement / Motivation

- Snackbar overlays "+" Add 2nd Custom Button" and max-platforms message on mobile
- On Android, the snackbar blocks scrolling entirely for the full 5-second default duration
- No manual dismiss option exists — users must wait the full duration
- 31 of 39 snackbar callsites rely on the notistack default (5000ms) with no close button

## Proposed Solution

Add a **global close button** on the `SnackbarProvider` in `_app.tsx` so users can dismiss snackbars immediately. This is the primary and only fix needed — it gives Android users (who can't scroll past the snackbar) an immediate escape rather than waiting 5 seconds.

**Do NOT change `autoHideDuration`** — the 5s default is within Material Design's recommended 4-10s range and matches observed production behavior. Changing it is a YAGNI violation (nobody asked for faster auto-hide, the problem is lack of manual dismiss).

### Research Insights

**Why close button only (not autoHideDuration):**

- notistack's 5000ms default falls within M3's recommended 4-10s range
- Error snackbars ideally should persist longer, not shorter — reducing global duration would make error messages harder to read
- The `showSnackbar` utility already defaults to 4000ms; adding a global 4000ms creates a confusing "two sources of truth" for the same behavior
- The close button directly solves the reported problem (can't dismiss on Android) without side effects

**Hover pauses timer (built-in):**

- notistack pauses the auto-hide timer on `mouseenter` and restarts at **50% duration** on `mouseleave`
- This means users aiming for the close button won't have the snackbar vanish mid-interaction
- No additional implementation needed for this behavior

## Snackbar Audit Summary

Full audit of all 39 snackbar callsites in `apps/journeys-admin/`:

| Category                                         | Count | Explicit Duration | persist | Custom Action    | Risk                                 |
| ------------------------------------------------ | ----- | ----------------- | ------- | ---------------- | ------------------------------------ |
| Chat Widget (Chat.tsx, Details.tsx, Summary.tsx) | 4     | None              | false   | None             | LOW                                  |
| Google Integration                               | 5     | None              | false   | None             | LOW                                  |
| Growth Spaces Integration                        | 7     | None              | false   | None             | LOW                                  |
| Team/Domain Management                           | 7     | None              | false   | None             | LOW                                  |
| Journey Copy/Translate                           | 4     | None              | false   | None             | LOW                                  |
| Share/Link Management                            | 7     | None              | false   | None             | LOW                                  |
| Template Video Upload                            | 5     | 2000ms            | false   | None             | SAFE (overrides global)              |
| MUX Video Upload (showSnackbar)                  | 3     | 4000ms            | false   | Close button     | SAFE (per-snackbar action overrides) |
| YouTube Integration                              | 1     | 4000ms            | false   | "Dismiss" button | SAFE (per-snackbar action overrides) |

**Key findings:**

- 0 snackbars use `persist: true`
- 0 snackbars have undo/retry action buttons
- 8 already set explicit `autoHideDuration` (will override any global change)
- 31 rely on notistack's internal default of 5000ms
- Notistack default `autoHideDuration` is **5000ms** (not `null`) — confirmed in `node_modules/notistack/notistack.esm.js:759`
- **No duplicate close buttons**: Per-snackbar `action` completely overrides (not merges with) the provider-level `action`. The `showSnackbar` utility and `YouTubeDetails` component both set their own `action`, so the global close button will not appear on those snackbars.

## Technical Considerations

- **notistack default is 5000ms**: The library hardcodes `autoHideDuration: 5000` as the internal default. Snackbars without an explicit duration already auto-dismiss after 5 seconds. This matches observed production behavior.
- **notistack override behavior**: Per-snackbar `action` and `autoHideDuration` take precedence over the provider's values via `options[name] || props[name] || defaults[name]` (source line 831). The 8 callsites with explicit values are unaffected.
- **No race conditions**: `closeSnackbar` on an already-dismissed snackbar is a no-op — notistack checks its internal map before acting. No double-removal, no ghost DOM.
- **SSR safe**: The `action` prop produces JSX (serializable). `closeSnackbar` is only invoked in `onClick`, never during SSR.
- **Hover pauses timer**: Built into notistack. `mouseenter` clears the timer, `mouseleave` restarts at 50% duration. No additional work needed.
- **No test breakage**: 131 test files use their own bare `<SnackbarProvider>` wrappers (not `_app.tsx`), so they won't inherit the global close button. ~15 test files mock notistack entirely.
- **Zero bundle impact**: `@mui/icons-material/Close` and `@mui/material/IconButton` are already in the dependency graph from other components.

### Edge Cases

- **`action: null` fallthrough**: If a per-snackbar `action` is set to a falsy value (`null`, `''`), notistack's `||` merge logic falls through to the provider-level action. This is fine — no existing callsite does this.
- **Pre-existing inconsistency**: `YouTubeDetails.tsx` renders a text "Dismiss" button instead of a close icon. This predates our change and is unaffected.

## Acceptance Criteria

- [ ] `SnackbarProvider` in `apps/journeys-admin/pages/_app.tsx` has a global close button action
- [ ] Close button has `aria-label="dismiss notification"` for accessibility
- [ ] Users can manually dismiss any snackbar by tapping the close button
- [ ] Snackbars still auto-dismiss after their configured duration (default 5s, or explicit overrides)
- [ ] Existing tests pass without modification

## Implementation

### `apps/journeys-admin/pages/_app.tsx`

```tsx
// New imports:
import IconButton from '@mui/material/IconButton'       // after GlobalStyles (alphabetical)
import { closeSnackbar, SnackbarProvider } from 'notistack'  // add closeSnackbar to existing import

import XCircleContainedIcon from '@core/shared/ui/icons/XCircleContained'           // in the internal imports group

// Module-scope action function (stable reference, no re-creation on render):
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

// In the render (add action prop only — no autoHideDuration change):
<SnackbarProvider
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right'
  }}
  action={snackbarAction}
>
```

**Full corrected import order:**

```tsx
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import type { EmotionCache } from '@emotion/cache'
import GlobalStyles from '@mui/material/GlobalStyles'
import IconButton from '@mui/material/IconButton'
import { AppCacheProvider } from '@mui/material-nextjs/v15-pagesRouter'
import { GoogleTagManager } from '@next/third-parties/google'
import { AppProps as NextJsAppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { SSRConfig, appWithTranslation, useTranslation } from 'next-i18next'
import { DefaultSeo } from 'next-seo'
import { closeSnackbar, SnackbarKey, SnackbarProvider } from 'notistack'
import { ReactElement, useEffect } from 'react'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import XCircleContainedIcon from '@core/shared/ui/icons/XCircleContained'
```

**Uses `XCircleContainedIcon` from `@core/shared/ui/icons/XCircleContained`** — the project's standard close/dismiss icon (used 29+ times across journeys-admin). Avoids direct `@mui/icons-material` imports, consistent with codebase conventions.

### Files Changed

1. `apps/journeys-admin/pages/_app.tsx` — add `action` prop to `SnackbarProvider`, add module-scope `snackbarAction` function, add `IconButton`, `closeSnackbar`/`SnackbarKey`, and `XCircleContainedIcon` imports

**That's it — single file change.**

### Future Cleanup Opportunities (Not in scope)

- Remove redundant `action` and `autoHideDuration` from `createShowSnackbar` utility (now handled by provider default)
- Consider adding `dense` prop to `SnackbarProvider` for tighter mobile spacing

## Sources & References

- Linear ticket: [NES-1466](https://linear.app/jesus-film-project/issue/NES-1466/snackbar-behaviour-observations-and-questions)
- Parent ticket: [NES-1452](https://linear.app/jesus-film-project/issue/NES-1452/fix-chat-editor-only-renders-1-of-2-custom-chat-buttons)
- Precedent fix: commit `c9f9f97d8` — "fix: media screen snackbar settings #8769"
- Existing utility: `apps/journeys-admin/src/components/MuxVideoUploadProvider/utils/showSnackbar/showSnackbar.tsx`
- Provider config: `apps/journeys-admin/pages/_app.tsx:118-123`
- [Material Design 3 — Snackbar Guidelines](https://m3.material.io/components/snackbar/guidelines) (4-10s recommended duration)
- [Notistack API Reference](https://notistack.com/api-reference) (action prop, closeSnackbar, autoHideDuration)
- [WCAG 2.2.1 Timing Adjustable](https://www.w3.org/WAI/WCAG21/Understanding/timing-adjustable.html) (pause on hover/focus)
- [Notistack Issue #156](https://github.com/iamhosseindhv/notistack/issues/156) — global close button feature request (resolved in v3)
