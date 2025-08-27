# Update the VARIANT arg in docker-compose.yml to pick a Node version
ARG VARIANT=22
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT} AS base

# Update args in docker-compose.yaml to set the UID/GID of the "node" user.
ARG USER_UID=1000
ARG USER_GID=$USER_UID
RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then groupmod --gid $USER_GID node && usermod --uid $USER_UID --gid $USER_GID node; fi


FROM base as final

# https://www.postgresql.org/download/linux/debian/
# required to install postgresql-client-13
RUN sh -c 'echo "deb [signed-by=/usr/share/keyrings/postgresql-archive.keyring.gpg] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /usr/share/keyrings/postgresql-archive.keyring.gpg

# doppler
RUN curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add -
RUN echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list

# solves "failed to fetch URL Hash Sum mismatch error"
# see: https://github.com/docker/for-mac/issues/7025
RUN echo 'Acquire::http::Pipeline-Depth 0;' > /etc/apt/apt.conf.d/99fixbadproxy && \
    echo 'Acquire::http::No-Cache true;' >> /etc/apt/apt.conf.d/99fixbadproxy && \
    echo 'Acquire::BrokenProxy true;' >> /etc/apt/apt.conf.d/99fixbadproxy
    
# Install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends gnupg2 libpixman-1-dev libcairo2-dev \
    libpango1.0-dev postgresql-client-13 chromium apt-transport-https ca-certificates curl \
    gnupg doppler ffmpeg

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=20
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# install global node modules
RUN su node -c "npm install -g npm@latest"

WORKDIR /home/node

# install github action runner
RUN curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
RUN mv bin/act /usr/bin/
RUN rm -rf bin

RUN export PNPM_HOME="$HOME/.pnpm" && export PATH="$PNPM_HOME:$PATH"

RUN mkdir /home/node/.doppler \
    && chown -R node /home/node/.doppler