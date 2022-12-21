#!/bin/bash

cp /etc/secrets/GCLOUD /gcloud.json
export GOOGLE_APPLICATION_CREDENTIALS="/gcloud.json"
gcloud auth activate-service-account jfp-core@jfp-data-warehouse.iam.gserviceaccount.com --key-file="/gcloud.json" --project=jfp-data-warehouse

echo "Exporting users from Postgresql"
pg_dump --column-inserts --data-only --table=users users > my_dump.sql

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
