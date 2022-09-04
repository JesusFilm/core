---
title: 2. Environment Variables
---

# Setup Environment Variables

We use [Doppler](https://www.doppler.com/) as our team's central source of truth for secrets and app configuration.

1. Get invited to Jesus Film Doppler account by sending an email to our [Doppler Administrator](mailto:tataihono.nikora@jesusfilm.org?subject=Doppler%20Invite%20Request).
2. In a container terminal, login to the Doppler CLI

```shell
doppler login
```

3. Fetch environment variables using `fetch-secrets`

```shell
DOPPLER_CONFIG=dev nx run-many --target=fetch-secrets
```
