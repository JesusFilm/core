#!/bin/bash

# install curl
apt-get update && apt-get install -y curl sudo

# install datadog agent
DD_INSTALL_ONLY=true DD_API_KEY="${datadog_api_key}" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script_agent7.sh)"

# add dd-agent to systemd-journal group
usermod -a -G systemd-journal dd-agent

# update datadog config
sudo -u dd-agent cat <<EOF > /etc/datadog-agent/datadog.yaml
api_key: ${datadog_api_key}
logs_enabled: true
inventories_configuration_enabled: true
process_config:
  process_collection:
    enabled: true
EOF

sudo -u dd-agent cat <<EOF > /etc/datadog-agent/conf.d/postgres.yaml
init_config:

instances:
${postgres_instances}  
EOF

# start data dog agent
service datadog-agent start

