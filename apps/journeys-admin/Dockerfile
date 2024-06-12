FROM node:20-bullseye-slim

EXPOSE 3000

ENV VERCEL=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app
COPY ./dist/apps/journeys-admin .

# dependencies
RUN pnpm i -g next
RUN pnpm i --omit=dev --force --silent
RUN pnpm i sharp pino dd-trace next-logger --force --silent

CMD NODE_OPTIONS='-r next-logger' pnpm start