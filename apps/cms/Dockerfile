FROM node:22-bookworm-slim

# -------------------------
# System deps for sharp / vips / canvas (runtime only, no build tools needed)
# -------------------------
RUN apt-get update && apt-get install -y \
  # sharp
  libglib2.0-0 \
  libexpat1 \
  ca-certificates \
  # canvas
  libcairo2 \
  libpango-1.0-0 \
  libjpeg62-turbo \
  libgif7 \
  librsvg2-2 \
  && rm -rf /var/lib/apt/lists/*

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"

# -------------------------
# Workspace root
# -------------------------
WORKDIR /opt

# Copy only what pnpm needs to resolve CMS
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json ./apps/cms/package.json

# Enable pnpm and prepare the version from package.json
RUN corepack enable && corepack prepare --activate

# Install ONLY cms deps
# Mount pnpm store cache (works in GitHub Actions with Buildx)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install \
  --frozen-lockfile \
  --filter ./apps/cms...

# -------------------------
# Copy CMS source only
# -------------------------
COPY apps/cms ./apps/cms

WORKDIR /opt/apps/cms

RUN chown -R node:node /opt/apps/cms
USER node

RUN ["pnpm", "run", "build"]

EXPOSE 1337
CMD ["pnpm", "run", "start"]
