# General

Core exposes a [single data graph](https://graphql.jesusfilm.org/) that provides a unified interface for querying any combination of our back-end services. We make extensive use of [Apollo Federation](https://www.apollographql.com/docs/federation/) to divide our graph's implementation across multiple back-end microservices (called subgraphs).

Our back-end architecture consists of:

- **api-\* projects**: A collection of subgraphs (usually represented by different back-end services) that each define a distinct GraphQL schema
- **api-gateway**: A gateway that uses a supergraph schema (composed from all subgraph schemas) to execute queries across multiple subgraphs

When implementing back-end projects we encourage you to leverage a design principle called [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns). This enables different teams to work on different products and features within a single data graph, without interfering with each other.
