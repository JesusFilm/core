# Watch-Modern Development Learnings

## Overview

This document captures common issues, solutions, and lessons learned during Watch-Modern development. It serves as a troubleshooting guide and knowledge repository for both developers and AI assistants working on the project.

## Common Issues & Solutions

### Development Environment

#### **File Paths**
- **Issue**: Confusion between `apps/watch-modern/` vs `core/apps/watch-modern/` paths
- **Solution**: Always use full workspace path `core/apps/watch-modern/` for file operations
- **Prevention**: Verify file locations with directory listing before creating files

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

---
**Applies To**: Watch-Modern Application

This document should be updated whenever new issues are discovered or solutions are found during development. 