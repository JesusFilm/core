FROM node:20-bullseye-slim

EXPOSE 3000

ENV VERCEL=true

WORKDIR /app
COPY ./dist/apps/journeys-admin .

# dependencies
RUN bun i -g next
RUN bun i --omit=dev --force --silent
RUN bun i sharp pino dd-trace next-logger --force --silent

CMD NODE_OPTIONS='-r next-logger' bun start