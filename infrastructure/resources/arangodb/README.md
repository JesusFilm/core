# arandodb

This connects to the arango oasis

to easily use terraform & doppler, run:
`sh tf.sh { terraform options }`

To migrate existing databases run the folling inside an arangodb image:
`arangodump --server.authentication \
 --server.endpoint ssl://arangodb.core.jesusfilm.org:8529 \
 --server.username root \
 --server.password=<password> \
 --server.database main \
 --output-directory dump \
 --overwrite true

arangorestore --server.authentication \
 --server.endpoint ssl://35d055613c5a.arangodb.cloud:8529 \
 --server.username root --server.password=<get-from-dashboard> \
 --server.database main \
 --input-directory dump --replication-factor 3`
