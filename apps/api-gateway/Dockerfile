# when updating router version you'll need to:
# - update Dockerfile image version (ghcr.io/ardatan/hive-gateway:X.X.X)
# - update package.json ("@graphql-hive/gateway": "^X.X.X")
# - inform all developers to run npm i
FROM  ghcr.io/ardatan/hive-gateway:1.0.5
EXPOSE 4000
COPY ./apps/api-gateway/gateway.prod.config.ts gateway.config.ts
CMD ["supergraph"]