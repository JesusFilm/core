FROM node:22-alpine3.20

ARG SERVICE_VERSION=0.0.1
ARG BULLMQ_JOB=
ARG BULLMQ_QUEUE=
ARG CLOUDFLARE_R2_ENDPOINT=
ARG CLOUDFLARE_R2_ACCESS_KEY_ID=
ARG CLOUDFLARE_R2_SECRET=
ARG CLOUDFLARE_R2_BUCKET=
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV BULLMQ_QUEUE=$BULLMQ_QUEUE
ENV BULLMQ_JOB=$BULLMQ_JOB
ENV CLOUDFLARE_R2_ENDPOINT=$CLOUDFLARE_R2_ENDPOINT
ENV CLOUDFLARE_R2_ACCESS_KEY_ID=$CLOUDFLARE_R2_ACCESS_KEY_ID
ENV CLOUDFLARE_R2_SECRET=$CLOUDFLARE_R2_SECRET
ENV CLOUDFLARE_R2_BUCKET=$CLOUDFLARE_R2_BUCKET

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev ffmpeg && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apis/media-transcoder .
COPY ./pnpm-lock.yaml .

# dependencies that nestjs needs
RUN corepack enable && corepack prepare pnpm --activate
RUN pnpm install --prod --frozen-lockfile

CMD node ./main.js