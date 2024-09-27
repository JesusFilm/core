# when updating router version you'll need to:
# - update Dockerfile image version (ghcr.io/ardatan/hive-gateway:X.X.X)
# - update package.json ("@graphql-hive/gateway": "^X.X.X")
# - inform all developers to run npm i
FROM  ghcr.io/ardatan/hive-gateway:1.0.5
EXPOSE 4000

# fix `node-libcurl is not installed properly which is used for better performance and developer experience. Falling back to "node:http".`
USER root
RUN apt-get update \
  && apt-get install -y python3 libcurl4-openssl-dev build-essential
USER node
RUN npm install node-libcurl

COPY ./apps/api-gateway/gateway.prod.config.ts gateway.config.ts
CMD ["supergraph"]