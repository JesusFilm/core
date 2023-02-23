FROM debian:stable-slim

RUN curl -OL https://download.arangodb.com/arangodb310/DEBIAN/Release.key
RUN apt-key add - < Release.key
RUN echo 'deb https://download.arangodb.com/arangodb310/DEBIAN/ /' | tee /etc/apt/sources.list.d/arangodb.list
RUN apt-get install apt-transport-https
RUN apt-get update
RUN apt install \
which \
jq \
arangodb3-client=3.10.3-1

RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH $PATH:/root/google-cloud-sdk/bin

COPY apps/arangodb-bigquery-etl/bqexport.sh .
RUN chmod 775 /bqexport.sh
RUN chmod u+x /bqexport.sh
CMD /bqexport.sh