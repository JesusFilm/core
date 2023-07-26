#!/bin/bash

printenv GCLOUD > /gcloud.json
export GOOGLE_APPLICATION_CREDENTIALS="/gcloud.json"
gcloud auth activate-service-account jfp-core@jfp-data-warehouse.iam.gserviceaccount.com --key-file="/gcloud.json" --project=jfp-data-warehouse

# videos
echo "Exporting videos from ArangoDB"
arangoexport --type jsonl --compress-output true --overwrite true --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL --custom-query "FOR v IN videos RETURN { _key: v._key, label: v.label, primaryLanguageId: v.primaryLanguageId, slug: v.slug, __typename: v.__typename }" 
echo "Importing videos to BigQuery"
bq --project_id jfp-data-warehouse load --replace --source_format NEWLINE_DELIMITED_JSON --autodetect nextsteps.videos export/query.jsonl.gz

rm /export/*.gz
