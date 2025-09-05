ENV PNPM_HOME="~/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
corepack enable && corepack prepare pnpm --activate