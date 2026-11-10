// Phoebe tenant config for JesusFilm/core.
//
// Phoebe (https://github.com/JesusFilm/phoebe) picks up issues labelled
// `ready-for-agent`, works each one on a `phoebe/` branch in its own clone, runs
// the gates below, and opens a PR. This repo is one tenant of a Phoebe
// workspace: the workspace root discovers this file and runs the shared engine
// in its container. This file names only what is specific to this repo.
//
// No import on purpose: the container loads this file from a mount with no
// node_modules, and this repo has no `phoebe-agent` dependency. The fields are
// `PhoebeUserConfig` from phoebe-agent (docs/configuration.md).
//
// Everything else Phoebe reads lives in `.phoebe/` (`configDir` below): the
// engine's shipped prompts, unedited, in .phoebe/prompts/, and the gitignored
// secrets file .phoebe/.env (see .phoebe/.env.example):
// GH_TOKEN, a fine-grained PAT for this repo, and ANTHROPIC_AUTH_TOKEN, the
// provider key. The workspace image sends Claude Code through a shared proxy
// when that key is the one it is given.
//
// Gates from AGENTS.md (lint:changed, Nx-affected type-check) and CI's
// main.yml (prisma-generate before type-check and test).

const config = {
  repoSlug: 'JesusFilm/core',
  repoUrl: 'https://github.com/JesusFilm/core.git',
  configDir: '.phoebe',
  installCommand:
    'pnpm install --frozen-lockfile && DISABLE_ERD=true pnpm exec nx run-many -t prisma-generate',
  checkCommand:
    'pnpm lint:changed && pnpm exec nx affected -t type-check --base=origin/main',
  testCommand: 'pnpm exec nx affected -t test --base=origin/main',
  readyCommand:
    'pnpm lint:changed --fix && pnpm exec nx affected -t type-check test --base=origin/main',
  defaultProvider: 'claude',
  providerEnv: { claude: 'ANTHROPIC_AUTH_TOKEN' }
}

export default config
