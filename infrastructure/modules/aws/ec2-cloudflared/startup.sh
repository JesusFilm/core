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

sudo -u dd-agent mkdir /etc/datadog-agent/conf.d/journald.d
sudo -u dd-agent cat <<EOF > /etc/datadog-agent/conf.d/journald.d/conf.yaml
logs:
  - type: journald
    path: /var/log/journal/
    service: cloudflared
EOF

# start data dog agent
service datadog-agent start

# add cloudflare gpg key
mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

# add cloudflared repo to apt repositories
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' | tee /etc/apt/sources.list.d/cloudflared.list

# install cloudflared
apt-get update && apt-get install -y cloudflared

# run cloudflared as a service
cloudflared service install ${cloudflared_token}