FROM node:22-alpine

# -------------------------
# System deps for sharp / vips / canvas
# -------------------------
RUN apk add --no-cache \
  build-base \
  gcc \
  autoconf \
  automake \
  zlib-dev \
  libpng-dev \
  nasm \
  bash \
  vips-dev \
  git \
  cairo-dev \
  pango-dev \
  jpeg-dev \
  giflib-dev \
  pixman-dev \
  freetype-dev \
  fontconfig-dev \
  cairo \
  pango \
  jpeg \
  giflib \
  pixman \
  fontconfig \
  ttf-dejavu

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"

# Enable pnpm
RUN corepack enable

# -------------------------
# Workspace root
# -------------------------
WORKDIR /opt

# Copy only what pnpm needs to resolve CMS
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json ./apps/cms/package.json

# Install ONLY cms deps
RUN pnpm install \
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
