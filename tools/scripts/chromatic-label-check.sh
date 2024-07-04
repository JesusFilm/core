#!/bin/bash

# Command to check if 'chromatic' label exists in pull request labels using jq
has_chromatic_label=$(jq '.[] | select(.name=="chromatic")' <<< "${{ toJson(github.event.pull_request.labels) }}")

# Set the output variable for GitHub Actions
if [[ -n $has_chromatic_label ]]; then
  echo "::set-output name=has_chromatic_label::true"
else
  echo "::set-output name=has_chromatic_label::false"
fi
