FROM arangodb/arangodb:3.9.0

RUN apk add --update \
python2 \
curl \
which \
bash
RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH $PATH:/root/google-cloud-sdk/bin

ENV ARANGO_NO_AUTH=1

COPY ./bqexport.sh .
COPY ./bqexport.sh /etc/periodic/daily/
