createdb 'video-seed-data'

pg_restore -j 8 -d video-seed-data apps/api-videos/src/app/modules/importer/importerSeedDiff/videos-seed-fc.sql

createdb 'video-bq-data'

pg_restore -j 8 -d video-bq-data apps/api-videos/src/app/modules/importer/importerSeedDiff/videos-bqimport-fc.sql

sudo wget -O /opt/postgresql.jar https://jdbc.postgresql.org/download/postgresql-42.7.3.jar

sudo /opt/sqlworkbench.sh -command="
  WbCreateProfile -name='SeedImport'\
                  -savePassword=true \
                  -driver='org.postgresql.Driver' \
                  -url='jdbc:postgresql://172.18.0.4:5432/video-seed-data' \
                  -driverJar=/opt/postgresql.jar \
                  -username='postgres' -password='postgres';\

  WbCreateProfile -name='BQImport'\
                 -savePassword=true \
                 -driver='org.postgresql.Driver' \
                 -url='jdbc:postgresql://172.18.0.4:5432/video-bq-data' \
                 -driverJar=/opt/postgresql.jar \
                 -username='postgres' -password='postgres';\

 WbDataDiff   -referenceProfile='SeedImport'\
                 -targetProfile='BQImport'\
                 -file=apps/api-videos/src/app/modules/importer/importerSeedDiff/diff/migrate_staging.sql\
                 -includeDelete=false;\
                 "

dropdb 'video-seed-data'

dropdb 'video-bq-data'

echo 'seed - bq importer has run'