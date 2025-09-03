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
- **Browser Testing**: Playwright-based end-to-end testing suite
- **ARM64 Compatibility**: Firefox-based testing optimized for ARM64 architecture

#### **Browser Testing Infrastructure**
- **Location**: `apps/watch-modern-e2e/`
- **Purpose**: Automated browser testing for search functionality and UI validation
- **Technology**: Playwright with Firefox browser (ARM64 compatible)
- **Features**: Search testing, responsive design validation, performance monitoring, Nx workspace integration
- **Documentation**: Complete setup and usage guides available in e2e testing directory

#### **Browser Testing Commands**
```bash
# Run all e2e tests
cd /workspaces && nx run watch-modern-e2e:e2e

# Run search tests only
cd /workspaces && npx playwright test apps/watch-modern-e2e/src/e2e/search/ --project=firefox

# Run with visual debugging
cd /workspaces && nx run watch-modern-e2e:debug

# View test reports
cd /workspaces && npx playwright show-report
```

#### **Browser Testing Learnings**
- **ARM64 Compatibility**: Chrome installation fails on ARM64, use Firefox instead
- **System Dependencies**: Install Playwright system dependencies with `npx playwright install-deps`
- **Headless Mode**: Use headless mode for CI/CD, visible mode for debugging
- **Screenshot Capture**: Automatic screenshots for visual verification and debugging
- **Performance Monitoring**: Track search response times and loading performance
- **Nx Integration**: E2e tests work better when integrated with Nx workspace patterns
- **Test Organization**: Group related tests in feature-specific directories under `src/e2e/`
- **Selector Strategy**: Use semantic selectors that work across different environments
- **CI/CD Ready**: Tests designed for headless execution in CI/CD pipelines

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

#### **Homepage Basic Implementation (Slice 1)**
- **Pattern**: Copy intake markup to production components while preserving Tailwind classes
- **Structure**: Header component with logo, search bar, and language button
- **Hero Section**: Static background with gradient overlays and mission statement
- **Components**: Modular approach with separate Header and HeroSection components
- **Testing**: Comprehensive RTL tests for rendering, accessibility, and user interactions
- **TypeScript**: Strict type checking requires proper type-only imports for verbatimModuleSyntax
- **Build Process**: Must fix all TypeScript errors before successful compilation
- **Dependencies**: Ensure all required packages (clsx, tailwind-merge, class-variance-authority) are installed

#### **Responsive Design Improvements**
- **Header Height**: Responsive header height (60px mobile, 80px tablet, 120px desktop) to prevent text overlap
- **Padding Strategy**: Dynamic padding that scales with screen size (px-4 mobile, px-8 tablet, px-20 desktop)
- **Text Sizing**: Responsive text sizes using Tailwind's responsive prefixes (text-2xl sm:text-4xl)
- **Spacing**: Proper spacing between elements that adapts to screen size (gap-2 sm:gap-3)
- **Icon Sizing**: Responsive icon sizes for better mobile experience (w-4 h-4 sm:w-5 sm:h-5)
- **Button Scaling**: Responsive button padding and text sizes for touch-friendly mobile interface
- **Layout Prevention**: Added top padding to hero section to prevent header overlap (pt-[60px] sm:pt-[80px] lg:pt-[120px])

#### **Mobile Typography Improvements**
- **Heading Font Size**: Increased mobile font size from text-2xl to text-3xl for better readability
- **Left Alignment**: Ensured all text blocks and logo are properly left-aligned with consistent spacing
- **Logo Container**: Added proper flex container for logo to maintain alignment consistency
- **Visual Hierarchy**: Maintained proper text hierarchy while improving mobile readability

#### **Responsive Layout Optimization**
- **Stacked Layout Padding**: Removed horizontal padding on secondary content when layout is stacked on smaller screens
- **Conditional Padding**: Used `lg:p-8` instead of `p-4 sm:p-8` to only apply padding on large screens
- **Content Alignment**: Ensures text blocks align properly with main content when stacked vertically
- **Mobile-First Approach**: Prioritizes content readability on smaller screens by removing unnecessary spacing

#### **Navigation and Routing**
- **Logo Link**: Updated logo to link to local `/watch` route instead of external JesusFilm domain
- **Local Navigation**: Ensures users stay within the application when clicking the logo
- **Consistent Routing**: Maintains proper navigation patterns within the Next.js application

### Browser Testing Issues & Solutions

#### **Playwright Installation Issues**
- **Issue**: `npx playwright install` fails on ARM64 architecture
- **Solution**: Use `npx playwright install firefox` for ARM64 compatibility
- **Prevention**: Always specify browser when installing on ARM64 systems
- **Alternative**: Use `npx playwright install-deps` to install system dependencies first

#### **Browser Launch Failures**
- **Issue**: Browser fails to launch with "executable not found" error
- **Solution**: Ensure Firefox is installed and Playwright browsers are downloaded
- **Command**: `npx playwright install firefox` followed by test execution
- **Prevention**: Always run browser installation before executing tests

#### **App Not Running Errors**
- **Issue**: Tests fail because watch-modern app is not running on localhost:4800
- **Solution**: Start the development server before running browser tests
- **Command**: `cd /workspaces && nx run watch-modern:serve --port 4800`
- **Prevention**: Always check app status before running e2e tests

#### **Search Results Not Appearing**
- **Issue**: Search tests pass but no results are displayed in browser
- **Solution**: Verify Algolia environment variables are properly loaded
- **Check**: Ensure `.env` file contains correct `NEXT_PUBLIC_ALGOLIA_*` variables
- **Prevention**: Run environment variable validation before browser testing

#### **Performance Test Timeouts**
- **Issue**: Performance tests timeout due to slow response times
- **Solution**: Increase timeout values in test configuration
- **Location**: Modify `playwright.config.ts` in `apps/watch-modern-e2e/`
- **Prevention**: Adjust timeouts based on network conditions and system performance

#### **Screenshot Capture Issues**
- **Issue**: Screenshots fail to save or have incorrect paths
- **Solution**: Ensure write permissions in the e2e testing directory
- **Check**: Verify Playwright has permission to write to the test-results directory
- **Prevention**: Run tests with proper permissions and from the correct workspace directory

#### **Responsive Design Testing**
- **Issue**: Viewport changes don't work as expected
- **Solution**: Use `page.setViewportSize()` method in Playwright
- **Pattern**: Test mobile (375x667), tablet (768x1024), desktop (1920x1080)
- **Prevention**: Always test responsive behavior across multiple viewport sizes

#### **Nx E2E Test Integration Issues**
- **Issue**: Tests fail when not run from the correct workspace directory
- **Solution**: Always run e2e tests from `/workspaces/` (workspace root)
- **Command**: `cd /workspaces && nx run watch-modern-e2e:e2e`
- **Prevention**: Use Nx commands instead of direct Playwright commands for consistency

#### **Test Organization Migration**
- **Issue**: Tests created in wrong location or with inconsistent structure
- **Solution**: Follow established Nx e2e patterns in `apps/watch-modern-e2e/src/e2e/`
- **Pattern**: Group tests by feature in subdirectories (e.g., `search/`, `video/`, `user/`)
- **Prevention**: Review existing test structure before adding new tests

#### **Memory and Resource Issues**
- **Issue**: Browser tests consume excessive memory or fail on resource-constrained systems
- **Solution**: Use headless mode and limit concurrent browser instances
- **Prevention**: Close browser instances properly and use `browser.close()` in cleanup

#### **Video Collection Implementation (Slice 2)**
- **Client Component Pattern**: Used `'use client'` directive for interactive components with event handlers
- **Video Grid Layout**: Responsive grid with 1-4 columns based on screen size (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- **Video Card Structure**: Each card includes thumbnail, metadata (duration, languages), title, and subtitle
- **Interactive Elements**: Click and keyboard navigation (Enter/Space) with proper accessibility attributes
- **Mobile Optimization**: Cards limited to 75% width on mobile with increased vertical spacing (gap-16)
- **Loading States**: Skeleton loading animation with proper test IDs for testing
- **Error Handling**: Graceful error display when API calls fail

#### **GraphQL Integration Implementation**
- **Apollo Client Setup**: Created Apollo Client configuration with proper TypeScript types
- **GraphQL Queries**: Implemented `GET_FILMS` query using existing `VIDEO_CONTENT_FIELDS` fragment
- **Type Safety**: Proper TypeScript interfaces for GraphQL data structures
- **Environment Configuration**: Fallback URL handling for development vs production
- **Testing Strategy**: Mocked Apollo Provider for comprehensive test coverage
- **Data Transformation**: Duration formatting (seconds to "X HR Y MIN") and language count formatting
- **Image Integration**: Using API-provided `mobileCinematicHigh` images instead of third-party URLs
- **Navigation Integration**: Proper slug-based routing to video detail pages

---
**Applies To**: Watch-Modern Application

This document should be updated whenever new issues are discovered or solutions are found during development. 