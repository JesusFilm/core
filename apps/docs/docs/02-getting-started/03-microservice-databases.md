---
title: 3. Microservice Databases
---

# Setup Microservice Databases

Microservices typically make use of a variety of database stores. The following command will create the required databases, migrate them to the latest state, and fill them with relevant data.

```shell
nx run-many --target=seed
```
