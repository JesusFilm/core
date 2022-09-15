#!/usr/bin/env bash

set -e
echoerr() { printf "%s\n" "$*" >&2; }

# atlantis uses awscli v1 which defaults to "wire" timestamp format, v2 defaults to "iso8601"
# we require iso8601 so we enforce it here
aws configure set cli_timestamp_format iso8601

# record current datetime as AWS JSON string
now="$(date +"%Y-%m-%dT%H:%M:%S.%s")"

# Parse required commandline args
cluster=${1:?"Cluster required."}
service=${2:?"Service required."}

# Wait for service to have a deployment and desired_count in cluster
# See https://docs.aws.amazon.com/cli/latest/reference/ecs/wait/services-stable.html
aws ecs wait services-stable \
  --cluster "${cluster}" \
  --services "${service}"

grace_period=$(jq -n "[${GRACE_PERIOD-90}, 90] | max * 1.5 | ceil")
timeout=$(jq -n "$(date +%s) + $grace_period")
while [[ $timeout -ge $(date +%s) ]]; do
  steady=$(aws ecs describe-services \
    --cluster "${cluster}" \
    --services "${service}" \
    --query "length(services[0].events[?ends_with(message, \`has reached a steady state.\`) && createdAt>=\`${now}\`]) == \`1\`")
  if [[ $steady == "true" ]]; then exit 0; fi
  sleep 15
done

echoerr "Service was unable to reach a steady state after ${grace_period} seconds."
exit 1
