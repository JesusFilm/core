---
paths:
  - 'apps/arclight/src/**/*.{ts,tsx}'
  - 'apps/cms/src/**/*.{ts,tsx}'
  - 'apps/docs/src/**/*.{ts,tsx}'
  - 'apps/journeys/src/**/*.{ts,tsx}'
  - 'apps/journeys-admin/src/**/*.{ts,tsx}'
  - 'apps/player/src/**/*.{ts,tsx}'
  - 'apps/resources/src/**/*.{ts,tsx}'
  - 'apps/short-links/**/*.{ts,tsx}'
  - 'apps/video-importer/**/*.{ts,tsx}'
  - 'apps/videos-admin/src/**/*.{ts,tsx}'
  - 'apps/watch/src/**/*.{ts,tsx}'
---

## Stack

- ReactJS
- NextJS
- TypeScript
- MUI (Material UI)
- Apollo Client
- Gql.tada

## Code Guidelines

- Always use MUI components over raw HTML elements; avoid writing custom CSS or bare HTML tags.
- Use early returns whenever possible to reduce nesting and improve readability.
- Name event handler functions with a `handle` prefix (e.g. `handleClick`, `handleKeyDown`).
- Implement accessibility on all interactive elements: `tabIndex`, `aria-label`, `onClick`, `onKeyDown`.
- Use descriptive variable and function/const names.

## Testing Guidelines

- Use `@testing-library/react` for all frontend tests.
