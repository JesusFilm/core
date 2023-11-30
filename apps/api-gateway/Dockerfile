# when updating router version you'll need to:
# - update .devcontainer/post-create-command.sh apollo router version (...nix/vX.X.X)
# - update app/api-gateway/Dockerfile image version (...router/vX.X.X)
# - inform all developers to rebuild their containers
FROM ghcr.io/apollographql/router:v1.34.1
COPY ./apps/api-gateway/router.prod.yaml /dist/config/router.yaml