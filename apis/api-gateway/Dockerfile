# when updating router version you'll need to:
# - update Dockerfile image version (ghcr.io/graphql-hive/hive-gateway:X.X.X)
# - update package.json ("@graphql-hive/gateway": "^X.X.X")
# - inform all developers to run npm i
# Keep Hive's CLI and entrypoint, replacing only its embedded Node 24 runtime.
FROM node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54 AS patched-node
FROM ghcr.io/graphql-hive/gateway:1.16.5@sha256:d72db15833f2b40719ad191cbb13ad301b1c4235244a0853e721002432f09e81
COPY --from=patched-node /usr/local/bin/node /usr/local/bin/node
ENV NODE_VERSION=24.22.3
RUN node -e "require('node:assert/strict').equal(process.versions.node, '24.22.3')"
ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
EXPOSE 4000
RUN npm install pino@^9.3.2
COPY ./apis/api-gateway/gateway.prod.config.ts gateway.config.ts
COPY ./apis/api-gateway/src src
CMD ["supergraph"]