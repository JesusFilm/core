// Phoebe consumer config for JesusFilm/core — scaffolded by `phoebe init`,
// then filled in per docs/phoebe-core-onboarding.md in JesusFilm/phoebe.
//
// Only the five fields at the top are required. Everything else has a shipped
// default (see the `PhoebeUserConfig` type); add overrides here only when you
// need them, and engine upgrades pick up new defaults automatically. This file
// deliberately names only the toolchain plus the engine pin: work order, PR-scan
// scope, labels and prompts all stay on the engine defaults.
//
// This is a *type-only* import on purpose. The container mounts this file at
// /etc/phoebe and `phoebe boot` imports it before the engine exists, from a
// directory with no reachable `node_modules` — a value import of `phoebe-agent`
// (the `defineConfig` helper) could not resolve there under ESM. A type-only
// import is erased at runtime, so it type-checks in your editor and costs
// nothing in the container.

import type { PhoebeUserConfig } from 'phoebe-agent'

const config: PhoebeUserConfig = {
  repoSlug: 'JesusFilm/core',
  repoUrl: 'https://github.com/JesusFilm/core.git',

  // pnpm, lockfile-exact — the container installs the repo toolchain. pnpm
  // itself is pinned in container/Dockerfile to match `packageManager` here.
  installCommand: 'pnpm install --frozen-lockfile',

  // `pnpm lint:changed --fix` first: it is the same Prettier + ESLint + i18next
  // extraction pass autofix.ci would otherwise commit onto the PR as a
  // `fix: lint issues` bot commit (AGENTS.md → Lint before push). Then
  // Nx-affected lint + type-check, with prettier in WRITE mode so formatting is
  // fixed in place (not merely checked). `--base=origin/main` is the branch
  // worktrees base off (`defaultBranch`); change both together.
  checkCommand:
    'pnpm lint:changed --fix && pnpm nx format:write --base=origin/main && pnpm nx affected -t lint type-check --base=origin/main',

  // Nx-affected tests only — the whole point of affected is to skip the rest.
  testCommand: 'pnpm nx affected -t test --base=origin/main',

  // The all-in-one gate the agent runs before pushing. The shipped default is
  // `npm run ready`, which core does not have, so point it at check + test.
  readyCommand:
    'pnpm lint:changed --fix && pnpm nx format:write --base=origin/main && pnpm nx affected -t lint type-check test --base=origin/main',

  // branchPrefix stays on the engine default `phoebe/` (branches
  // `phoebe/issue-<n>`): core's branch-name rule admits `phoebe/.*` since #9649.

  // core already uses the engine-default `ready-for-agent` as a shared triage
  // label (AGENTS.md → Triage labels), so leaving Phoebe on it would make this
  // instance work every triaged issue in the repo. A Phoebe-specific label
  // keeps intake explicit: only issues a human tags `phoebe:ready` are worked.
  readyLabel: 'phoebe:ready',

  // Which engine `phoebe boot` runs. This is the upgrade knob: edit it and the
  // running container drains the engine and relaunches on the new code at the
  // next work-unit boundary — no rebuild, no restart.
  //
  //   ref: "main"      follow the tip — every push lands here. Guarded: a
  //                    commit that will not boot is quarantined after a few
  //                    fast crashes and `boot` pins back to the last one that
  //                    ran healthily, until the branch moves past it.
  //   ref: "v1.2.3"    pin a tag (or a full SHA). Exactly this commit, always.
  //                    No fallback — pinning means pinning.
  //
  // `repo` defaults to the upstream engine repo; set it to run a fork.
  // For a checkout on your own machine, see container/compose.local.yml.
  engine: { source: 'github', ref: 'v0.13.2' },

  // Where Phoebe reports its *own* faults — a failed engine clone, a crash-loop
  // quarantine, `phoebe upgrade` throwing. Never a tenant's failures, never the
  // work loop. `maintainers` sends to the Phoebe project (a DSN the engine
  // carries); `dsn` sends to your own Sentry project; both may be set. Nothing
  // identifying leaves unless `includeRef: true` (then the repo slug and, where
  // a fault names one, the unit ref). Delete the block or set both off to opt
  // out. See docs/operating.md → Crash reporting.
  reporting: { maintainers: false },

  // The `claude` provider runs from a Claude Pro/Max subscription instead
  // of an API key: the long-lived token from `claude setup-token` is forwarded
  // (CLAUDE_CODE_OAUTH_TOKEN in .env) rather than ANTHROPIC_API_KEY. See
  // docs/claude-subscription-auth.md in JesusFilm/phoebe.
  providerEnv: { claude: 'CLAUDE_CODE_OAUTH_TOKEN' },

  // How this repo's commits are attributed (optional). Declaring it here means
  // every deployment that runs this repo agrees on the attribution, instead of
  // each one restating it in its `.env` — which still overrides this if it does.
  // Both halves are required, and the email must be exactly the address GitHub
  // knows (a noreply address is the usual answer), or the commits link to no
  // account at all.
  //
  // Set to the siyang-bot account (the GH_TOKEN owner), so commits link to the
  // same account that opens the PR. Without this the first test run (#9648)
  // found no identity in the container and set a repo-local one itself.
  gitIdentity: {
    name: 'siyang-bot',
    email: '317690486+siyang-bot@users.noreply.github.com'
  }
}

export default config
