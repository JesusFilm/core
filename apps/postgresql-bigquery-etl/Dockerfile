FROM node:16-alpine

RUN apk add --update \
postgresql-client \
python2 \
curl \
which \
jq \
bash
RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH $PATH:/root/google-cloud-sdk/bin

ENV ARANGO_NO_AUTH=1

COPY resources/kube/arangodb-bigquery-etl/pgexport.sh .
RUN chmod 775 /pgexport.sh
RUN chmod u+x /pgexport.sh
