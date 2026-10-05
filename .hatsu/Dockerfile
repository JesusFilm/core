# STUB — not built or used yet. See .hatsu/README.md.
#
# Hatsu's per-ticket isolation is a git worktree on the pipeline VM
# (ENG-3699); this Dockerfile reserves the sandbox seam for the one case
# that may later need real containers: parallel QA runs booting the full
# stack with namespaced ports/DB (ENG-3719). Vera's tickets will make this
# real; until then it documents the intended base.

FROM node:22-bookworm-slim

# Match the VM toolchain (ENG-3701): pnpm via corepack, git for worktrees.
RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends \
    git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Non-root by default (Sandcastle precedent: agents never run as root; any
# mounted worktree must be owned compatibly with the node user).
RUN mkdir -p /workspace && chown node:node /workspace
WORKDIR /workspace
USER node
