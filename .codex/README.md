# Codex Local Environment

Codex local environments are configured in the Codex app and stored under `.codex/`. The app can generate the actual config file(s); commit those files alongside this README once created.

Intended setup script:

- `./run/codex/setup.sh`

Intended actions:

- `nf start`
- `nx run journeys:serve:development --inspect-brk`
- `nx run journeys-admin:serve:development`
- `nx run watch:serve:development --inspect-brk`
- `nx run docs:serve`
- `./run/codex/db-full.sh`
- `DOPPLER_CONFIG=dev nx run-many --all --target=fetch-secrets`
- `DOPPLER_CONFIG=stg_dev nx run-many --projects=tag:doppler_config:stg_dev --target=fetch-secrets`
