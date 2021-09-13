#!/bin/bash

psql -c "CREATE USER \"test-user\" WITH PASSWORD 'test-password' CREATEDB;"
npm i
