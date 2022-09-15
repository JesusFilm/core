#!/usr/bin/env bash

eval "$(jq -r '@sh "PATH_PREFIX=\(.PATH_PREFIX)"')"

# Get the current list of parameters from SSM Parameter Store
params=$(aws ssm get-parameters-by-path \
  --no-recursive \
  --path "${PATH_PREFIX}" \
  --query "sort(Parameters[].Name)")

Parameters=()

# Look up tags for each parameter and drop any that are BUILD only
for name in $(echo "$params" | jq -rc '.[]'); do
  build_param=$(aws ssm list-tags-for-resource \
    --resource-type Parameter \
    --resource-id $name \
    --query "contains(TagList[?Key==\`param_type\`].Value, \`BUILD\`)")
  if [[ $build_param == "false" ]]; then
    Parameters+=("$name")
  fi
done

# Craft output json for terraform external data source
output=$(printf "%s\n" "${Parameters[@]}" | jq -Rs '{ secrets: (. / "\n") | map( select(length > 0) | { name: . | split("/") | .[-1], valueFrom: . } ) | tojson }')

echo $output
