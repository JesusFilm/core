# Architecture Concepts

## Monorepo

Core is a single monorepo that aims to implement our unified product suite - it's made up of many projects. When you initially consider contributing to Core, you might be unsure about which of these projects implements the functionality you want to change or report a bug for. This section should help you with that.

Core is intentionally very modular. To get a sense for the projects here are list of the big ones:

- api-gateway - Apollo Gateway. This is the service that runs at [graphql.jesusfilm.org](https://graphql.jesusfilm.org)
- api-journeys - Next Steps subgraph.
- journeys - Public facing NextJS site for Next Steps.

Core makes use of [Nx](https://nx.dev/), a smart and extensible build framework to help us architect, test, and build at any scale — integrating seamlessly with modern technologies and libraries while providing a robust CLI, caching, dependency management, and more. Particularly it helps:

- Smart rebuilds of affected projects
- Distributed task execution & computation caching
- Code sharing and ownership management
