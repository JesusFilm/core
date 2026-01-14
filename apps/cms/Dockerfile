FROM node:22-alpine3.20

EXPOSE 1337

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV NODE_ENV=production
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /app

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml* ./

RUN corepack enable && corepack prepare pnpm --activate
RUN pnpm install --frozen-lockfile --silent

COPY . .

RUN pnpm run build

CMD ["pnpm", "run", "start"]

