echo 'setting up databsaes for diff'
createdb 'video-seed-data'

pg_restore -j 8 -d video-seed-data apps/api-videos/src/app/modules/importer/importerSeedDiff/videos-seed-fc.sql

createdb 'video-bq-data'

pg_restore -j 8 -d video-bq-data apps/api-videos/src/app/modules/importer/importerSeedDiff/videos-bqimport-fc.sql

#GET SQL WORKBENCH/J
echo 'getting sql workbench/j'
sudo wget -O /tmp/sqlworkbench.tar.gz https://www.sql-workbench.eu/Workbench-Build131-with-optional-libs.zip 
sudo unzip -o /tmp/sqlworkbench.tar.gz -d /opt/
sudo rm /tmp/sqlworkbench.tar.gz
#GET JDBC POSTGRES DRIVERS
echo 'installing jdbc drivers'
sudo wget -O /opt/postgresql.jar https://jdbc.postgresql.org/download/postgresql-42.7.3.jar

#RUN DIFF IN SQL WORKBENCH
echo 'running diff'
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

  WbDataDiff     -referenceProfile='SeedImport'\
                 -targetProfile='BQImport'\
                 -file=apps/api-videos/src/app/modules/importer/importerSeedDiff/diff/migrate_staging.sql\
                 -ignoreColumns=id\
                 -includeDelete=false;\
                 "

echo 'cleaning up...'

dropdb 'video-seed-data' -f

dropdb 'video-bq-data' -f
sudo rm /opt/postgresql.jar 

echo 'seed - bq importer diff has run'