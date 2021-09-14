#!/bin/bash
sudo chown node -R /workspaces
sudo chgrp node -R /workspaces
psql -c "CREATE USER \"test-user\" WITH PASSWORD 'test-password' CREATEDB;"
npm i
