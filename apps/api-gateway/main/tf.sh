DOPPLER_PROJECT=api-gateway \
DOPPLER_CONFIG=prd \
doppler run --name-transformer tf-var -- terraform $@ 