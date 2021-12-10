FROM node:lts-alpine
WORKDIR /app
COPY ./dist/apps/api-journeys .
ENV PORT=4001
EXPOSE ${PORT}
RUN npm install --production --unsafe-perm=true --allow-root
# dependencies that nestjs needs
RUN npm install reflect-metadata tslib rxjs
CMD node ./main.js