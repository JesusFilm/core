# I18n `t` Function

## Overview

The `t` function, an integral part of the `useTranslation` hook in internationalization (i18n), plays a crucial role in managing translations within your project. This function dynamically retrieves translated content based on the specified key.

## How to Use

### Basic Usage

To integrate translation into your React component, leverage the `useTranslation` hook from 'react-i18next,' providing access to the `t` function for text translation. Here's a quick example:

```jsx
import { useTranslation } from 'next-i18next'

function Component() {
  const { t } = useTranslation('apps-journeys-admin') // include a namespace
  return <div>{t('Next Steps')}</div>
}
```

In this example, the `t` function wraps the text intended for translation. Ensure to include a namespace, which should be a dashed version of your project path (e.g., `apps/journeys` becomes `apps-journeys`).

#### Translations File Example (`/libs/locales/en/apps-journeys-admin.json`):

```json
{
  "Next Steps": "Next Steps"
  // other translations...
}
```

Don't forget to run the `nx` command `extract-translations` for the project to gather all strings requiring translations into a namespaced file.

### Interpolation

The `t` function supports interpolation (parameterized translations), allowing you to include placeholders in your translation strings and replace them dynamically.

```jsx
import { useTranslation } from 'next-i18next'

function Component() {
  const { t } = useTranslation('apps-journeys-admin') // include a namespace
  const itemValue = 5
  // Some logic here
  return <div>{t('{{ value }} of an item', { value: itemValue })}</div>
}
```

#### Translations File Example (`/libs/locales/en/apps-journeys-admin.json`):

```json
{
  "{{ value }} of an item": "{{ value }} of an item"
}
```

## What Not to Do

### Avoiding Template Literal Misuse

```jsx
// Incorrect: Avoid using template literals directly in the t function
const incorrectTranslation = t(`js variable here: ${name}`)
```

Explanation: Embedding JavaScript variables directly using template literals within the `t` function can lead to unpredictable behavior. Use interpolation with appropriate placeholders for a safer and more predictable outcome.

### Incorrect Usage of Multiple `t` Calls Within JSX

```jsx
// Incorrect: Avoid nesting multiple t calls without proper structure
{t('this is')}<strong>{t('special')}</strong>{t('test')}
```

Explanation: Nesting multiple `t` calls within JSX without a clear structure can result in translation inconsistencies. Prefer interpolation or the `<Trans>` component for complex scenarios involving HTML tags.

## `Trans` Component

The `Trans` component is another tool for handling translations, especially useful for complex scenarios or when incorporating HTML tags into translations.

For simple text translations without React/HTML nodes integration and text formatting, you typically won't need it. In most cases, rely on the traditional `t` function.

### Basic Usage with Parameterized `Trans`

When using the `Trans` component in JSX, especially with components like Material-UI Typography, it's advisable to use `{'{{ variable }}'}` to prevent potential JSX interpretation issues. This ensures correct placeholder interpretation within JSX. Alternatively, you can use the literal string as follows: `{{ variable }}`.

```jsx
import { useTranslation, Trans } from 'next-i18next'

function MyComponent() {
  const { t } = useTranslation('app-journeys-admin')
  const count = 4
  return (
    <Trans t={t} count={count}>
      <Typography variant="body2" color="secondary.light">
        Appears on <span style={{ fontWeight: 'bold' }}>{'{{ count }}'}</span> card
      </Typography>
    </Trans>
  )
}
```

#### Translations File Example (`/libs/locales/en/apps-journeys-admin.json`):

```json
{
  "<0>Appears on <2>{{ count }}</2> card</0>_one": "<0>Appears on <2>{{ count }}</2> card</0>"
  // other translations...
}
```

In this adjusted example, the `Trans` component is used for a parameterized translation without the `t` function.

Both the `t` function and `Trans` component are powerful tools for handling translations. Understanding their effective use will enhance your ability to create a multilingual and user-friendly application. Refer to the actual documentation of [useTranslations](https://react.i18next.com/latest/usetranslation-hook) and [Trans component](https://react.i18next.com/latest/trans-component) for a deeper understanding.
