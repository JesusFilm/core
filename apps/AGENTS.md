# Apps — shared frontend conventions

Applies to the React/Next.js apps. `apps/video-importer` is a Node/tsx CLI, not React — see its own AGENTS.md.

## Stack

- ReactJS
- NextJS
- TypeScript
- MUI (Material UI)
- Apollo Client
- Gql.tada

## Code Guidelines

- Always use MUI components over raw HTML elements; avoid writing custom CSS or bare HTML tags. Use `styled()` for custom styling rather than Tailwind or shadcn/ui.
- Use early returns whenever possible to reduce nesting.
- Prefer dynamic imports for heavy or below-the-fold components.
- Name event handler functions with a `handle` prefix (e.g. `handleClick`, `handleKeyDown`).
- Components return `ReactElement`.
- Implement accessibility on all interactive elements: `tabIndex`, `aria-label`, `onClick`, `onKeyDown`.

## Testing Guidelines

- Use `@testing-library/react` for all frontend tests.
- Don't add unit tests for static-config edits (nav arrays, feature-flag defaults, role-permission maps, route tables, copy strings) — such tests read the same data the component reads and only fail when the config is intentionally edited, so they duplicate the diff rather than catch regressions. Trust the existing component-behavior tests, diff review, and manual QA on the preview. Exception: add a test when the config drives branching logic, has a non-obvious transformation, or has caused real prior regressions.
