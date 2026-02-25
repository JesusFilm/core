---
paths:
  - 'apps/watch-modern/**/*'
---

# Watch-Modern Rules

## Stack

- ReactJS
- NextJS
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Apollo Client
- Gql.tada

## Code Guidelines

- Prefer `shadcn/ui` components over custom implementations or raw HTML elements.
  If a shadcn/ui component doesn't exist, use semantic HTML + Tailwind CSS and document the reason.
- Use early returns whenever possible to reduce nesting and improve readability.
- Name event handler functions with a `handle` prefix (e.g. `handleClick`, `handleKeyDown`).
- Implement accessibility on all interactive elements: `tabIndex`, `aria-label`, `onClick`, `onKeyDown`.
- All components and functions must be fully typed with TypeScript.
- Use descriptive variable and function/const names.

## Testing Guidelines

- Use `@testing-library/react` for all frontend tests.

## Documentation Guidelines

- All components must have JSDoc comments including prop documentation and usage examples.
- Keep documentation in sync with code changes.
