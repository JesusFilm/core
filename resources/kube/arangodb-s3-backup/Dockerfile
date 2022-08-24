FROM arangodb/arangodb:3.9.0

RUN apk add --update aws-cli bash

ENV ARANGO_NO_AUTH=1

COPY resources/kube/arangodb-s3-backup/backup.sh .
RUN chmod 775 /backup.sh
RUN chmod u+x /backup.sh
