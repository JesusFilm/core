#!/bin/bash

# dump database
arangodump --output-directory "dump" --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL --overwrite

# archive results
tar -zcvf "arangodb-$(date '+%Y-%m-%d').tar.gz" dump

# upload to s3
aws s3 cp "arangodb-$(date '+%Y-%m-%d').tar.gz" $S3_BUCKET

# cleanup
rm -rf dump
rm *.tar.gz