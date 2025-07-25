# PRDs Directory

## Purpose

This directory contains Product Requirements Documents (PRDs) for various features and projects implemented in the codebase. These documents serve as a historical record and reference point for understanding the requirements, decisions, and implementation details of each feature.

## What is a PRD?

A Product Requirements Document (PRD) is a comprehensive document that outlines the purpose, features, functionality, and behavior of a product or feature. As described in [The Importance of PRD Documents in Cursor Projects](https://www.cursor.new/blog/importance-of-prd-in-cursor-projects), a PRD serves as a "single source of truth that aligns all stakeholders on what needs to be built."

## Why We Maintain PRDs

1. **Historical Context**: PRDs provide valuable context about why certain features were built and how they were intended to function.
2. **AI Assistance**: These documents help AI systems (like Claude) better understand the reasoning behind implementation decisions, making it easier to provide relevant assistance when modifying or extending features.
3. **Knowledge Preservation**: As team members change over time, PRDs preserve the knowledge and context that might otherwise be lost.
4. **Clear Project Vision**: Each PRD establishes clear objectives and success criteria for a feature, helping to prevent scope creep and ensure alignment with business goals.

## What Goes Into This Directory

Each PRD in this directory typically follows a consistent format and includes:

1. **Overview**: A high-level description of the feature or project
2. **Problem Statement**: The specific problem being solved
3. **Requirements**: Detailed functional and non-functional requirements
4. **Design Specifications**: UI/UX guidelines, wireframes, or mockups
5. **Technical Considerations**: Architecture decisions, API specifications, etc.
6. **Implementation Guidelines**: Specific guidance for developers
7. **Timeline**: Expected phases and milestones
8. **Success Metrics**: How the success of the feature will be measured

## Directory Structure

We use a consistent **app-based structure** for all PRDs:

```
core/prds/
├── A-README.md
├── watch/                         # Existing Watch app PRDs
│   ├── GUIDELINES.md              # Watch app coding standards
│   └── ENG-1939.md               # Footer redesign PRD
└── watch-modern/                  # Watch-Modern app PRDs
    ├── GUIDELINES.md              # Watch-Modern coding standards
    └── WAT-135/                   # Feature-based structure within app
        ├── WAT-135.md             # Main PRD document
        └── strategies/            # Implementation strategies
            ├── README.md          # Strategy documentation
            ├── ID-1-page-layout-extraction.md
            └── ID-2-content-areas-definition.md
```

### Organization Principles

- **App-Based**: All PRDs organized by application (e.g., `watch/`, `watch-modern/`)
- **Feature Structure**: Complex features have dedicated folders with strategies
- **Coding Guidelines**: Each app includes specific development standards
- **Consistent Structure**: Predictable organization across all applications

## Naming Convention

- **App Folders**: Named by application (e.g., `watch/`, `watch-modern/`)
- **PRD Files**: Named by ticket number (e.g., `ENG-1939.md`, `WAT-135.md`)
- **Feature Folders**: Named by ticket number for complex features (e.g., `watch-modern/WAT-135/`)
- **Strategy Files**: Named by task ID (e.g., `ID-1-page-layout-extraction.md`)
- **Guidelines**: App-specific coding guidelines (e.g., `GUIDELINES.md`)

## Implementation Strategies

For complex features, we create detailed **implementation strategies** in the `strategies/` subfolder. These provide:

- **Step-by-step execution plans** for specific PRD tasks
- **Technical analysis and component mapping**
- **Success criteria and validation steps**
- **Living documentation** that updates during implementation

### When to Create Strategies

- **Complex features** with multiple implementation phases
- **Cross-component integration** requiring detailed planning
- **High-risk tasks** that benefit from detailed preparation
- **Knowledge transfer** for team members unfamiliar with the codebase

### Strategy Status Indicators

Tasks use status indicators for execution control:

- `[PLANNING]` - Strategy being developed
- `[EXECUTING]` - Implementation in progress
- `[COMPLETE]` - Task finished successfully
- `[LATER]` - Deferred to future iteration
- `[KNOWN]` - Already established/documented

## App-Specific Coding Guidelines

Each application within the PRDs directory may include app-specific coding guidelines to ensure consistent development practices. These guidelines complement the general project standards and provide:

- **Technology Stack Requirements**: Specific frameworks, libraries, and tools for the application
- **Design Constraints**: UI/UX requirements and component library preferences
- **Development Patterns**: Coding standards, testing requirements, and architectural decisions
- **Performance Guidelines**: Optimization strategies and best practices
- **Integration Patterns**: How components should integrate with existing systems

### Current Guidelines

- **watch**: [GUIDELINES.md](watch/GUIDELINES.md) - Development standards for the existing Watch application using Material UI, established patterns, and production requirements
- **watch-modern**: [GUIDELINES.md](watch-modern/GUIDELINES.md) - Comprehensive development standards for the Watch-Modern application including TDD requirements, Tailwind CSS constraints, and component patterns
  - [LEARNINGS.md](watch-modern/LEARNINGS.md) - Troubleshooting guide and lessons learned from development sessions

## For AI Assistants

If you're an AI assistant helping with code in this repository:

1. **Reference These Documents**: When working on a feature, check if there's a corresponding PRD to understand the original requirements and design decisions.
2. **Maintain Consistency**: Ensure that any changes or additions you suggest align with the principles and patterns established in the relevant PRD.
3. **Suggest Updates**: If you notice that a PRD is outdated or inconsistent with the current implementation, suggest updates to keep the documentation accurate.

## Best Practices

As noted in the [Cursor Projects article](https://www.cursor.new/blog/importance-of-prd-in-cursor-projects), effective PRDs should be:

- **Clear**: Written in unambiguous language
- **Complete**: Covering all aspects of the feature
- **Consistent**: Maintaining uniform terminology
- **Testable**: Including requirements that can be verified
- **Living**: Updated as the project evolves

By maintaining high-quality PRDs, we create a more maintainable codebase and facilitate better collaboration between team members and AI assistants.

## For AI Coding Agents: Project Continuation Guide

### Quick Start Checklist

When starting a new coding session to continue existing work:

1. **📋 Find the Active PRD**: Look in this directory for the relevant project PRD
2. **🔍 Check Current Status**: Read the PRD's "Current Status" or "Next Steps" section
3. **📁 Locate Strategy Documents**: Check for `/strategies/` subfolder with detailed implementation plans
4. **🧪 Run Tests**: Verify current state with project test suite
5. **🚀 Continue Work**: Follow the established patterns and TDD methodology

### Project Structure Understanding

**Workspace Root**: `/workspaces/core/` - Always run commands from here

**Common App Locations**:

- `core/apps/watch/` - Existing watch application
- `core/apps/watch-modern/` - New watch redesign
- `core/apps/[other-apps]/` - Additional applications

**Key Commands** (from `/workspaces/core/`):


**⚠️ CRITICAL: Always run commands from `/workspaces/core/` directory (the nx workspace root)**

```bash
# Development server for watch-modern
cd /workspaces/core && nx run watch-modern:serve --port 4200

# Test specific project
npm test [project-name]

# Test specific component
npm test [project-name] -- --testNamePattern="ComponentName"

# Build verification
npm run build [project-name]
```

### Critical Development Workflow

**⚠️ Common Issues & Solutions**:

- **File Paths**: Always use full workspace relative paths (`core/apps/project-name/`)
- **Dev Server**: Must run from `/workspaces/core/` directory (NOT from `/workspaces/`)
- **React Components**: Include explicit React import: `React, { type ReactElement } from "react"`
- **Import Ordering**: Follow alphabetical ordering per linter rules
- **File Creation**: Verify locations with directory listing before creating files

**🔄 TDD Development Pattern** (when applicable):

1. **Red Phase**: Create test file with failing tests first
2. **Green Phase**: Implement minimal code to pass tests
3. **Refactor Phase**: Clean up, document, integrate
4. **Integration**: Update exports and integrate into application

### Finding Your Next Task

**In the PRD Document**:

- Look for `[EXECUTING]`, `[PLANNING]`, or `[PENDING]` status indicators
- Check "Next Steps" or "Current Phase" sections
- Review "Implementation Notes" for context and decisions made

**In Strategy Documents**:

- Each strategy has step-by-step execution plans
- Look for incomplete checkboxes `[ ]`
- Review "Blockers/Issues" sections for known challenges
- Check "Code References" for relevant existing components

**In the Codebase**:

- Look for TODO comments or incomplete implementations
- Check test files for missing coverage
- Review component export files for integration points

### Project-Specific Patterns

**For Watch-Modern Projects**:

- **Constraint**: NO MUI components (Tailwind + Shadcn only)
- **Testing**: Co-located `.spec.tsx` files required
- **Design System**: Use established component classes from `globals.css`

**For Watch Projects**:

- **Framework**: MUI-based component library
- **API**: GraphQL with generated types
- **Testing**: Storybook + Jest testing patterns

### Handoff Best Practices

**Before Starting**:

- [ ] Read the relevant PRD completely
- [ ] Understand current project constraints
- [ ] Run existing tests to verify working state
- [ ] Check development server starts successfully

**During Development**:

- [ ] Follow established coding patterns in the project
- [ ] Maintain test coverage for new components
- [ ] Update documentation as you progress
- [ ] Commit working states frequently

**Before Ending Session**:

- [ ] Update PRD status indicators
- [ ] Document any new issues discovered
- [ ] Ensure all tests pass
- [ ] Update "Next Steps" for future sessions

### Memory and Context

**💾 What to Remember**: Previous AI sessions may have created memories about project-specific workflows, constraints, or patterns. Check for relevant memories before starting work.

**📝 What to Document**: When you discover new patterns, workarounds, or issues, update the relevant PRD or strategy document so future sessions benefit from your discoveries.

This guide ensures consistent, efficient handoffs between AI coding sessions while maintaining project quality and momentum.
