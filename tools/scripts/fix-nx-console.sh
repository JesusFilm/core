#!/bin/bash

cd ~/.vscode-server/extensions/nrwl.angular-console-17.*/node_modules/@parcel/watcher
npm install
npm run prebuild --openssl_fips=''