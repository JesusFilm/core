// Phoebe consumer config for JesusFilm/core.
//
// Deliberately minimal: only the toolchain fields and the engine pin are named
// here. Everything that governs *what* Phoebe does — workOrder, prScope, the
// ready/processing/opt-out labels, provider defaults, prompts — is omitted and
// resolves to the engine defaults, so a `phoebe-agent` upgrade picks up new
// defaults automatically. See docs/phoebe-core-onboarding.md in JesusFilm/phoebe.
//
// This is a *type-only* import on purpose. The container mounts this file at
// /etc/phoebe and `phoebe boot` imports it before the engine exists, from a
// directory with no reachable `node_modules` — a value import of `phoebe-agent`
// could not resolve there under ESM. A type-only import is erased at runtime.

import type { PhoebeUserConfig } from 'phoebe-agent'

const config: PhoebeUserConfig = {
  repoSlug: 'JesusFilm/core',
  repoUrl: 'https://github.com/JesusFilm/core.git',

  // pnpm, lockfile-exact — then generate the Prisma clients. The generate step
  // is not optional: every `generator client` block writes to a gitignored
  // `src/__generated__/client` (see libs/prisma/*/src/__generated__/.gitignore),
  // so without it type-check and test fail on unresolved imports in a fresh
  // clone. DISABLE_ERD matches CI, which skips the ERD renderer.
  installCommand:
    'pnpm install --frozen-lockfile && DISABLE_ERD=true pnpm exec nx run-many -t prisma-generate --all',

  // Nx-affected lint + type-check, with formatting applied in WRITE mode so
  // drift is fixed in place rather than failing the gate. NODE_OPTIONS matches
  // .github/workflows/autofix.ci.yml — lint OOMs on the default heap.
  // The target is `type-check` (hyphenated), which is what core's project.json
  // files actually define.
  checkCommand:
    'pnpm exec nx format:write --base=origin/main && NODE_OPTIONS=--max-old-space-size=8192 pnpm exec nx affected -t lint type-check --base=origin/main',

  // Nx-affected tests only — the point of affected is to skip the rest.
  testCommand: 'pnpm exec nx affected -t test --base=origin/main',

  // The all-in-one gate the agent runs before pushing. The shipped default is
  // `npm run ready`, which core does not have, so it is check + test.
  readyCommand:
    'pnpm exec nx format:write --base=origin/main && NODE_OPTIONS=--max-old-space-size=8192 pnpm exec nx affected -t lint type-check test --base=origin/main',

  // Which engine `phoebe boot` checks out and runs. This is the upgrade knob:
  // edit it in place and the running container drains and relaunches on the new
  // ref at the next work-unit boundary — no rebuild, no restart.
  engine: { source: 'github', ref: 'v0.1.1' }
}

export default config
