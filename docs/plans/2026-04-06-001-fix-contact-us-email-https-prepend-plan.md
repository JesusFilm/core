---
title: 'fix: Stop https:// being prepended to email fields in template customization Links screen'
type: fix
status: complete
date: 2026-04-06
ticket: NES-1451
pr: https://github.com/JesusFilm/core/pull/8950
---

# fix: Stop https:// being prepended to email fields in template customization Links screen

## Overview

When customizing a journey created from a template, the "Contact Us" email field on the Links screen auto-prepends `https://` to typed email addresses on blur. This produces invalid values like `https://info@yourchurch.com`, triggers browser/Formik validation errors, and blocks the user from proceeding.

## Problem Statement

The `handleLinkBLur` function in `LinksForm.tsx:70-75` blindly prepends `https://` to **all** field values that lack a protocol prefix, regardless of field type. Email fields should never receive a URL protocol prefix — they should store bare email addresses.

```typescript
// Current buggy code (LinksForm.tsx:70-75)
function handleLinkBLur(e: React.FocusEvent<HTMLInputElement>): void {
  const { name, value } = e.target
  if (!value) return
  const url = /^\w+:\/\//.test(value) ? value : `https://${value}`
  void setFieldValue(name, url)
}
```

This handler is bound at two places:

- **Line 215**: chatButtons TextField `onBlur` — correct behavior (chat URLs need `https://`)
- **Line 279**: catch-all TextField `onBlur` — **buggy for email fields** (covers both `url` and `email` linkTypes)

The bug is doubly harmful: it corrupts the value AND causes Formik's `.email()` validator to reject it.

## Proposed Solution

Make `handleLinkBLur` link-type-aware by accepting a `linkType` parameter. This follows the same pattern as `handlePlatformSelect` which already receives extra context via an inline arrow function.

### Changes

#### File 1: `LinksForm.tsx` — Primary fix

**Path:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LinksScreen/LinksForm/LinksForm.tsx`

**1a. Rename `handleLinkBLur` → `handleLinkBlur` and modify signature/logic (lines 70-75)**

```typescript
function handleLinkBlur(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  linkType: 'url' | 'email' | 'chatButtons'
): void {
  const { name, value } = e.target
  const trimmed = value.trim()
  if (!trimmed) return

  if (linkType === 'email') {
    const bare = trimmed.toLowerCase().startsWith('mailto:')
      ? trimmed.slice(7)
      : trimmed
    void setFieldValue(name, bare)
    return
  }

  const url = /^\w+:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`
  void setFieldValue(name, url)
}
```

Key decisions made during implementation:
- **Trim first, then normalize** — trimming after normalization let values like `" mailto:user@example.com "` bypass the `startsWith` check
- **Case-insensitive `mailto:` check** — uses `.toLowerCase().startsWith()` instead of regex for readability
- **Widen event type** to `HTMLInputElement | HTMLTextAreaElement` to match MUI TextField's `onBlur` callback type
- **Renamed from `handleLinkBLur`** (pre-existing typo) to `handleLinkBlur`

**1b. Update onBlur binding for chatButtons TextField (line 215)**

```diff
- onBlur={handleLinkBlur}
+ onBlur={(e) => handleLinkBlur(e, 'chatButtons')}
```

**1c. Update onBlur binding for catch-all TextField (line 279)**

```diff
- onBlur={handleLinkBlur}
+ onBlur={(e) => handleLinkBlur(e, link.linkType as 'url' | 'email')}
```

Note: The cast is safe because the only linkTypes that reach this branch are `'url'` and `'email'` — `'chatButtons'` and `'phone'` are handled by earlier branches in the render.

**1d. Add placeholder text to catch-all TextField (line 270+)**

Add a placeholder prop to communicate expected input format, matching the existing chatButtons pattern (`placeholder={t('Chat URL')}`):

```diff
  <TextField
    id={fieldName}
    name={fieldName}
    variant="filled"
    hiddenLabel
    fullWidth
    type={link.linkType === 'email' ? 'email' : 'text'}
+   placeholder={link.linkType === 'email' ? 'email@example.com' : 'https://example.com'}
    value={values?.[fieldName] ?? ''}
    onChange={handleChange}
```

#### ~~File 2: `LinksScreen.tsx` — Sanitize corrupted initial values~~ (Removed)

Initially planned to sanitize corrupted email values on load, but this was removed because:
- The editor's `EmailAction` component validates with `.email()` so `https://` can never be stored for an email action
- The bug itself blocked form submission (Formik rejected the corrupted value), so no corrupt data was ever persisted
- The sanitization was guarding against an impossible state

#### File 2: `LinksForm.spec.tsx` — New tests

**Path:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LinksScreen/LinksForm/LinksForm.spec.tsx`

Add the following tests:

**3a. Email field blur does NOT prepend `https://`**

```typescript
it('should not add https:// to email fields on blur', () => {
  const links: JourneyLink[] = [
    {
      id: 'email-1',
      linkType: 'email',
      url: '',
      label: 'Email Link',
      parentStepId: null,
      customizable: null
    }
  ]

  const setFieldValue = jest.fn()
  render(
    <Formik initialValues={{ 'email-1': '' }} onSubmit={jest.fn()}>
      {(formik) => (
        <FormikProvider value={{ ...formik, setFieldValue }}>
          <LinksForm links={links} onPlatformChange={jest.fn()} />
        </FormikProvider>
      )}
    </Formik>
  )

  const input = within(screen.getByLabelText('Edit Email Link')).getByRole(
    'textbox'
  )
  fireEvent.change(input, { target: { value: 'info@church.com' } })
  fireEvent.blur(input)
  expect(setFieldValue).toHaveBeenCalledWith('email-1', 'info@church.com')
})
```

**3b. Email field with `mailto:` prefix is normalized to bare address**

```typescript
it('should strip mailto: prefix from email fields on blur', () => {
  const links: JourneyLink[] = [
    {
      id: 'email-1',
      linkType: 'email',
      url: '',
      label: 'Email Link',
      parentStepId: null,
      customizable: null
    }
  ]

  const setFieldValue = jest.fn()
  render(
    <Formik initialValues={{ 'email-1': '' }} onSubmit={jest.fn()}>
      {(formik) => (
        <FormikProvider value={{ ...formik, setFieldValue }}>
          <LinksForm links={links} onPlatformChange={jest.fn()} />
        </FormikProvider>
      )}
    </Formik>
  )

  const input = within(screen.getByLabelText('Edit Email Link')).getByRole(
    'textbox'
  )
  fireEvent.change(input, {
    target: { value: 'mailto:info@church.com' }
  })
  fireEvent.blur(input)
  expect(setFieldValue).toHaveBeenCalledWith('email-1', 'info@church.com')
})
```

**3c. ChatButton field blur still prepends `https://`** (regression guard)

```typescript
it('should add https:// to chat button fields on blur', () => {
  const links: JourneyLink[] = [
    {
      id: 'chat-1',
      linkType: 'chatButtons',
      url: '',
      label: 'Chat Link',
      platform: MessagePlatform.whatsApp
    }
  ]

  const setFieldValue = jest.fn()
  render(
    <Formik initialValues={{ 'chat-1': '' }} onSubmit={jest.fn()}>
      {(formik) => (
        <FormikProvider value={{ ...formik, setFieldValue }}>
          <LinksForm links={links} onPlatformChange={jest.fn()} />
        </FormikProvider>
      )}
    </Formik>
  )

  const input = within(screen.getByLabelText('Edit Chat Link')).getByRole(
    'textbox'
  )
  fireEvent.change(input, { target: { value: 'wa.me/123' } })
  fireEvent.blur(input)
  expect(setFieldValue).toHaveBeenCalledWith('chat-1', 'https://wa.me/123')
})
```

**3d. Empty email field blur is a no-op**

```typescript
it('should not call setFieldValue on blur when email field is empty', () => {
  const links: JourneyLink[] = [
    {
      id: 'email-1',
      linkType: 'email',
      url: '',
      label: 'Email Link',
      parentStepId: null,
      customizable: null
    }
  ]

  const setFieldValue = jest.fn()
  render(
    <Formik initialValues={{ 'email-1': '' }} onSubmit={jest.fn()}>
      {(formik) => (
        <FormikProvider value={{ ...formik, setFieldValue }}>
          <LinksForm links={links} onPlatformChange={jest.fn()} />
        </FormikProvider>
      )}
    </Formik>
  )

  const input = within(screen.getByLabelText('Edit Email Link')).getByRole(
    'textbox'
  )
  fireEvent.blur(input)
  expect(setFieldValue).not.toHaveBeenCalled()
})
```

## Edge Cases Considered

| Scenario | Input | Link Type | onBlur Result | Notes |
|---|---|---|---|---|
| Normal email | `info@church.com` | email | `info@church.com` (unchanged) | Core fix |
| Email with mailto: | `mailto:info@church.com` | email | `info@church.com` (stripped) | Normalize to bare address |
| Email with MAILTO: | `MAILTO:info@church.com` | email | `info@church.com` (stripped) | Case-insensitive check |
| Email with leading/trailing spaces | ` info@church.com ` | email | `info@church.com` (trimmed) | Trim-first prevents validation mismatch |
| Spaces around mailto: | ` mailto:info@church.com ` | email | `info@church.com` (trimmed + stripped) | Trim before startsWith check |
| Empty email | `` | email | no-op (early return) | Existing behavior preserved |
| Whitespace-only | `   ` | email | no-op (early return) | Trim-first converts to empty |
| Normal URL | `example.com` | url | `https://example.com` | Existing behavior preserved |
| URL with protocol | `https://example.com` | url | `https://example.com` | Existing behavior preserved |
| URL with http:// | `http://example.com` | url | `http://example.com` | Existing behavior preserved |
| Chat button URL | `wa.me/123` | chatButtons | `https://wa.me/123` | Existing behavior preserved |
| Phone field | `+15551234` | phone | N/A | Uses PhoneField, never hits handleLinkBlur |
| Email placeholder | (empty) | email | Shows `email@example.com` | Not wrapped in `t()` — colon breaks i18next |
| URL placeholder | (empty) | url | Shows `https://example.com` | Not wrapped in `t()` — colon breaks i18next |

## Out of Scope

- **URL fields with `mailto:` typed in them** — extremely unlikely and the regex handles it adequately for URL contexts
- **Database migration to clean corrupted emails** — not needed; the editor validates with `.email()` so corrupted data was never persisted (the bug blocked form submission)
- **Sanitizing `initialValues` on load** — removed; same reasoning as above

## Acceptance Criteria

- [x] Email field in Links screen accepts plain email addresses without `https://` prepend
- [x] Email field with `mailto:` (case-insensitive) pasted is normalized to bare address on blur
- [x] All input values are trimmed before normalization (whitespace-only = no-op)
- [x] URL fields still get `https://` prepended on blur (no regression)
- [x] ChatButton fields still get `https://` prepended on blur (no regression)
- [x] Email fields show `email@example.com` placeholder when empty
- [x] URL fields show `https://example.com` placeholder when empty
- [x] Placeholders not wrapped in `t()` (colon in `https:` breaks i18next namespace separator)
- [x] All 23 new + existing test cases pass
- [x] CI type-check passes (widened event type to include `HTMLTextAreaElement`)

## Files Modified

| File | Change |
|---|---|
| `apps/journeys-admin/.../LinksForm/LinksForm.tsx` | Rename `handleLinkBLur` → `handleLinkBlur`, add `linkType` param, trim-first logic, case-insensitive mailto strip, widen event type, update `onBlur` bindings, add placeholders (not wrapped in `t()`) |
| `apps/journeys-admin/.../LinksForm/LinksForm.spec.tsx` | Add 8 new tests: email blur, mailto strip, whitespace-only, spaces-around-mailto, chatButton regression, email placeholder, URL placeholder, empty email |

## Sources

- Linear ticket: [NES-1451](https://linear.app/jesus-film-project/issue/NES-1451)
- Related ticket: [NES-1265](https://linear.app/jesus-film-project/issue/NES-1265) — Create guest navigation screen (Done)
- Editor EmailAction pattern (reference for correct email handling): `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/EmailAction/EmailAction.tsx`
