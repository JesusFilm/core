#!/usr/bin/env bash

# A short script to move the two global crawler creds from lastpass into SSM
# Before running, you should login via 'lpass login <your lastpass email>'.

set -e

# ensure you're logged in
lpass status

data_world_api_key=$(lpass show --notes "Data.World Crawler API Key Prod")

# use the same api key for lab as for prod
aws ssm put-parameter \
  --name '/data-world-crawler/lab/data-world-api-key' \
  --value "$data_world_api_key" \
  --type SecureString \
  --overwrite

aws ssm put-parameter \
  --name '/data-world-crawler/prod/data-world-api-key' \
  --value "$data_world_api_key" \
  --type SecureString \
  --overwrite


datadog_api_key=$(lpass show --notes "Datadog api key - atlantis")

aws ssm put-parameter \
  --name '/data-world-crawler/datadog-api-key' \
  --value "$datadog_api_key" \
  --type SecureString \
  --overwrite

