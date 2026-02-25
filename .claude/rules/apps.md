---
paths:
  - "apps/**/*.{ts,tsx}"
  - "apps/**/*.{js,jsx}"
---

# Apps Rules

Applies to all apps **except** `apps/watch-modern` (which has its own rules).

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
