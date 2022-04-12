FROM arangodb/arangodb:3.9.0

RUN apk add --update \
python \
curl \
which \
bash
RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH $PATH:/root/google-cloud-sdk/bin

COPY ./apps/biqquery-exporter/bqexport.sh /etc/periodic/daily/
