FROM node:22-bookworm-slim AS base

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"

RUN apt-get update && apt-get install -y --no-install-recommends \
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

WORKDIR /app

FROM base AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN corepack enable && corepack prepare pnpm --activate

COPY apps/cms ./apps/cms

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  pnpm deploy --prod --filter cms ./apps/cms/deploy

WORKDIR /app/apps/cms/deploy

RUN ["npm", "run", "build"]

FROM base AS runtime

COPY --from=build --chown=node:node /app/apps/cms/deploy .

USER node

EXPOSE 1337
CMD ["npm", "run", "start"]
