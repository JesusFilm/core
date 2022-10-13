DOPPLER_PROJECT=terraform \
DOPPLER_CONFIG=dev \
doppler run --name-transformer tf-var -- terraform $@ 