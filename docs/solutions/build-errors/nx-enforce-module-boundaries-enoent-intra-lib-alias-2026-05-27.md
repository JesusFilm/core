---
title: 'Nx enforce-module-boundaries crashes with ENOENT on intra-library @core/* alias imports'
date: 2026-05-27
category: build-errors
module: libs/journeys/ui
problem_type: build_error
component: development_workflow
symptoms:
  - "`eslint` exits non-zero with an uncaught `Error: ENOENT: no such file or directory, open '.../libs/journeys/ui/src/libs/PublicGalleryPage'` (a path that does not exist — the module lives under `src/components/`)"
  - "The stack trace points into `@nx/enforce-module-boundaries` `getRelativeImportPath` / the rule's `fix()` — it is a crash during autofix, not a normal lint finding"
  - 'Happens only when a file inside a lib imports a sibling module of the SAME lib via the `@core/<lib>/<name>` package alias; cross-library `@core/<other-lib>/*` imports are fine'
root_cause: config_error
resolution_type: code_fix
severity: medium
tags:
  - nx
  - eslint
  - enforce-module-boundaries
  - tsconfig-paths
  - monorepo
  - imports
related_components:
  - tooling
---

# Nx enforce-module-boundaries crashes with ENOENT on intra-library @core/\* alias imports

## Problem

A file inside `libs/journeys/ui` imported a sibling module of the same library through the package alias (`@core/journeys/ui/PublicGalleryPage`). Running ESLint crashed the `@nx/enforce-module-boundaries` rule with an `ENOENT` for a file path that does not exist, blocking the lint gate entirely.

## Symptoms

- `eslint` aborts with `Error: ENOENT: no such file or directory, open '/workspaces/core/libs/journeys/ui/src/libs/PublicGalleryPage'` — note the path is under `src/libs/` even though the module is actually under `src/components/`.
- The crash originates inside `@nx/enforce-module-boundaries` during its autofix (`getRelativeImportPath`), so `--fix` does not help — the fixer itself is what throws.
- It only reproduces for **intra-library** alias imports. The same file importing another library (`@core/shared/ui/icons/Play3`) lints cleanly.

## What Didn't Work

- Writing the intra-lib import with the documented public alias `@core/journeys/ui/PublicGalleryPage` (the path external apps use). This is what triggered the crash.
- Re-running `eslint --fix` — the exception is raised _inside_ the fix routine, so it never completes.

## Solution

Inside a library, import sibling modules with **relative paths**. Reserve the `@core/<lib>/*` alias for importing _other_ libraries.

```ts
// ❌ inside libs/journeys/ui — alias to a sibling module crashes the rule
import { abbreviateLanguageName } from '@core/journeys/ui/abbreviateLanguageName'
import { GALLERY_CARD_RADIUS } from '@core/journeys/ui/PublicGalleryPage'
import Play3Icon from '@core/shared/ui/icons/Play3'
```

```ts
// ✅ relative for same-lib siblings; alias only for other libs
import Play3Icon from '@core/shared/ui/icons/Play3'

import { abbreviateLanguageName } from '../../libs/abbreviateLanguageName'
import { GALLERY_CARD_RADIUS } from '../PublicGalleryPage'
```

Import-order groups in this repo: external → `@core/<other-lib>/*` → relative, each separated by a blank line. After switching to relative paths, `eslint --fix` sorts the groups correctly (and no longer crashes).

## Why This Works

`tsconfig.base.json` maps the alias to **two** globs:

```jsonc
"@core/journeys/ui/*": [
  "libs/journeys/ui/src/components/*",
  "libs/journeys/ui/src/libs/*"
]
```

When a file _inside_ `libs/journeys/ui` imports a sibling through this alias, `@nx/enforce-module-boundaries` tries to rewrite it to a relative path and resolves the alias against the candidate globs. It picks the wrong candidate (`src/libs/<name>`), then `fs.openSync`s that non-existent file and throws `ENOENT` instead of reporting a lint error. Relative imports sidestep the rule's alias machinery entirely, because the boundary rule only governs cross-project alias imports — so the crash never occurs.

## Prevention

- **Convention:** within any Nx lib, import same-lib modules relatively (`../Foo`, `../../libs/foo`); only use `@core/<lib>/*` to cross into a _different_ lib. The public alias is for _consumers_ (apps and other libs), not for the lib talking to itself.
- Mirror an existing sibling when unsure — e.g. `libs/journeys/ui/src/components/TemplateGalleryCard/TemplateGalleryCard.tsx` already imports `../../libs/abbreviateLanguageName` relatively.
- If you see an `ENOENT` thrown from `@nx/enforce-module-boundaries` (rather than a normal rule violation), suspect an intra-lib alias import that resolves ambiguously through a multi-target `tsconfig.base.json` path — convert it to a relative import.

## Related Issues

- Surfaced while building the shared `PublicTemplateGallery` component (NES-1701, PR #9256). No prior `docs/solutions/` entry or GitHub issue covers Nx module-boundary alias resolution — this is the first capture.
- Related repo convention from the same work: `docs/solutions/conventions/mui-spacing-token-is-4px-2026-05-24.md` (another non-obvious monorepo/theming convention worth knowing when working in `libs/journeys/ui`).
