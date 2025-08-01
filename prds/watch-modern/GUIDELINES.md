# Watch-Modern Coding Guidelines

## Overview

This document outlines the coding standards, best practices, and development guidelines for the Watch-Modern application. These guidelines ensure consistent code quality, maintainability, and team collaboration.

## Technology Stack

### Core Technologies

- **ReactJS** - Frontend framework
- **NextJS** - Full-stack React framework
- **JavaScript/TypeScript** - Programming languages
- **HTML/CSS** - Markup and styling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **Gql.tada** - GraphQL type generation
- **Apollo Client** - GraphQL client

### Testing Stack

- **@testing-library/react** - Component testing
- **Jest** - Test framework and assertions
- **@testing-library/user-event** - User interaction testing
- **@testing-library/jest-dom** - Custom Jest matchers

## Critical Design Constraints

### UI Component Hierarchy

**CRITICAL CONSTRAINT**: Watch-modern must NEVER import or use MUI (@mui/material) components. This is a hard requirement.

**Component Priority Order**:

1. **Shadcn/ui components** - Primary choice for all UI needs
2. **Custom Tailwind components** - If shadcn/ui doesn't exist, build with Tailwind CSS
3. **Semantic HTML + Tailwind** - For basic elements when neither above applies

**NEVER use**: MUI components, styled-components, CSS modules, or any non-Tailwind styling approaches.

## Code Implementation Guidelines

### General Principles

- Follow the user's requirements carefully & to the letter
- Think step-by-step and describe your plan in pseudocode before implementation
- Write correct, best practice, bug-free, fully functional code
- Focus on easy and readable code
- Fully implement all requested functionality
- Leave NO todos, placeholders or missing pieces
- Ensure code is complete and thoroughly finalized
- Include all required imports and proper naming of key components

### Code Style Rules

- **Early Returns**: Use early returns whenever possible to make code more readable
- **Descriptive Naming**: Use descriptive variable and function/const names
- **Event Handlers**: Name event functions with "handle" prefix (e.g., `handleClick`, `handleKeyDown`)
- **TypeScript**: All components and functions must be fully typed with TypeScript
- **Type Definitions**: Define types when possible

### Component Development

#### Component Structure

- Define interfaces above the component function
- Use destructured props with default values
- Use i18next for all user-facing strings:
  - Import translation hook: `const { t } = useTranslation('apps-watch)`
  - Simple flat keys like `t('Share')`, `t('Contact')`
  - Translations get added as part of GitHub Actions workflow.

#### Props Patterns

- Use optional props with sensible defaults: `hideHeader = false`
- Include className prop for extensibility: `className?: string`
- Use ReactNode for children and content slots: `children?: ReactNode`
- Name interfaces with component name prefix: `ComponentNameProps`

#### React Best Practices

- Always include explicit React import: `import React from "react"`
- Use type-only imports for React types: `import type { ReactElement }`
- Maintain alphabetical import order per linter requirements

### Accessibility Requirements

- Implement accessibility features on all interactive elements
- Add appropriate attributes: `tabindex="0"`, `aria-label`, `on:click`, `on:keydown`
- Ensure proper keyboard navigation support
- Maintain WCAG compliance standards
- Include semantic HTML elements: `<header>`, `<main>`, `<footer>`

## Test-Driven Development (TDD)

### Critical Requirements

**CRITICAL REQUIREMENT**: All development must follow Test-Driven Development (TDD) methodology.

### TDD Process

**Red-Green-Refactor Cycle**: Always follow the three-step TDD cycle

1. **Red**: Write failing tests first before any implementation
2. **Green**: Write minimal code to make tests pass
3. **Refactor**: Improve code while maintaining test coverage

### TDD Rules

- **Test First**: Never write implementation code before corresponding tests exist
- **Existing Test Verification**: Before modifying existing code, run and verify all existing tests
- **Minimum Coverage**: Maintain 80% test coverage for all new code

### Testing Patterns

#### Component Testing Workflow

1. **Write test file first**: Create `ComponentName.spec.tsx` before `ComponentName.tsx`
2. **Test component rendering**: Verify component renders without crashing
3. **Test props and interactions**: Test all props, user interactions, and state changes
4. **Test accessibility**: Ensure proper ARIA labels, keyboard navigation, screen reader support
5. **Test responsive behavior**: Verify hide/show patterns and responsive classes

#### Test File Organization

- Place test files adjacent to components: `ComponentName.spec.tsx`
- Use descriptive test names: `should render header with correct brand text`
- Group related tests with `describe` blocks
- Use `beforeEach` for common setup, `afterEach` for cleanup

#### Example TDD Workflow

```typescript
// 1. RED: Write failing test first
describe('MyComponent', () => {
  it('should render with correct text', () => {
    render(<MyComponent text="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})

// 2. GREEN: Write minimal implementation
export function MyComponent({ text }: { text: string }) {
  return <div>{text}</div>
}

// 3. REFACTOR: Improve while maintaining tests
```

## Component Patterns

### Layout Components

#### Component Organization

- Export all components through index.ts files
- Use alphabetical order for imports and exports


#### CSS Class Patterns

- Use component classes from globals.css: `.container-standard`, `.responsive-padding`, `.space-between`
- Follow z-index system: `.z-header`, `.z-content`, `.z-modal`
- Use responsive patterns: `.hide-mobile`, `.show-mobile`

### React Component Structure

```typescript
import { ReactElement } from 'react'


interface ComponentNameProps {
  prop1: string
  prop2?: boolean
  className?: string
  children?: ReactNode
}

export function ComponentName({ 
  prop1, 
  prop2 = false, 
  className = '',
  children 
}: ComponentNameProps): ReactElement {
  // Extract constants for text content
  const BUTTON_TEXT = 'Click me'
  
  // Event handlers with handle prefix
  const handleClick = () => {
    // Implementation
  }
  
  return (
    <div className={`base-classes ${className}`}>
      {children}
    </div>
  )
}
```

## Documentation Guidelines

### Documentation Structure

Use a simple documentation approach with just TypeScript types and occasional inline comments.

## Development Workflow

### File Structure

```
apps/watch-modern/
├── src/
│   ├── components/
│   │   ├── ComponentName/
│   │   │   ├── ComponentName.tsx           # Implementation
│   │   │   ├── ComponentName.spec.tsx      # Tests (co-located)
│   │   │   └── index.ts                    # Exports
│   │   └── index.ts                        # Main component exports
│   └── app/
│       └── page.tsx                        # Page integration
```

### Component Naming Conventions

Components should follow a consistent naming pattern based on their type/category to improve organization and discoverability:

- **Pages**: Prefix with 'Page'
  - PageHome
  - PageVideo  
  - PageCollection
  - PageSearch
  - PageSettings

- **Dialogs/Modals**: Prefix with 'Dialog'
  - DialogConfirm
  - DialogShare
  - DialogSettings

- **Sections**: Prefix with 'Section'
  - SectionHeader
  - SectionFooter 
  - SectionHero
  - SectionFeatures

- **Layout Components**: Prefix with 'Layout'
  - LayoutDefault
  - LayoutFullWidth
  - LayoutSidebar

This semantic grouping helps both human developers and AI assistants quickly understand a component's purpose and find related components.

### Essential Commands

**⚠️ CRITICAL: Always run commands from `/workspaces/core/` directory (the nx workspace root)**

#### Dev Server Management
- Always check if dev server is running before starting a new one
- Use: `lsof -ti:4800` to check if port 4800 is in use
- If running, provide the URL instead of starting a new server

##### Dev Server Testing Protocol
- After starting dev server, ALWAYS navigate to the page being worked on
- Use: `curl -s http://localhost:4800/[page-path]` to trigger compilation
- For shaping pages: `curl -s http://localhost:4800/watch/shaping/[specific-path]`
- For other pages: `curl -s http://localhost:4800/watch/[specific-path]`
- Check dev server output for compilation errors after navigation
- Wait for compilation to complete before proceeding

```bash
# Development server for watch-modern (alsways check existing state before taking actions using Dev Server Management andDev Server Testing Protocol)
cd /workspaces/core && nx run watch-modern:serve --port 4200

# Testing specific component
cd /workspaces/core && npm test watch-modern -- --testNamePattern="ComponentName"

# Full test suite
cd /workspaces/core && npm test watch-modern

# Build verification
npm run build watch-modern
```

### Development Server Compilation Procedures

**⚠️ CRITICAL: Always wait for compilation to complete before continuing**

When starting the development server, follow this **mandatory waiting procedure**:

#### 1. Start Server and Wait
```bash
cd /workspaces/core && nx run watch-modern:serve --port 4200
```

#### 2. Watch for Compilation Status
**DO NOT PROCEED** until you see one of these outcomes:

✅ **SUCCESS INDICATORS**:
```bash
✓ Starting...
✓ Ready in Xs        # Server compiled successfully
- Local: http://localhost:4200
```

❌ **ERROR INDICATORS** (Must fix before continuing):
```bash
⨯ ./src/components/ComponentName.tsx
Error: [Compilation error details]
```

#### 3. Verify Server Status
**Only after seeing "Ready in Xs":**
- ✅ **Continue** with development tasks
- ✅ **Navigate** to browser for testing
- ✅ **Run** additional commands

**If errors appear:**
- ❌ **STOP** all other activities
- ❌ **Fix** compilation errors first
- ❌ **Wait** for successful recompilation before proceeding

#### 4. Common Compilation Fixes

### Server-First Architecture Compliance

When fixing compilation errors, maintain these principles:

- **Minimize Client Components**: Only use `'use client'` when absolutely necessary
- **Interactive State Only**: useState/useEffect only for true interactivity
- **Prefer Server Rendering**: Keep static content on server when possible

**For troubleshooting and common issues, see [LEARNINGS.md](./LEARNINGS.md)**

### Git Workflow

- Let the human user handle all git operations including commits, branches, and PRs
- Focus on code generation and suggestions only
- Do not attempt to create, modify or interact with git directly
- When suggesting changes that span multiple files, clearly indicate all affected files
- For complex changes, break down into logical commits the user can make
- Advice the user when to commit new changes

## Performance Guidelines

### Server-First Architecture

- **Minimize Client Components**: Only use `"use client"` when absolutely necessary
- **Prefer Server Components**: Static content rendering on server for better performance
- **Link-Based Navigation**: Use Next.js `<Link>` instead of `onClick` handlers where possible
- **SEO Optimization**: Server-side rendering improves content discoverability
- **Progressive Enhancement**: Ensure core functionality works without JavaScript
  - Server-side render all critical content and navigation
  - Use semantic HTML forms with proper action/method attributes
  - Implement graceful fallbacks for interactive features

### Optimization Strategies

- **Static Content**: Render content cards, headers, and layout on server
- **Client Boundaries**: Minimal, only for true interactivity (forms, state, browser APIs)
- **Navigation**: Link-based routing for content discovery
- **Image Optimization**: Next.js Image component with proper loading strategies
- **Bundle Optimization**: Tree-shaking and code splitting

## Integration Patterns

### Layout Integration

- Use semantic HTML elements: `<header>`, `<main>`, `<footer>`
- Apply z-index classes semantically: `.z-header`, `.z-content`
- Use container and responsive padding patterns consistently
- Implement responsive behavior


## References

- **[LEARNINGS.md](./LEARNINGS.md)** - Troubleshooting guide and lessons learned from development sessions

---

**Applies To**: Watch-Modern Application

This document should be updated as new patterns and guidelines are established during development. 