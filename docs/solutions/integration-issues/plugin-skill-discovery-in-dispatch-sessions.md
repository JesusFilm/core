---
title: "CE Plugin Skills Not Available in Dispatch-Spawned Code Task Sessions"
category: integration-issues
created: 2026-04-22
status: resolved
severity: high
component: .claude/skills, .claude/agents, dispatch-integration
tags:
  - dispatch
  - claude-code-skills
  - compound-engineering
  - plugin-integration
  - skill-discovery
related:
  - docs/solutions/integration-issues/sandboxed-claude-code-devcontainer-setup.md
  - docs/plans/2026-03-25-001-feat-sandboxed-claude-code-devcontainer-plan.md
  - .claude/skills/sync-ce/SKILL.md
---

## Problem

Compound-engineering plugin skills (`/ce-plan`, `/ce-review`, `/ce-brainstorm`, `/ce-work`, `/ce-compound`, etc.) were available in local Claude Code CLI sessions but **not discoverable by Dispatch-spawned Code task sessions**.

**Symptoms:**
- Dispatch tasks reported CE skills as unavailable when invoked
- Skills worked fine in the local CLI terminal
- The same repo, same branch, different execution context

## Root Cause

Dispatch-spawned Code tasks get fresh sessions that only discover skills in the project's `.claude/skills/` directory. They do **not** inherit user-level plugins from `~/.claude/plugins/`. The CE plugin installed at `~/.claude/plugins/marketplaces/compound-engineering-plugin/` was invisible to Dispatch. This is a known limitation (GitHub #26131).

**Why symlinks don't work:** The symlink target (`~/.claude/plugins/...`) doesn't exist when Dispatch clones the repo into a fresh environment. The plugin directory is a user-local artifact.

**Why nested directories don't work:** Claude Code skill discovery is flat — one level deep under `.claude/skills/`. Putting skills in `.claude/skills/compound-engineering/ce-plan/SKILL.md` would not be discovered.

**Skill precedence:** Enterprise > Personal > Project. Plugin skills get a separate namespace (e.g. `/compound-engineering:ce-plan`). Project-level skills at `.claude/skills/ce-plan/` are invoked as `/ce-plan`.

## Solution

Vendor the full compound-engineering plugin's skills and agents into the project's `.claude/` directory so they are committed to git and available in any environment that clones the repo.

### Step 1: Copy CE skills and agents

```bash
# From the plugin source
cp -r ~/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/skills/* .claude/skills/
cp -r ~/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/* .claude/agents/
```

45 skills and 29 agents (across design, docs, research, review, workflow categories).

### Step 2: Un-exclude directories from git

The devcontainer had `.claude/skills/` and `.claude/agents/` listed in `.git/info/exclude`. These exclusions were removed so the files could be committed.

### Step 3: Add tracking files

- **`.ce-version`** — Single-line file with the snapshot version (e.g. `2.44.0`). Clean git diffs on version bumps.
- **`.ce-manifest`** — Lists every CE-owned skill and agent. Distinguishes CE files from project-owned files. Enables deletion handling when upstream CE removes a skill.
- **`CE-LICENSE`** — MIT license in both `.claude/skills/` and `.claude/agents/`. Required for redistribution compliance.

### Step 4: Create `/sync-ce` skill

A two-phase update workflow for keeping the vendored snapshot current:

**Phase 1 (always runs):**
1. Compare `.ce-version` against upstream plugin version
2. Show brief diff preview (new/removed/modified skills and agents)
3. Run best-effort heuristic security scan on incoming changes
4. Ask for user confirmation

**Phase 2 (after confirmation):**
1. Identify the user (git name, GitHub username, initials)
2. Create worktree branch: `00-00-XX-chore-ce-sync-vX-Y-Z`
3. Delete CE files removed upstream (using manifest)
4. Copy updated files, update version, write fresh manifest
5. Commit, push, create PR assigned to the user
6. Clean up worktree

## Investigation Steps

1. Confirmed skills worked locally but not in Dispatch — Dispatch support confirmed this is a known limitation (#26131)
2. Explored symlinks — rejected because target doesn't exist in cloned repos
3. Explored nested subdirectories — rejected because skill discovery is flat
4. Explored git submodules — rejected because the submodule would clone into a subdirectory, not at the flat level discovery requires
5. Copied files and committed — worked, but accidentally included 129 ruflo/claude-flow files from the devcontainer
6. Identified and removed non-CE files using the manifest as a reference
7. Set up compound-reminder hook on Mac for PR creation nudges — discovered this only works on the local Mac, not in container or Dispatch

## Key Gotcha: Ruflo/Claude-Flow Contamination

The devcontainer had ruflo/claude-flow files in `.claude/agents/` and `.claude/skills/` locally (byzantine-coordinator, trading-predictor, flow-nexus, swarm coordinators, v3 agents, agentdb skills, etc.). When these directories were un-excluded from git, **all** files became visible — not just the CE ones. This resulted in 129 extra non-CE files being committed.

**How it was caught:** Code review (Jaco) flagged that the manifest listed 45 skills and 29 agents, but the PR contained 77 skill directories and 129 agent files.

**How it was fixed:** Compared directory contents against the `.ce-manifest`, identified all non-CE files, removed them with `git rm -r`.

**Prevention:** The `.ce-manifest` is the source of truth. The `/sync-ce` skill only copies files from the upstream CE repo and only deletes files listed in the manifest. Any non-CE files in `.claude/skills/` or `.claude/agents/` are left untouched.

## Prevention

1. **Always use `.ce-manifest` as the source of truth** for which files are CE-owned. Never manually add files to `.claude/skills/` or `.claude/agents/` and expect `/sync-ce` to manage them.
2. **CE-owned files are read-only.** Local modifications to CE files will be overwritten on the next sync. If you need to customize a CE skill, create a separate project-owned skill.
3. **Run `/sync-ce` to update** rather than manually copying from the plugin directory. The skill handles version checking, manifest updates, and PR creation.
4. **Check `.git/info/exclude` before un-excluding directories.** If other tools have populated `.claude/` directories locally, un-excluding them will expose those files to git.
5. **The compound-reminder hook** (checks for docs before PR creation) must be set up on each developer's Mac at `~/.claude/hooks/compound-reminder.sh` and registered in `~/.claude/settings.json`. It cannot be project-level because Dispatch doesn't reliably read project hooks. (auto memory [claude])

## Related

- [sandboxed-claude-code-devcontainer-setup.md](sandboxed-claude-code-devcontainer-setup.md) — Predecessor solution for Claude Code devcontainer integration
- [Devcontainer plan](../../plans/2026-03-25-001-feat-sandboxed-claude-code-devcontainer-plan.md) — Original plan that scoped the devcontainer setup
- [/sync-ce skill](../../.claude/skills/sync-ce/SKILL.md) — The sync mechanism for keeping vendored CE files current
- [docs/ai-foundations.md](../../docs/ai-foundations.md) — Project AI tooling documentation (should be updated to mention `.claude/skills/`)
