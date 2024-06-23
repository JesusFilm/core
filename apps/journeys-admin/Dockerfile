FROM node:20-bullseye-slim

EXPOSE 3000

ENV VERCEL=true

ENV BUN_INSTALL="/bun"
ENV PATH=$BUN_INSTALL/bin:$PATH

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.16"

WORKDIR /app
COPY ./dist/apps/journeys-admin .

# dependencies
RUN bun i -g next
RUN bun i --production --force --silent
RUN bun i sharp pino dd-trace next-logger --force --silent

CMD NODE_OPTIONS='-r next-logger' bun run start