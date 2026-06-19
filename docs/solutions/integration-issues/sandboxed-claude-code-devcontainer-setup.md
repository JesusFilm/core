---
title: 'Integrating Sandboxed Claude Code into an Existing Multi-Service Devcontainer'
category: integration-issues
date: 2026-03-25
tags:
  - devcontainer
  - claude-code
  - docker
  - bypassPermissions
  - security
  - developer-experience
components:
  - .devcontainer/Dockerfile
  - .devcontainer/devcontainer.json
  - .devcontainer/docker-compose.yml
  - .devcontainer/post-create-command.sh
  - .claude/settings.json
---

# Integrating Sandboxed Claude Code into an Existing Multi-Service Devcontainer

## Problem

Developers using Claude Code in a complex Nx monorepo devcontainer (docker-compose with PostgreSQL, Redis, ClickHouse, Plausible, etc.) faced frequent permission prompts for common operations. The existing `settings.local.json` allowlist approach was fragile and required constant maintenance.

The Trail of Bits [claude-code-devcontainer](https://github.com/trailofbits/claude-code-devcontainer) project solves this by treating the container as the sandbox boundary and enabling `bypassPermissions`. However, their project is a **standalone devcontainer replacement** — their install instructions (`devc .` or `git clone ... .devcontainer/`) would overwrite the existing multi-service setup entirely.

## Root Cause

The integration challenge was that Trail of Bits' project is not a composable devcontainer "feature" — it is a complete `.devcontainer/` directory replacement. Adapting it required understanding which pieces to extract, which to skip, and how the existing infrastructure (volumes, services, user setup) already satisfied some requirements.

## Solution

Cherry-pick the essential Claude Code features into the existing devcontainer. Total: **+31 lines across 4 files** (simplified from an initial +62 after code review).

### 1. Dockerfile — Install CLI

After existing npm global installs, add:

```dockerfile
USER node
RUN curl -fsSL https://claude.ai/install.sh | bash
USER root
```

Binary lands at `/home/node/.local/bin/claude`. The `USER` switch ensures correct ownership.

### 2. devcontainer.json — Extension + auth forwarding

```jsonc
// Add to customizations.vscode.extensions:
"anthropic.claude-code"

// Add new top-level block:
"remoteEnv": {
    "CLAUDE_CODE_OAUTH_TOKEN": "${localEnv:CLAUDE_CODE_OAUTH_TOKEN:}",
    "ANTHROPIC_API_KEY": "${localEnv:ANTHROPIC_API_KEY:}"
}
```

`remoteEnv` with `${localEnv:...}` reads host env vars at container start. The trailing `:` provides an empty default so the container works without tokens set.

### 3. post-create-command.sh — bypassPermissions + onboarding bypass

```bash
mkdir -p /home/node/.claude
echo '{ "permissions": { "defaultMode": "bypassPermissions" } }' > /home/node/.claude/settings.json

if [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  echo '{ "hasCompletedOnboarding": true }' > /home/node/.claude.json
fi
```

### 4. .claude/settings.json — Docker escape deny rules

```json
{
  "permissions": {
    "deny": ["Read(**/.env*)", "Read(**/.env.*)", "Bash(docker run*-v /*)", "Bash(docker run*--privileged*)"]
  }
}
```

The devcontainer mounts the Docker socket via `docker-outside-of-docker`. With `bypassPermissions`, Claude could escape via `docker run -v /:/host ...`. These deny rules block the obvious escape vectors.

## What Was Intentionally Skipped (and Why)

| Trail of Bits Feature                                    | Reason Skipped                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| Separate `~/.claude` volume                              | Existing `core-node-user` volume already persists `/home/node`    |
| `NET_ADMIN` / `NET_RAW` capabilities                     | No iptables rules configured; adds attack surface with no benefit |
| `containerEnv` NPM defaults (`audit=true`, `fund=false`) | `audit=true` is already the npm default; `fund=false` is cosmetic |
| `NPM_CONFIG_IGNORE_SCRIPTS=true`                         | Would break native module builds (libpixman, libcairo, libpango)  |
| `CLAUDE_CONFIG_DIR` env var                              | Redundant when `$HOME` is already `/home/node`                    |
| Node.js JSON manipulation in post-install                | Simple `echo` produces identical result in 90% less code          |
| Oh My Zsh / git-delta / tmux / fzf                       | Nice-to-haves unrelated to sandboxing                             |
| bubblewrap / `devc` CLI helper                           | Designed for standalone workflow, not docker-compose setups       |

## Prevention Strategies

### 1. Audit existing volumes before adding persistence

Before adding volumes for a new tool, check if existing mounts already cover the path. A volume at `/home/node` already persists `~/.claude`, `~/.config`, `~/.npm`, and all other dotfile directories.

### 2. Grant Linux capabilities only with a concrete use case

Don't add `cap_add` entries for capabilities you're not actively using. `NET_ADMIN`/`NET_RAW` without iptables rules only widens the attack surface.

### 3. Pair Docker socket access with deny rules

Any tool with unrestricted command execution + Docker socket access can escape the container. Always add deny rules for `docker run -v /...` and `docker run --privileged` patterns.

### 4. Prefer simplicity over faithfulness to reference projects

When adapting from a reference, ask: "What's the minimal implementation that produces the same result?" A 2-line `echo` is better than 20 lines of Node.js JSON manipulation when the output is static.

### 5. Verify env vars actually change behavior

`NPM_CONFIG_AUDIT=true` is the npm default. Before copying env var settings from reference projects, confirm they differ from the tool's defaults.

### 6. Test native module compatibility before disabling install scripts

Check for native module dependencies (`libpixman`, `libcairo`, `sharp`, `bcrypt`, etc.) before setting `NPM_CONFIG_IGNORE_SCRIPTS=true`.

## Key Risk

The combination of `bypassPermissions` + Docker socket access is the primary security concern. Deny rules mitigate the most obvious escape vectors, but a determined actor with code execution could potentially find other paths through the Docker socket. For higher-security environments, consider removing the Docker socket mount entirely.

## Related

- Plan: `docs/plans/2026-03-25-001-feat-sandboxed-claude-code-devcontainer-plan.md`
- Trail of Bits repo: https://github.com/trailofbits/claude-code-devcontainer
- Devcontainer spec (remoteEnv): https://containers.dev/implementors/json_reference/#general-properties
