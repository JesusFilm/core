# Watch-Modern Development Learnings

## Overview

This document captures common issues, solutions, and lessons learned during Watch-Modern development. It serves as a troubleshooting guide and knowledge repository for both developers and AI assistants working on the project.

## Common Issues & Solutions

### Development Environment

#### **File Paths**
- **Issue**: Confusion between `apps/watch-modern/` vs `core/apps/watch-modern/` paths
- **Solution**: Always use full workspace path `core/apps/watch-modern/` for file operations
- **Prevention**: Verify file locations with directory listing before creating files

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

#### **Development Server**
- **Issue**: `npm run dev` fails when run from incorrect directory
- **Solution**: Must run from `/workspaces/core/` directory
- **Correct Command**: `cd /workspaces/core && nx run watch-modern:serve --port 4200`
- **Background Process**: Use `is_background: true` for long-running dev server

#### **Compilation Waiting**
- **Issue**: Proceeding with development before server compilation completes
- **Problem**: Missing compilation errors, broken features, wasted development time
- **Solution**: Always wait for `✓ Ready in Xs` message before continuing
- **Prevention**: Follow mandatory waiting procedure in GUIDELINES.md



### TDD Implementation Issues

#### **Test Environment vs Runtime Environment**
- **Issue**: Tests pass but runtime compilation fails
- **Cause**: Tests run in different environment than Next.js server
- **Solution**: Always verify server compilation after implementing tests
- **Workflow**: Red → Green → **Verify Server Compilation** → Refactor

## Workflow Learnings

### Development Server Best Practices

1. **Always wait for compilation**: Never proceed until seeing "Ready in Xs"
2. **Watch for errors**: Server continues running even with compilation errors
3. **Fix immediately**: Address compilation errors before any other development
4. **Test in browser**: Verify functionality works in actual runtime environment

### Client vs Server Components

- **Server Components (default)**: Static content, no interactivity, better performance
- **Client Components (`'use client'`)**: Interactive features, browser APIs, state management
- **Decision Rule**: Only use client components when absolutely necessary

## Learnings 

#### **Internationalization**
- **Pattern**: Using `next-intl` for translations
- **Location**: `apps/watch-modern/src/i18n/en.json`
- **Keys**: Consistent naming with component prefix (e.g., `Header.searchPlaceholder`)

#### **Testing Strategy**
- **Framework**: React Testing Library with comprehensive RTL tests
- **Coverage**: Component rendering, user interactions, accessibility
- **Mocking**: Proper mocking of Next.js navigation and internationalization

#### **Accessibility**
- **Pattern**: Proper ARIA labels and semantic HTML
- **Implementation**: All interactive elements have appropriate `aria-label` attributes
- **Testing**: Accessibility features included in test coverage

#### **Styling**
- **Pattern**: Tailwind CSS with responsive design
- **Implementation**: Glassmorphism effects with backdrop blur
- **Responsive**: Mobile-first approach with proper breakpoints

#### **Client vs Server Components**
- **Issue**: Components using `useState`, `useRouter`, or other client hooks need `'use client'` directive
- **Solution**: Add `'use client'` at the top of components that use client-side hooks
- **Pattern**: Import organization - `'use client'` must be first, then imports in alphabetical order
- **TypeScript**: Use `import type` for type-only imports when `verbatimModuleSyntax` is enabled

---
**Applies To**: Watch-Modern Application

This document should be updated whenever new issues are discovered or solutions are found during development. 

## Apollo Client Runtime Error — Missing Provider

- Symptom: Visiting `http://localhost:4200/watch` showed an Apollo error page (link to `https://go.apollo.dev/c/err`), not a compile error.
- Root Cause: No ApolloProvider in the app runtime; `useQuery` in `VideoCollection` had no client in React context.
- Solution:
  - Added `apps/watch-modern/src/app/ApolloClientProvider.tsx` (client component) that uses `useApolloClient()` and wraps children with `<ApolloProvider client={client}>`.
  - Wrapped app `children` with `ApolloClientProvider` in `apps/watch-modern/src/app/layout.tsx`.
  - Result: `/watch` returns HTTP 200 and renders (skeletons while data loads), no Apollo error banner.

### Testing vs Runtime
- Tests initially hit real network because `VideoCollection` created its own ApolloClient and passed it to `useQuery`, bypassing `MockedProvider`.
- Fix: Remove in-component client creation; rely on Apollo context so `MockedProvider` works.
- Note: `NEXT_PUBLIC_GATEWAY_URL` only affects real runtime; it’s not the cause when tests are correctly mocked.

### Operational Notes
- After changing providers, restart dev server and curl a concrete route to trigger compilation: `curl -s http://localhost:4200/watch`.
- If skeletons persist, verify GraphQL endpoint in `.env.local` (`NEXT_PUBLIC_GATEWAY_URL`) or backend availability. 