#!/bin/bash

export DATABASE_URL="http+tcp://arangodb:8529"
cp /etc/gcloud/gcloud /gcloud.json
export GOOGLE_APPLICATION_CREDENTIALS="/gcloud.json"
gcloud auth activate-service-account jfp-core@jfp-data-warehouse.iam.gserviceaccount.com --key-file="/gcloud.json" --project=jfp-data-warehouse

collections=("blocks" "journeys" "languages" "responses" "userJourneys" "users" "videoTags" "countries")
for collection in "${collections[@]}"
do
  echo "Exporting $collection from ArangoDB"
  arangoexport --type jsonl --collection $collection --compress-output true --overwrite true --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL
  echo "Importing $collection to BigQuery"
  bq --project_id jfp-data-warehouse load --replace --source_format NEWLINE_DELIMITED_JSON --autodetect nextsteps.$collection export/$collection.jsonl.gz
done

# videos requires field specificity, since it contains some nested arrays
echo "Exporting videos from ArangoDB"
arangoexport --type jsonl --compress-output true --overwrite true --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL --query "FOR v IN videos RETURN {_key: v._key, type: v.type, primaryLanguageId: v.primaryLanguageId, title: v.title, snippet: v.snippet, description: v.description, image: v.image, tagIds: v.tagIds, episodeIds: v.episodeIds, variants: v.variants, slug: v.slug, noIndex: v.noIndex, seoTitle: v.seoTitle, imageAlt: v.imageAlt}"
echo "Importing videos to BigQuery"
bq --project_id jfp-data-warehouse load --replace --source_format NEWLINE_DELIMITED_JSON --autodetect nextsteps.videos export/query.jsonl.gz

# events requires special AQL due to changing fieldsets
echo "Exporting events from ArangoDB"
arangoexport --type json --collection events --overwrite true --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL
echo "Converting events to CSV"
jq -r '(map(keys) | add | unique) as $cols | map(. as $row | $cols | map($row[.])) as $rows | $cols, $rows[] | @csv' /export/events.json > /export/events.csv
SCHEMA=`awk 'BEGIN{FS=",";OFS=","}{ if(NR==1) {for(i=1;i<NF;++i) {gsub(/"/,"", $i); printf($i ":String,")}}}' /export/events.csv`
SCHEMA2=${SCHEMA::-1}
echo "Importing events to BigQuery"
bq load --project_id jfp-data-warehouse --replace --ignore_unknown_values --skip_leading_rows=1 --source_format CSV nextsteps.events /export/events.csv $SCHEMA2

rm /export/*.gz
rm /export/*.json
rm /export/*.csv
