#!/usr/bin/env bash

eval "$(jq -r '@sh "TASK_DEFINITION=\(.TASK_DEFINITION)"')"

response=$(aws ecs describe-task-definition --task-definition "$TASK_DEFINITION" \
  --query "taskDefinition.{revision:to_string(revision),image:containerDefinitions[0].image}" \
  --output json
)
result=$?
if [ $result -ne 0 ]; then
  output="{\"revision\":\"0\"}"
else
  output=$(echo $response | jq '{revision: .revision, image: .image}')
fi
echo $output
