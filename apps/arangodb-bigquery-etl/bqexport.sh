#!/bin/bash

printenv GCLOUD > /gcloud.json
export GOOGLE_APPLICATION_CREDENTIALS="/gcloud.json"
gcloud auth activate-service-account jfp-core@jfp-data-warehouse.iam.gserviceaccount.com --key-file="/gcloud.json" --project=jfp-data-warehouse

collections=("languages" "users" "countries")
for collection in "${collections[@]}"
do
  echo "Exporting $collection from ArangoDB"
  arangoexport --type jsonl --collection $collection --compress-output true --overwrite true --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL
  echo "Importing $collection to BigQuery"
  bq --project_id jfp-data-warehouse load --replace --source_format NEWLINE_DELIMITED_JSON --autodetect nextsteps.$collection export/$collection.jsonl.gz
done

# The following collections require some custom queries or import information to avoid errors on import.

# blocks
echo "Exporting blocks from ArangoDB"
arangoexport --type jsonl --compress-output true --overwrite true --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL \
  --custom-query=" \
FOR b IN blocks \
RETURN { \
  _key: b._key, \
  parentOrder: b.parentOrder, \
  journeyId: b.journeyId, \
  __typename: b.__typename, \
  nextBlockId: b.nextBlockId, \
  videoId: b.videoId, \
  endAt: b.endAt, \
  backgroundColor: b.backgroundColor, \
  fullscreen: b.fullscreen, \
  themeName: b.themeName, \
  endIconId: b.endIconId, \
  startIconId: b.startIconId, \
  label: b.label, \
  action: { \
    parentBlockId: b.action.parentBlockId, \
    gtmEventName: b.action.gtmEventName, \
    blockId: b.action.blockId, \
    journeyId: b.action.journeyId, \
    url: b.action.url, \
    target: b.action.target \
  }, \
  size: b.size, \
  name: b.name, \
  submitIconId: b.submitIconId, \
  align: b.align, \
  variant: b.variant, \
  color: b.color, \
  title: b.title, \
  posterBlockId: b.posterBlockId, \
  startAt: b.startAt, \
  muted: b.muted, \
  submitLabel: b.submitLabel, \
  coverBlockId: b.coverBlockId, \
  videoVariantLanguageId: b.videoVariantLanguageId, \
  height: b.height, \
  width: b.width, \
  autoplay: b.autoplay, \
  blurhash: b.blurhash, \
  alt: b.alt, \
  src: b.src, \
  triggerStart: b.triggerStart, \
  locked: b.locked, \
  description: b.description, \
  isCover: b.isCover, \
  fullsize: b.fullsize, \
  content: b.content, \
  parentBlockId: b.parentBlockId \
  }"  

echo "Importing blocks to BigQuery"
bq --project_id jfp-data-warehouse load --replace --source_format NEWLINE_DELIMITED_JSON nextsteps.blocks export/query.jsonl.gz ./blocks

# videos
echo "Exporting videos from ArangoDB"
arangoexport --type jsonl --compress-output true --overwrite true --server.authentication true --server.database $DATABASE_DB --server.username $DATABASE_USER --server.password $DATABASE_PASS --server.endpoint $DATABASE_URL --custom-query "FOR v IN videos RETURN { _key: v._key, label: v.label, primaryLanguageId: v.primaryLanguageId, slug: v.slug, __typename: v.__typename }" 
echo "Importing videos to BigQuery"
bq --project_id jfp-data-warehouse load --replace --source_format NEWLINE_DELIMITED_JSON --autodetect nextsteps.videos export/query.jsonl.gz

rm /export/*.gz
