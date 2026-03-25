---
title: "feat: Add sandboxed Claude Code to devcontainer"
type: feat
status: completed
date: 2026-03-25
---

# feat: Add sandboxed Claude Code to devcontainer

## Overview

Extend the existing devcontainer to include Claude Code CLI with `bypassPermissions` enabled, cherry-picking from the [Trail of Bits claude-code-devcontainer](https://github.com/trailofbits/claude-code-devcontainer) project. The container itself serves as the sandbox boundary, allowing Claude to execute commands without per-action confirmation prompts while keeping the host system protected.

## Problem Statement / Motivation

Developers using Claude Code in this devcontainer currently face frequent permission prompts for common operations (shell commands, file edits). The existing `settings.local.json` allowlist is a partial solution but requires constant maintenance and still blocks unlisted commands. Trail of Bits' approach — treating the container as the trust boundary and enabling `bypassPermissions` — provides a cleaner developer experience while maintaining security through isolation.

## Proposed Solution

Cherry-pick the relevant Claude Code sandboxing components from the ToB project into our existing devcontainer. This is additive — all existing services (db, redis, clickhouse, plausible, etc.) continue working unchanged.

### Changes by file

#### 1. `.devcontainer/Dockerfile` — Install Claude Code CLI

Add Claude Code installation after existing global npm installs, running as the `node` user:

```dockerfile
# Install Claude Code CLI
USER node
RUN curl -fsSL https://claude.ai/install.sh | bash
USER root
```

**Placement:** After the `npm install -g npm@latest` line (line 42) and before `WORKDIR /home/node`. The install script places the binary at `/home/node/.local/bin/claude`.

**Version pinning decision:** The ToB repo uses the install script without pinning. Since Claude Code auto-updates itself on launch, pinning in the Dockerfile provides minimal benefit and adds maintenance overhead. Use the install script as-is.

#### 2. `.devcontainer/docker-compose.yml` — Environment & capabilities

Add to the `app` service:

```yaml
app:
  # ... existing config ...
  environment:
    # ... existing env vars ...
    CLAUDE_CONFIG_DIR: /home/node/.claude
  cap_add:
    - NET_ADMIN
    - NET_RAW
```

**Auth token forwarding:** Tokens are forwarded via `remoteEnv` in `devcontainer.json` (see below), not in docker-compose.yml, to avoid any risk of committing secrets. The `env_file` approach is not needed since `remoteEnv` with `${localEnv:...}` handles this cleanly.

**Volume note:** The existing `core-node-user` named volume already mounts at `/home/node`, which means `~/.claude`, `~/.bash_history`, and `~/.local/bin/claude` all persist across container rebuilds automatically. **No additional volume mounts are needed.**

#### 3. `.devcontainer/devcontainer.json` — Extensions, env forwarding, settings

```jsonc
{
  // ... existing config ...
  "customizations": {
    "vscode": {
      "extensions": [
        // ... existing extensions ...
        "anthropic.claude-code"
      ],
      "settings": {
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    }
  },
  "remoteEnv": {
    "CLAUDE_CODE_OAUTH_TOKEN": "${localEnv:CLAUDE_CODE_OAUTH_TOKEN:}",
    "ANTHROPIC_API_KEY": "${localEnv:ANTHROPIC_API_KEY:}"
  },
  "containerEnv": {
    "NPM_CONFIG_AUDIT": "true",
    "NPM_CONFIG_FUND": "false"
  }
}
```

**Auth mechanism:** `remoteEnv` with `${localEnv:...}` reads from the host's environment variables. Developers set `CLAUDE_CODE_OAUTH_TOKEN` or `ANTHROPIC_API_KEY` in their shell profile (`~/.bashrc`, `~/.zshrc`, etc.) or use Codespaces secrets. The `:` suffix provides an empty default, so the container builds fine without tokens set.

**NPM security defaults — scoped conservatively:**
- `NPM_CONFIG_AUDIT=true` — enables audit on install
- `NPM_CONFIG_FUND=false` — suppresses funding messages
- **NOT** setting `NPM_CONFIG_IGNORE_SCRIPTS=true` — this project uses native modules (`libpixman`, `libcairo`, `libpango`) that require install scripts. Setting `ignore-scripts` would break `pnpm install`.

#### 4. `.devcontainer/post-create-command.sh` — Enable bypassPermissions

Append to the end of the existing script:

```bash
# Configure Claude Code with bypassPermissions
echo "Configuring Claude Code..."
CLAUDE_DIR="/home/node/.claude"
CLAUDE_SETTINGS="$CLAUDE_DIR/settings.json"
mkdir -p "$CLAUDE_DIR"

# Write settings with bypassPermissions enabled
# Preserves existing settings if present
if [ -f "$CLAUDE_SETTINGS" ]; then
  # Merge bypassPermissions into existing settings
  node -e "
    const fs = require('fs');
    const settings = JSON.parse(fs.readFileSync('$CLAUDE_SETTINGS', 'utf8'));
    settings.permissions = settings.permissions || {};
    settings.permissions.defaultMode = 'bypassPermissions';
    fs.writeFileSync('$CLAUDE_SETTINGS', JSON.stringify(settings, null, 2) + '\n');
  "
else
  echo '{"permissions":{"defaultMode":"bypassPermissions"}}' | node -e "
    const fs = require('fs');
    let data = '';
    process.stdin.on('data', d => data += d);
    process.stdin.on('end', () => {
      fs.mkdirSync('$CLAUDE_DIR', { recursive: true });
      fs.writeFileSync('$CLAUDE_SETTINGS', JSON.stringify(JSON.parse(data), null, 2) + '\n');
    });
  "
fi

# Bypass onboarding wizard if auth token is available
if [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  echo "Bypassing Claude Code onboarding (token present)..."
  CLAUDE_JSON="/home/node/.claude.json"
  timeout 30 claude -p "ok" 2>/dev/null || true
  if [ -f "$CLAUDE_JSON" ]; then
    node -e "
      const fs = require('fs');
      const config = JSON.parse(fs.readFileSync('$CLAUDE_JSON', 'utf8'));
      config.hasCompletedOnboarding = true;
      fs.writeFileSync('$CLAUDE_JSON', JSON.stringify(config, null, 2) + '\n');
    "
  fi
fi
echo "Claude Code configured!"
```

**Why Node.js for JSON manipulation:** The container already has Node.js and `jq` is not installed. Using Node ensures reliable JSON merging without adding a new dependency.

**Ordering:** Runs at the end of post-create, after all other setup. If earlier steps fail, the script already exits (via `set -e`), so Claude setup won't run in a broken environment.

## Technical Considerations

### Security: docker-outside-of-docker + bypassPermissions

**This is the most important technical consideration.**

The existing devcontainer includes the `docker-outside-of-docker` feature, which gives the container access to the host's Docker daemon. Combined with `bypassPermissions`, Claude Code could theoretically:
- Mount the host filesystem via `docker run -v /:/host ...`
- Start privileged containers on the host
- Access other containers' data

**Risk assessment:** This devcontainer is used for local development, not in production. The threat model is primarily accidental damage (Claude misinterpreting a prompt), not adversarial attack. The existing Docker socket access is already a trust boundary that developers have accepted.

**Mitigation options (ordered by recommendation):**

1. **Accept the risk for local dev** — The container is already trusted with Docker access. `bypassPermissions` doesn't meaningfully increase the blast radius since Claude could already be given Docker commands via the allowlist. Document the risk.

2. **Add Docker command restrictions to `.claude/settings.json`** — Add deny rules for `docker run` with host mounts:
   ```json
   { "permissions": { "deny": ["Bash(docker run*-v /*)"] } }
   ```

3. **Remove docker-outside-of-docker when using Claude** — Too disruptive; developers need Docker for builds and testing.

**Recommendation:** Option 1 with documentation. Option 2 as a belt-and-suspenders addition.

### Codespaces vs Local Docker

| Aspect | Local | Codespaces |
|--------|-------|------------|
| Auth tokens | Host env vars via `${localEnv:...}` | Codespaces secrets (same `remoteEnv` syntax works) |
| `cap_add` | Works directly | May require org policy approval |
| Docker socket | Host Docker daemon | Codespaces VM Docker |
| Network isolation | iptables available | May be restricted |

The proposed changes work in both environments. `cap_add` in Codespaces may need org-level approval — document this.

### What's NOT included (and why)

| ToB Feature | Decision | Reason |
|-------------|----------|--------|
| Separate `~/.claude` volume | Skip | Existing `core-node-user` volume already persists `/home/node` |
| Separate command history volume | Skip | Same reason — already persisted |
| `~/.gitconfig` read-only bind mount | Skip | Not relevant; git config is inside the container |
| Oh My Zsh / Powerlevel10k | Skip | Not relevant to Claude sandboxing |
| Python 3.13 via uv | Skip | Python feature already included in devcontainer features |
| ast-grep / fzf / git-delta / tmux | Skip | Nice-to-haves, not related to sandboxing. Can be added later. |
| bubblewrap (bwrap) | Skip | Used by Claude Code internally for filesystem sandboxing; Claude's install script handles this if needed |
| `devc` CLI helper | Skip | Designed for the standalone ToB workflow, not applicable to an existing docker-compose setup |
| Global gitignore setup | Skip | Project already has `.gitignore`; not needed for sandboxing |
| `NPM_CONFIG_IGNORE_SCRIPTS` | Skip | Would break native module builds in this project |
| `NPM_CONFIG_MINIMUM_RELEASE_AGE` | Skip | Overly restrictive for active development |

## System-Wide Impact

- **Interaction graph:** No impact on application code or services. Changes are limited to the devcontainer build and setup pipeline.
- **Error propagation:** If Claude Code installation fails in the Dockerfile, the entire container build fails (fail-fast). If post-create Claude setup fails, it's the last step and won't affect other services.
- **State lifecycle:** `~/.claude` settings persist via the existing `core-node-user` volume. A `Rebuild Container` preserves settings. A `Rebuild Container Without Cache` + volume prune would reset them (expected behavior).
- **API surface parity:** N/A — infrastructure change only.

## Acceptance Criteria

### Functional Requirements

- [ ] `claude` CLI is available on `$PATH` when opening a terminal in the devcontainer
- [ ] Running `claude` with a valid `CLAUDE_CODE_OAUTH_TOKEN` or `ANTHROPIC_API_KEY` set on the host starts a session without manual auth
- [ ] Claude Code operates in `bypassPermissions` mode (no per-command approval prompts)
- [ ] Claude Code VS Code extension (`anthropic.claude-code`) is installed and functional
- [ ] All existing services (db, redis, clickhouse, plausible, maildev, serverless-redis-http) continue to work
- [ ] `post-create-command.sh` completes successfully with all existing setup steps intact
- [ ] `pnpm install` succeeds (NPM security defaults do not break native module builds)

### Non-Functional Requirements

- [ ] Container without auth tokens builds and starts successfully (Claude just requires manual auth on first use)
- [ ] `~/.claude` settings persist across container rebuilds (verified via existing `core-node-user` volume)
- [ ] No secrets are committed to version control

### Quality Gates

- [ ] Dockerfile builds successfully
- [ ] Full devcontainer startup completes without errors
- [ ] Manual test: run `claude -p "what directory am I in?"` and get a response

## Dependencies & Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Claude Code install script changes or becomes unavailable | Low | Build fails | Pin a fallback: `npm install -g @anthropic-ai/claude-code` |
| `cap_add` blocked in Codespaces | Medium | NET_ADMIN/NET_RAW unavailable | Document as optional; core functionality works without it |
| Docker socket + bypassPermissions escape | Low | Host compromise | Document risk; add deny rules for dangerous Docker patterns |
| Post-create script timeout increases | Low | Slower first build | Claude setup is fast (~5s); onboarding bypass has 30s timeout |

## Implementation Phases

### Phase 1: Core Installation (Single PR)

All changes in one PR — the scope is small enough.

**Files to modify:**

1. **`.devcontainer/Dockerfile`** (~3 lines added)
   - Add `USER node` / `curl -fsSL https://claude.ai/install.sh | bash` / `USER root` after npm global install

2. **`.devcontainer/docker-compose.yml`** (~4 lines added)
   - Add `CLAUDE_CONFIG_DIR` to `app.environment`
   - Add `cap_add: [NET_ADMIN, NET_RAW]` to `app`

3. **`.devcontainer/devcontainer.json`** (~12 lines added)
   - Add `anthropic.claude-code` to extensions
   - Add `remoteEnv` block with token forwarding
   - Add `containerEnv` block with NPM audit/fund settings

4. **`.devcontainer/post-create-command.sh`** (~30 lines added)
   - Append Claude Code bypassPermissions setup
   - Append onboarding bypass (conditional on token)

### Phase 2: Documentation & Polish (Optional follow-up)

- Add a section to the contributing guide about setting up Claude Code tokens
- Add `.env.example` with placeholder `CLAUDE_CODE_OAUTH_TOKEN=` and `ANTHROPIC_API_KEY=`
- Consider adding Docker command deny rules to `.claude/settings.json`

## Sources & References

### Internal References

- Existing devcontainer: `.devcontainer/Dockerfile`, `docker-compose.yml`, `devcontainer.json`
- Claude settings: `.claude/settings.json` (deny rules), `.claude/settings.local.json` (allowlist)
- Gitignore: `.gitignore` (already ignores `.env` and `.env*local`)

### External References

- Trail of Bits claude-code-devcontainer: https://github.com/trailofbits/claude-code-devcontainer
- Claude Code install: https://claude.ai/install.sh
- Devcontainer spec (remoteEnv): https://containers.dev/implementors/json_reference/#general-properties
