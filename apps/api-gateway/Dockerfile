ARG GOOGLE_APPLICATION_JSON
FROM node:14-alpine
ENV GOOGLE_APPLICATION_JSON=$GOOGLE_APPLICATION_JSON
WORKDIR /app
COPY ./dist/apps/api-gateway .
EXPOSE 4000
RUN npm install --production
# dependencies that apollo federation needs
RUN npm install apollo-server-express
CMD node ./main.js