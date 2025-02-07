# Extending the Graph

## Adding a resolver

## Adding a service

## Adding a module

## Generating schema files

It's important that once you've started on a schema extension that you to regenerate the schema. We leverage the generated schema to create types for front-end apps so they're super important! You can even extend the schema and generate types before you even write the related resolvers.

1. Start the server for the back-end project

```shell
nx serve [project]
```

2. In another terminal run the project schema generator

```shell
nx generate-graphql [project]
```

3. In another terminal run the gateway schema generator

```shell
nx generate-graphql api-gateway
```

4. Commit the changed schema.graphql files

```
+ apis/api-gateway/schema.graphql
+ apps/[project]/schema.graphql
```
