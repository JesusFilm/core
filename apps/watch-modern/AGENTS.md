# Watch-Modern App Agent Guide

## Context & stack

- **Location:** `apps/watch-modern` in the Nx monorepo (Next.js App Router).
- **Tech:** React, TypeScript, Apollo Client with generated GraphQL types, `next-i18next` for localization, Tailwind CSS + shadcn/ui primitives.
- **Design direction:** Modern shadcn/Tailwind implementation with App Router architecture.

## Critical Coding Rules

### Tailwind CSS Dynamic Classes Restriction

**🚫 NEVER use dynamic Tailwind class names with JavaScript variables**

Tailwind CSS purging happens at build time and cannot detect classes constructed with variables. This will cause styles to not be included in the final CSS bundle.

**❌ WRONG - Will not work:**
```tsx
className={`duration-${ANIMATION_DURATION} scale-[${BOUNCE_SCALE}] translate-y-[${BOUNCE_DISTANCE}px]`}
```

**✅ CORRECT - Use inline styles or CSS custom properties:**
```tsx
// Option 1: Inline styles
style={{
  animationDuration: `${ANIMATION_DURATION}ms`,
  transform: `scale(${BOUNCE_SCALE}) translateY(${BOUNCE_DISTANCE}px)`
}}

// Option 2: CSS custom properties (requires CSS variables)
className="duration-[var(--animation-duration)] scale-[var(--bounce-scale)] translate-y-[var(--bounce-distance)]"
```

**✅ CORRECT - Static classes only:**
```tsx
className="duration-500 scale-95 translate-y-[300px]" // ✅ All static, build-time detectable
```

**Why this matters:** Dynamic class names like `duration-${variable}` are invisible to Tailwind's static analysis, resulting in missing styles and broken animations.

## Workspace setup

1. Install dependencies: `pnpm install` (pnpm is the required package manager).
2. Start dev server: `pnpm dlx nx run watch-modern:serve`

## Coding standards

- All components and functions must be fully typed with TypeScript.
- Prefer shadcn/ui components over custom implementations.
- Use descriptive variable and function names.
- Event functions should be prefixed with "handle".
- Implement accessibility features on all interactive elements.
- Export all components through index.ts files.
- Use alphabetical order for imports and exports.

## Testing expectations

- Use @testing-library/react for component testing.
- Focus on rendering, props, interactions, accessibility, and conditional logic.
- Co-locate specs under `*.spec.tsx` files.

## Quality gates

- Format check: `pnpm run prettier`
- Type-check: `pnpm dlx nx run watch-modern:type-check`
- Unit tests: `pnpm dlx nx run watch-modern:test`
