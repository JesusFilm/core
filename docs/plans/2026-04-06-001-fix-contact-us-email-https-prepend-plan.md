---
title: 'fix: Stop https:// being prepended to email fields in template customization Links screen'
type: fix
status: active
date: 2026-04-06
ticket: NES-1451
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

**1a. Modify `handleLinkBLur` signature and logic (lines 70-75)**

```typescript
function handleLinkBLur(e: React.FocusEvent<HTMLInputElement>, linkType: 'url' | 'email' | 'chatButtons'): void {
  const { name, value } = e.target
  if (!value) return

  if (linkType === 'email') {
    // Strip mailto: prefix if user pasted it — store bare email only
    const bare = value.startsWith('mailto:') ? value.slice(7) : value
    void setFieldValue(name, bare.trim())
    return
  }

  // URL and chatButtons: prepend https:// if no protocol present
  const url = /^\w+:\/\//.test(value) ? value : `https://${value}`
  void setFieldValue(name, url)
}
```

**1b. Update onBlur binding for chatButtons TextField (line 215)**

```diff
- onBlur={handleLinkBLur}
+ onBlur={(e) => handleLinkBLur(e, 'chatButtons')}
```

**1c. Update onBlur binding for catch-all TextField (line 279)**

```diff
- onBlur={handleLinkBLur}
+ onBlur={(e) => handleLinkBLur(e, link.linkType as 'url' | 'email')}
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
+   placeholder={link.linkType === 'email' ? t('email@example.com') : t('https://example.com')}
    value={values?.[fieldName] ?? ''}
    onChange={handleChange}
```

#### File 2: `LinksScreen.tsx` — Sanitize corrupted initial values

**Path:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LinksScreen/LinksScreen.tsx`

**2a. Sanitize email values in `initialValues` reducer (lines 264-265)**

Users who previously saved through the buggy flow may have `https://info@church.com` stored. With `validateOnMount: true`, these corrupt values would immediately show errors the user didn't cause.

```diff
  } else {
-   acc[link.id] = link.url ?? ''
+   const raw = link.url ?? ''
+   // Strip https:// from email fields to recover values corrupted by the old onBlur bug
+   acc[link.id] =
+     link.linkType === 'email' && raw.startsWith('https://')
+       ? raw.replace(/^https?:\/\//, '')
+       : raw
  }
```

#### File 3: `LinksForm.spec.tsx` — New tests

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

| Scenario                           | Input                     | Link Type   | onBlur Result                        | Notes                                      |
| ---------------------------------- | ------------------------- | ----------- | ------------------------------------ | ------------------------------------------ |
| Normal email                       | `info@church.com`         | email       | `info@church.com` (unchanged)        | Core fix                                   |
| Email with mailto:                 | `mailto:info@church.com`  | email       | `info@church.com` (stripped)         | Normalize to bare address                  |
| Email with leading/trailing spaces | `info@church.com`         | email       | `info@church.com` (trimmed)          | Prevents validation mismatch               |
| Empty email                        | ``                        | email       | no-op (early return)                 | Existing behavior preserved                |
| Corrupted stored email             | `https://info@church.com` | email       | `info@church.com` (stripped on load) | initialValues sanitization                 |
| Normal URL                         | `example.com`             | url         | `https://example.com`                | Existing behavior preserved                |
| URL with protocol                  | `https://example.com`     | url         | `https://example.com`                | Existing behavior preserved                |
| URL with http://                   | `http://example.com`      | url         | `http://example.com`                 | Existing behavior preserved                |
| Chat button URL                    | `wa.me/123`               | chatButtons | `https://wa.me/123`                  | Existing behavior preserved                |
| Phone field                        | `+15551234`               | phone       | N/A                                  | Uses PhoneField, never hits handleLinkBLur |

| Email field shows placeholder | ``| email | Shows `email@example.com` | Communicates expected format |
| URL field shows placeholder |`` | url | Shows `https://example.com` | Communicates expected format |

## Out of Scope

- **URL fields with `mailto:` typed in them** — extremely unlikely and the regex handles it adequately for URL contexts
- **Trimming for URL/chatButton fields** — submit handler already trims; adding it to onBlur would change existing behavior
- **Database migration to clean corrupted emails** — the initialValues sanitization handles this at the UI layer; a data migration is not justified for this low-volume edge case

## Acceptance Criteria

- [ ] Email field in Links screen accepts plain email addresses without `https://` prepend
- [ ] Email field with `mailto:` pasted is normalized to bare address on blur
- [ ] Email field with leading/trailing spaces is trimmed on blur
- [ ] URL fields still get `https://` prepended on blur (no regression)
- [ ] ChatButton fields still get `https://` prepended on blur (no regression)
- [ ] Previously corrupted email values (with `https://`) are sanitized when loaded into the form
- [ ] Email fields show `email@example.com` placeholder when empty
- [ ] URL fields show `https://example.com` placeholder when empty
- [ ] All new test cases pass
- [ ] Existing tests continue to pass

## Files to Modify

| File                                                                                                                      | Change                                                                      |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LinksScreen/LinksForm/LinksForm.tsx`      | Modify `handleLinkBLur` to accept `linkType`, update both `onBlur` bindings |
| `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LinksScreen/LinksScreen.tsx`              | Sanitize corrupted email values in `initialValues` reducer                  |
| `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LinksScreen/LinksForm/LinksForm.spec.tsx` | Add 4 new test cases for email blur behavior                                |

## Sources

- Linear ticket: [NES-1451](https://linear.app/jesus-film-project/issue/NES-1451)
- Related ticket: [NES-1265](https://linear.app/jesus-film-project/issue/NES-1265) — Create guest navigation screen (Done)
- Editor EmailAction pattern (reference for correct email handling): `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/EmailAction/EmailAction.tsx`
