# Watch App Coding Guidelines

## Overview

This document outlines the coding standards and development guidelines for the existing Watch application. These guidelines ensure consistent code quality and maintainability for the current production Watch site.

## Technology Stack

### Core Technologies

- **ReactJS** - Frontend framework
- **NextJS** - Full-stack React framework  
- **JavaScript/TypeScript** - Programming languages
- **Material UI (MUI)** - Component library
- **GraphQL** - API query language
- **Apollo Client** - GraphQL client

### Styling

- **Material UI Components** - Primary UI component library
- **CSS Modules** - Component-specific styling
- **Custom CSS** - Global styles and overrides

## Code Implementation Guidelines

### General Principles

- Follow established Material UI design patterns
- Maintain consistency with existing component architecture
- Use TypeScript for type safety where applicable
- Follow existing file organization patterns

### Component Development

#### Component Structure

- Use Material UI components as primary building blocks
- Follow existing PageWrapper and layout patterns
- Maintain consistent prop interfaces
- Include proper TypeScript typing

#### File Organization

```
apps/watch/src/
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.spec.tsx (if applicable)
│   │   └── index.ts
│   └── PageWrapper/           # Shared layout components
├── pages/                     # Next.js pages
└── styles/                    # Global styles
```

### Material UI Patterns

- Use MUI Stack, Container, and Grid components for layout
- Follow established spacing and breakpoint patterns
- Maintain consistent typography scale
- Use MUI theme system for colors and spacing

### Development Workflow

#### Essential Commands

**⚠️ CRITICAL: Always run commands from `/workspaces/core/` directory**

```bash
# Development server for watch
cd /workspaces/core && nx run watch:serve

# Testing
npm test watch

# Build verification  
npm run build watch
```

#### File Structure

- Follow existing component organization in `apps/watch/src/components/`
- Use established layout patterns from `PageWrapper` and related components
- Maintain consistency with existing styling approaches

## Integration Patterns

### Layout Components

- Use `PageWrapper` for consistent page structure
- Follow established header/footer patterns
- Maintain responsive design patterns
- Use MUI breakpoint system consistently

### Content Components

- Follow existing video content display patterns
- Use established carousel and grid layouts
- Maintain consistent metadata display
- Follow existing navigation patterns

## Performance Guidelines

- Follow existing image optimization patterns
- Use established caching strategies
- Maintain existing SEO optimizations
- Follow current bundle optimization approaches

## Testing Guidelines

- Follow existing testing patterns where they exist
- Ensure compatibility with existing test suite
- Maintain existing accessibility standards
- Test responsive behavior across breakpoints

---

**Last Updated**: 2024-12-19  
**Version**: 1.0  
**Applies To**: Watch Application (Production)

This document captures the existing patterns and should be updated as new standards are established for the Watch application. 