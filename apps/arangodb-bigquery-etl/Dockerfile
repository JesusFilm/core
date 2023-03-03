FROM debian:stable-slim

RUN apt update
RUN apt install apt-transport-https ca-certificates curl gnupg -y
RUN curl -OL https://download.arangodb.com/arangodb310/DEBIAN/Release.key
RUN apt-key add - < Release.key
RUN echo 'deb https://download.arangodb.com/arangodb310/DEBIAN/ /' | tee /etc/apt/sources.list.d/arangodb.list
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -


RUN apt update
RUN apt install arangodb3-client=3.10.3-1 google-cloud-cli -y

COPY apps/arangodb-bigquery-etl/bqexport.sh .
RUN chmod 775 /bqexport.sh
RUN chmod u+x /bqexport.sh
CMD /bqexport.sh