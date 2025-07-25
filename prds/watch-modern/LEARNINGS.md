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

## Workflow Learnings

---
**Applies To**: Watch-Modern Application

This document should be updated whenever new issues are discovered or solutions are found during development. 