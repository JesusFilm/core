# Update the VARIANT arg in docker-compose.yml to pick a Node version
ARG VARIANT=16
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}-bullseye

# Update args in docker-compose.yaml to set the UID/GID of the "node" user.
ARG USER_UID=1000
ARG USER_GID=$USER_UID
RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then groupmod --gid $USER_GID node && usermod --uid $USER_UID --gid $USER_GID node; fi

# https://www.postgresql.org/download/linux/debian/
# required to install postgresql-client-13
RUN sh -c 'echo "deb [signed-by=/usr/share/keyrings/postgresql-archive.keyring.gpg] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /usr/share/keyrings/postgresql-archive.keyring.gpg

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends gnupg2 libpixman-1-dev libcairo2-dev libpango1.0-dev postgresql-client-13

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
RUN su node -c "npm install -g npm@^9.7.2"

RUN mkdir /home/node/.doppler \
    && chown -R node /home/node/.doppler