FROM node:24-alpine3.23
WORKDIR /app
COPY --chown=node:node dist/apis/api-mcp/main.cjs ./main.cjs
USER node
EXPOSE 4010
STOPSIGNAL SIGTERM
ENTRYPOINT ["node", "main.cjs"]
