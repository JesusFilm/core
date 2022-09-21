DOPPLER_PROJECT=api-gateway \
DOPPLER_CONFIG=stg \
doppler run --name-transformer tf-var -- terraform $@ 