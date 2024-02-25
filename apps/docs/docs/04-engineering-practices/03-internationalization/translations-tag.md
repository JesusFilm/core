# I18n `t` Function

## Overview

The `t` function, part of the `useTranslation` hook in internationalization (i18n), is a key element for handling translations in your project. This function is crucial for dynamically retrieving translated content based on the specified key.

## How to Use

### Basic Usage

To enable translation in your React component, use the `useTranslation` hook from 'react-i18next'. This hook provides a `t` function for translating text. Here's a quick example:

```jsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation('apps-journeys-admin') // must include namespace
  return <div>{t('Next Steps')}</div>
}
```

In this example, the `t` function is used to wrap the text you want to be translated. **It is very important that you include a namespace**. This namespace should be a dashed version of your project path. For example `apps/journeys` would become `apps-journeys` or `libs/journeys/ui` would become `libs-journeys-ui`.

#### Translations File Example (`/libs/locales/en/apps-journeys-admin.json`):

```json
{
  "Next Steps": "Next Steps"
  // other translations...
}
```

Don't forget to run nx command `extract-translations` for the project you are working on. This should pull all of the strings requiring translations into a namespaced file.

### Parameterized Translations

The `t` function supports parameterized translations. You can include placeholders in your translation strings and replace them dynamically.

```jsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation('apps-journeys-admin') // must include namespace
  const itemValue = 5
  return <div>t('{{ value }} of an item', { value: itemValue })</div>
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

Explanation: Embedding JavaScript variables directly using template literals within the `t` function can lead to unpredictable behavior. It is recommended to use parameterized translations with the appropriate placeholders for a safer and more predictable outcome.

### Incorrect Usage of Multiple `t` Calls Within JSX

```jsx
// Incorrect: Avoid nesting multiple t calls without proper structure
{t('this is')}<strong>{t('special')}</strong>{t('test')}
```

Explanation: Nesting multiple `t` calls within JSX without a clear structure can result in translation inconsistencies and make it challenging to manage and maintain the code. Prefer using parameterized translations or the `<Trans>` component for complex scenarios involving HTML tags.

## `Trans` Component

The `Trans` component is another tool for handling translations, particularly useful for handling more complex translation scenarios or when you need to include HTML tags within your translations.

As long as your sentence doesn't involve the integration of React/HTML nodes into a coherent structure, and you're not incorporating text formatting elements like strong, em, link components, or similar, you typically won't require it. In most cases, you'll be relying on the traditional t function.

### Basic Usage with Parameterized `Trans`

When using the Trans component with JSX, especially in conjunction with components like Material-UI Typography, it's advisable to employ {'{{ variable }}'} to prevent potential JSX interpretation issues. This ensures correct placeholder interpretation within JSX. Alternatively, you can use the literal string as is: {{ variable }}.

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

In this modified example, the `Trans` component is used for a parameterized translation without the t function. The translation file includes the complex translation string for reference.

The `t` function and `Trans` component are powerful tools for handling translations in your project. Understanding how to use them effectively will enhance your ability to create a multilingual and user-friendly application. Do refer to the actual documentation of [useTranslations](https://react.i18next.com/latest/usetranslation-hook) and [Trans component](https://react.i18next.com/latest/trans-component) for a deeper understanding.
