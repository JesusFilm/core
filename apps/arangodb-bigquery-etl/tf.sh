DOPPLER_PROJECT=arangodb-bigquery-etl \
DOPPLER_CONFIG=prd \
doppler run --name-transformer tf-var -- terraform $@ 