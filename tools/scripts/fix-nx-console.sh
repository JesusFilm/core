#!/bin/bash

# This script fixes the nx console vscode extension issue with parcel for M1 macs

cd ~/.vscode-server/extensions/nrwl.angular-console-17.*/node_modules/@parcel/watcher
npm install
npm run prebuild --openssl_fips=''