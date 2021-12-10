FROM node:lts-alpine
WORKDIR /app
COPY ./dist/apps/api-gateway .
ENV PORT=4000
EXPOSE ${PORT}
RUN npm install --production
# # dependencies that nestjs needs
# RUN npm install reflect-metadata tslib rxjs @nestjs/platform-express
CMD node ./main.js