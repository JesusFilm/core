FROM node:16-alpine
WORKDIR /app
COPY ./dist/apps/api-gateway .
EXPOSE 4000
# dependencies that apollo federation needs
RUN npm install --production
RUN npm install apollo-server-express @firebase/app-compat@0.1.12
CMD node ./main.js