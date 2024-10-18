# when updating router version you'll need to:
# - update Dockerfile image version (ghcr.io/ardatan/hive-gateway:X.X.X)
# - update package.json ("@graphql-hive/gateway": "^X.X.X")
# - inform all developers to run npm i
FROM  ghcr.io/ardatan/hive-gateway:1.2.0
ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
EXPOSE 4000
RUN npm install pino@^9.3.2
COPY ./apps/api-gateway/gateway.prod.config.ts gateway.config.ts
COPY ./apps/api-gateway/src src
CMD ["supergraph"]