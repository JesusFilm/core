---
sidebar_position: 2
---

# Back-end Architecture

Jesus Film exposes a [single data graph](https://graphql.jesusfilm.org/) that provides a unified interface for querying any combination of our back-end services. We make extensive use of [Apollo Federation](https://www.apollographql.com/docs/federation/) to divide our graph's implementation across multiple back-end services (called subgraphs).

Our back-end architecture consists of:

- **api-\* projects**: A collection of subgraphs (usually represented by different back-end services) that each define a distinct GraphQL schema
- **api-gateway**: A gateway that uses a supergraph schema (composed from all subgraph schemas) to execute queries across multiple subgraphs

When implementing back-end projects we encourage you to leverage a design principle called [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns). This enables different teams to work on different products and features within a single data graph, without interfering with each other.

## Schema Extensions

It's important that once you've started on a schema extension that you to regenerate the schema. We leverage the generated schema to create types for front-end apps so they're super important! You can even extend the schema and generate types before you even write the related resolvers.

1. Start the server for the back-end project e.g `nx serve api-journeys`
1. In another terminal run the schema generator against the backend project e.g `nx generate-graphql api-journeys`
1. Run the gateway schema `nx generate-graphql api-gateway`
1. Commit the changed schema.graphql files
