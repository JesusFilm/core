# when updating router version you'll need to:
# - update Dockerfile image version (ghcr.io/ardatan/hive-gateway:X.X.X)
# - update package.json ("@graphql-hive/gateway": "^X.X.X")
# - inform all developers to run npm i
FROM  ghcr.io/ardatan/hive-gateway:1.4.0
ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
EXPOSE 4000
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache curl && \
    curl -fsSL https://get.pnpm.io/install.sh | sh -s -- --bin-dir $PNPM_HOME --version 10 && \
    pnpm add pino@^9.3.2
COPY ./apis/api-gateway/gateway.prod.config.ts gateway.config.ts
COPY ./apis/api-gateway/src src
CMD ["supergraph"]