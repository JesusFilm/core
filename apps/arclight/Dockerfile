FROM node:22-bullseye-slim

EXPOSE 3000

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV VERCEL=true
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      python3 \
      python3-pip \
      libcurl4-openssl-dev \
      postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ./dist/apps/arclight .
COPY ./libs/prisma/media/db ./prisma-media/db
COPY ./libs/prisma/media/prisma.config.ts ./prisma-media/prisma.config.ts
COPY ./libs/prisma/languages/db ./prisma-languages/db
COPY ./libs/prisma/languages/prisma.config.ts ./prisma-languages/prisma.config.ts

# dependencies
RUN mkdir -p $PNPM_HOME && corepack enable && corepack prepare pnpm@10.15.1 --activate
RUN pnpm add -g next
RUN pnpm install --prod --silent
RUN pnpm add sharp pino dd-trace next-logger @prisma/client@7.4.2 @prisma/adapter-pg@7.4.2 dotenv --silent
RUN pnpm add -D prisma@7.4.2
CMD ["sh","-lc","pnpm exec prisma migrate deploy --config ./prisma-media/prisma.config.ts && pnpm exec prisma migrate deploy --config ./prisma-languages/prisma.config.ts && NODE_OPTIONS='-r next-logger' pnpm start"]
