FROM node:24-alpine3.23
WORKDIR /app
COPY --chown=node:node dist/apis/api-auth/main.mjs ./main.mjs
USER node
EXPOSE 4011
STOPSIGNAL SIGTERM
ENTRYPOINT ["node", "main.mjs"]
