# when updating router version you'll need to:
# - update Dockerfile image version (ghcr.io/ardatan/hive-gateway:X.X.X)
# - update package.json ("@graphql-hive/gateway": "^X.X.X")
# - inform all developers to run npm i
FROM  ghcr.io/ardatan/hive-gateway:2.0.0
ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV OTEL_SERVICE_NAME="api-gateway"
EXPOSE 4000
RUN npm install pino@^9.13.0 pino-pretty@^13.0.0 @graphql-hive/logger@^1.0.7
COPY ./apis/api-gateway/gateway.prod.config.ts gateway.config.ts
COPY ./apis/api-gateway/src src
CMD ["supergraph", "--opentelemetry", "http://0.0.0.0:4317", "--opentelemetry-exporter-type", "otlp-grpc"]