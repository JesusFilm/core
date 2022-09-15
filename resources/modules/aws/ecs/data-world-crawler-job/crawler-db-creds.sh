#!/usr/bin/env bash

# A short script to move the crawler's credentials for a specific database from lastpass into SSM
# Before running, you should login via 'lpass login <your lastpass email>'.

set -e

credential_identifier=${1:?"Usage - crawler-db-creds.sh <credential_identifier> <LastPass database note name>"}
note_name=${2:?"Usage - crawler-db-creds.sh <credential_identifier> <LastPass database note name>"}

# ensure you're logged in
lpass status

password=$(lpass show --password "$note_name")

aws ssm put-parameter \
  --name "/data-world-crawler/${credential_identifier}/prod/PASSWORD" \
  --value "$password" \
  --type SecureString \
  --overwrite
