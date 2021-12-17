FROM node:14-alpine
WORKDIR /app
COPY ./dist/apps/api-gateway .
EXPOSE 4000
# dependencies that apollo federation needs
RUN npm install apollo-server-express @firebase/app-compat@0.1.12
RUN npm install --production
CMD node ./main.js