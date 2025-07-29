# WAT-135 Implementation Strategies

## Overview

This folder contains detailed implementation strategies for WAT-135 (Watch Site Home Page Redesign) tasks. Each strategy document provides step-by-step guidance for executing specific tasks from the main PRD.

## Development Workflow Guidelines

### Project Structure

```
/workspaces/core/                           # Workspace root - run commands here
├── apps/watch-modern/                      # Target application
│   ├── src/components/                     # Component directory
│   │   ├── ComponentName/                  # Individual components
│   │   │   ├── ComponentName.tsx           # Implementation
│   │   │   ├── ComponentName.spec.tsx      # Tests (co-located)
│   │   │   └── index.ts                    # Exports
│   │   └── index.ts                        # Main component exports
│   └── src/app/page.tsx                    # Home page integration
```

### Essential Commands

**⚠️ CRITICAL: Always run commands from `/workspaces/core/` directory (the nx workspace root)**

```bash
# Development server for watch-modern
cd /workspaces/core && nx run watch-modern:serve --port 4200

# Testing specific component
npm test watch-modern -- --testNamePattern="ComponentName"

# Full test suite
npm test watch-modern

# Build verification
npm run build watch-modern
```

### TDD Development Pattern

1. **Red Phase**: Create `.spec.tsx` file with failing tests first
2. **Green Phase**: Implement minimal component to pass tests
3. **Refactor Phase**: Clean up, document, integrate
4. **Integration**: Update index files and home page

### Common Issues & Solutions

- **File Paths**: Always use `core/apps/watch-modern/` (not `apps/watch-modern/`)
- **Dev Server**: Must run from `/workspaces/core/` directory
- **React Imports**: Include `React, { type ReactElement } from "react"`
- **Import Order**: Follow alphabetical ordering per linter rules

## File Naming Convention

- `{TASK-ID}-{descriptive-name}.md`
- Examples: `ID-1-page-layout-extraction.md`, `P1-1-wireframe-foundation.md`

## Strategy Document Structure

Each strategy document follows this template:

```markdown
# WAT-135 - {TASK-ID}: {Task Title} Strategy

## Task Reference

- **PRD**: [WAT-135.md](../WAT-135.md#{link-to-section})
- **Status**: `[PLANNING|EXECUTING|COMPLETE]`
- **Dependencies**: {List any blocking tasks}
- **Estimated Effort**: {Time estimate}
- **Owner**: {Assigned developer}

## Objective

{Clear statement of what this strategy achieves}

## Background Context

{Relevant context and constraints}

## Strategy Steps

{Detailed breakdown of implementation phases and steps}

## Success Criteria

{Measurable outcomes that define completion}

## Implementation Notes

{Living section for discoveries, decisions, blockers}

## Next Steps

{What comes after this strategy is complete}
```

## Current Strategies

### Ideation Phase

- [ID-1: Page Layout Extraction](./ID-1-page-layout-extraction.md) `[COMPLETE]`
- [ID-2: Content Areas Definition](./ID-2-content-areas-definition.md) `[PLANNING]`

### Future Strategies (To Be Created)

- P1-1: Wireframe Foundation Implementation `[LATER]`
- P2-1: Content Source Specifications `[LATER]`

## Usage Guidelines

1. **Before Implementation**: Review and approve the strategy document
2. **During Implementation**: Update the "Implementation Notes" section with discoveries and decisions
3. **After Completion**: Mark status as `[COMPLETE]` and document any lessons learned

## Cross-References

- **Main PRD**: [WAT-135.md](../WAT-135.md)
- **Project Architecture**: [Watch Modern Documentation](#) _(to be added)_
- **Design System**: [Design Guidelines](#) _(to be added)_
