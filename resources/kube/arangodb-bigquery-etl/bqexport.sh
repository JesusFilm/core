#!/bin/bash

export DATABASE_URL="http+tcp://arangodb:8529"
echo $GCLOUD_JSON > /gcloud.json
export GOOGLE_APPLICATION_CREDENTIALS="/gcloud.json"
gcloud auth activate-service-account jfp-core@jfp-data-warehouse.iam.gserviceaccount.com --key-file="/gcloud.json" --project=jfp-data-warehouse

collections=("blocks" "journeys" "languages" "responses" "userJourneys" "users" "videoTags")
for collection in "${collections[@]}"
do
  echo "Exporting $collection from ArangoDB"
  arangoexport --type jsonl --collection $collection --compress-output true --overwrite true --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL
  echo "Importing $collection to BigQuery"
  bq --project_id jfp-data-warehouse load --replace --source_format NEWLINE_DELIMITED_JSON --autodetect nextsteps.$collection export/$collection.jsonl.gz
done

# videos requires field specificity, since it contains some nested arrays
echo "Exporting videos from ArangoDB"
arangoexport --type jsonl --compress-output true --overwrite true --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL --query "FOR v IN videos RETURN {_key: v._key, type: v.type, primaryLanguageId: v.primaryLanguageId, title: v.title, snippet: v.snippet, description: v.description, image: v.image, tagIds: v.tagIds, episodeIds: v.episodeIds, variants: v.variants, permalink: v.permalink, noIndex: v.noIndex, seoTitle: v.seoTitle, imageAlt: v.imageAlt}"
echo "Importing videos to BigQuery"
bq --project_id jfp-data-warehouse load --replace --source_format NEWLINE_DELIMITED_JSON --autodetect nextsteps.videos export/query.jsonl.gz

rm /export/*.gz
