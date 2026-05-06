---
title: 'fix: guest customize header layout, visibility, and locale issues (NES-1526)'
type: fix
status: active
date: 2026-04-08
---

# fix: Guest Customize Header — Layout, Visibility, and Locale Issues (NES-1526)

## Overview

The guest customize header (introduced in `9c951c86e0`) has several issues that need fixing:
a leftover sidebar space on desktop, mobile-only visibility, wrong icon layout, and a
potential locale-switching bug. This plan addresses all four UI fixes plus the locale investigation.

## Problem Statement

1. **White sidebar ghost space**: `PageWrapper` always renders a 72px-wide `Box` for the navbar
   even when `showNavBar={false}`, leaving a white bar on the left of the customize page for guests.
2. **Header hidden on desktop**: `GuestCustomizeHeader` uses `display: { md: 'none' }` so it
   only shows on mobile.
3. **Wrong left icon**: A Home4 icon is shown on the left instead of the logo; the logo sits
   centered. Per Figma, the logo should be top-left and link to `/`.
4. **Language button shows locale text**: The button displays a globe + 2-letter code (e.g. "EN").
   Per Figma, it should be a globe icon only.
5. **Locale switching may not work**: Changing language in the LanguageSwitcher might not
   actually switch the page content — possible that translations aren't loaded or the router
   push isn't triggering correctly for guests.

## Implementation Plan

### Task 1 — Fix sidebar ghost space in PageWrapper

**File:** `apps/journeys-admin/src/components/PageWrapper/PageWrapper.tsx`
**Lines 89-107**

The outer `Box` wrapping `NavigationDrawer` always has `minWidth: navbar.width` (72px).
When `showNavBar` is false, this box should collapse to 0 width.

```tsx
// Before (line 89-93):
<Box
  sx={{
    minWidth: navbar.width,
    backgroundColor: backgroundColor ?? 'background.default'
  }}
>

// After:
<Box
  sx={{
    minWidth: showNavBar ? navbar.width : 0,
    backgroundColor: backgroundColor ?? 'background.default'
  }}
>
```

Also fix the main content width calculation on **line 147** which always subtracts
`navbar.width`. When `showNavBar` is false, it should use `100vw`:

```tsx
// Before:
width: { xs: 'inherit', md: `calc(100vw - ${navbar.width})` }

// After:
width: { xs: 'inherit', md: showNavBar ? `calc(100vw - ${navbar.width})` : '100vw' }
```

Same for **line 164-167** (sidePanel width calc).

### Task 2 — Show GuestCustomizeHeader on desktop

**File:** `apps/journeys-admin/src/components/TemplateCustomization/GuestCustomizeHeader/GuestCustomizeHeader.tsx`

Remove the `md: 'none'` breakpoint restrictions:

- **Line 39**: Remove `sx={{ display: { md: 'none' } }}` from outer `Box` (or remove the Box entirely)
- **Line 44**: Remove `display: { xs: 'flex', md: 'none' }` from `AppBar`

The header should display on all screen sizes. Consider using `position: 'sticky'` on desktop
instead of `fixed` to avoid overlapping content, since `PageWrapper` only adds top padding
(`pt: toolbar.height`) on `xs` breakpoint.

### Task 3 — Replace home icon with logo in top-left

**File:** `GuestCustomizeHeader.tsx`

- Remove the `Home4Icon` import and the home `IconButton` (lines 52-59)
- Move the logo `Image` from the center column to the left column
- Make the logo clickable (wrap in a link or button that navigates to `/`)
- Remove the center column entirely (it becomes empty)
- Use a two-column layout: logo left, globe right

```tsx
// Left: Logo linking to /
<Stack direction="row" flexGrow={1} justifyContent="left">
  <IconButton onClick={handleHomeClick} aria-label="home" disableRipple>
    <Image src={taskbarIcon} width={32} height={32} alt="Next Steps" />
  </IconButton>
</Stack>

// Right: Globe button
<Stack direction="row" flexGrow={0} justifyContent="right">
  {/* globe button */}
</Stack>
```

### Task 4 — Globe icon only (no locale text)

**File:** `GuestCustomizeHeader.tsx`

Remove the `Typography` element showing `currentLanguageCode` (lines 86-91).
Adjust the button dimensions to be square/circular for a globe-only icon:

```tsx
<IconButton
  size="large"
  edge="start"
  onClick={handleLanguageOpen}
  aria-label="language"
  sx={{
    border: '1.75px solid',
    borderColor: 'secondary.dark',
    borderRadius: '50%',
    height: 32,
    width: 32
  }}
>
  <LanguageIcon sx={{ fontSize: 18, color: 'secondary.dark' }} />
</IconButton>
```

Remove the `currentLanguageCode` variable since it's no longer needed.

### Task 5 — Investigate locale switching

**Files to check:**

- `apps/journeys-admin/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
- `apps/journeys-admin/pages/templates/[journeyId]/customize.tsx` (getServerSideProps)
- `apps/journeys-admin/src/libs/initAndAuthApp/initAndAuthApp.ts`
- `apps/journeys-admin/next-i18next.config.js`

**Investigation points:**

1. **Cookie format**: `NEXT_LOCALE=00004---${languageCode}` uses a custom fingerprint format.
   Verify Next.js reads this correctly — by default, Next.js expects `NEXT_LOCALE=en` without
   a fingerprint prefix. Check if there's middleware that strips the fingerprint.

2. **Server-side translation loading**: `initAndAuthApp` loads translations via
   `serverSideTranslations(locale ?? 'en', [...])`. If `ctx.locale` isn't being set correctly
   from the cookie, it will always load `'en'`.

3. **Router locale prop**: `router.push(path, path, { locale: languageCode })` should trigger
   a full page navigation with the new locale. Verify this is happening (not a shallow push).

4. **Guest anonymous user flow**: When `makeAccountOnAnonymous: true`, an anonymous Firebase
   account is created. Check if the auth flow is interfering with the locale cookie or causing
   a redirect that loses the locale parameter.

### Task 6 — Update tests

**File:** `GuestCustomizeHeader.spec.tsx`

Update existing tests to reflect the new layout:

- Remove test for home button (replaced by logo click)
- Add test for logo click navigating to `/`
- Update test for language button (no locale text displayed)
- Add test that component renders on all breakpoints (no `md: 'none'`)

## Acceptance Criteria

- [ ] No white space on the left of the customize page for guest users on desktop
- [ ] `GuestCustomizeHeader` visible on both mobile and desktop
- [ ] Logo (taskbar icon) in top-left position, navigates to `/` on click
- [ ] Language button shows globe icon only, no locale text
- [ ] Language switching works correctly for guest users
- [ ] All existing tests updated and passing
- [ ] No regressions for authenticated user customize flow

## Files to Modify

| File                                                                                                          | Change                                             |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `apps/journeys-admin/src/components/PageWrapper/PageWrapper.tsx`                                              | Conditional navbar width                           |
| `apps/journeys-admin/src/components/TemplateCustomization/GuestCustomizeHeader/GuestCustomizeHeader.tsx`      | Desktop visibility, logo layout, globe-only button |
| `apps/journeys-admin/src/components/TemplateCustomization/GuestCustomizeHeader/GuestCustomizeHeader.spec.tsx` | Update tests                                       |

## Sources

- Linear issue: [NES-1526](https://linear.app/jesus-film-project/issue/NES-1526/wrong-header-for-guests)
- PR: [#8965](https://github.com/JesusFilm/core/pull/8965)
- Prior commits: `9c951c86e0`, `28373b90bc`
