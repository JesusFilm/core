# Contributing to Jesus Film Core

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

The following is a set of guidelines for contributing to the Core Monorepo, which are hosted in the JesusFilm Organization on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table Of Contents

[What should I know before I get started?](#what-should-i-know-before-i-get-started)
  * [Monorepo](#monorepo)
  * [Back-end Architecture](#back-end-architecture)
  * [Developing inside a Container](#developing-inside-a-container)
  * [Starting the gateway, back-end and front-end projects](#starting-the-gateway-back-end-and-front-end-projects)

## What should I know before I get started?

### Monorepo

Core is a single monorepo that aims to implement our unified product suite - it's made up of many projects. When you initially consider contributing to Core, you might be unsure about which of these projects implements the functionality you want to change or report a bug for. This section should help you with that.

Core is intentionally very modular. To get a sense for the projects here are list of the big ones:

- api-gateway - Apollo Gateway. This is the service that runs at [graphql.jesusfilm.org](https://graphql.jesusfilm.org)
- api-journeys - Next Steps subgraph.
- journeys - Public facing NextJS site for Next Steps.

Core makes use of [Nx](https://nx.dev/), a smart and extensible build framework to help us architect, test, and build at any scale — integrating seamlessly with modern technologies and libraries while providing a robust CLI, caching, dependency management, and more. Particularly it helps:

- Smart rebuilds of affected projects
- Distributed task execution & computation caching
- Code sharing and ownership management

### Back-end Architecture

Jesus Film exposes a [single data graph](https://graphql.jesusfilm.org/) that provides a unified interface for querying any combination of our back-end services. We make extensive use of [Apollo Federation](https://www.apollographql.com/docs/federation/) to divide our graph's implementation across multiple back-end services (called subgraphs).

Our back-end architecture consists of:

- **api-\* projects**: A collection of subgraphs (usually represented by different back-end services) that each define a distinct GraphQL schema
- **api-gateway**: A gateway that uses a supergraph schema (composed from all subgraph schemas) to execute queries across multiple subgraphs

When implementing back-end projects we encourage you to leverage a design principle called [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns). This enables different teams to work on different products and features within a single data graph, without interfering with each other.

### Developing inside a Container

We recommend using [Visual Studio Code](https://code.visualstudio.com/) with the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension which lets you use a [Docker container](https://docker.com/) as a full-featured development environment. A devcontainer.json file in Core tells VS Code how to access (or create) a development container with a well-defined tool and runtime stack. To get started try the following:

1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install [Docker Desktop](https://www.docker.com/get-started)
3. Start Docker Desktop
4. Start VS Code and add [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) Extension
5. run `Remote-Containers: Clone Repository in Container Volume...` from the Command Palette (F1).
6. Enter `https://github.com/JesusFilm/core.git` and choose `main` as the branch to clone.
7. The VS Code window (instance) will reload, clone the source code, and start building the dev container. A progress notification provides status updates.
8. After the build completes, VS Code will automatically connect to the container. You can now work with the repository source code in this independent environment as you would if you had cloned the code locally.

## Starting the gateway, back-end and front-end projects

As an example we are going to run through the steps to get the Next Steps Journeys project running in your web browser. This example assumes you are running it from the development container.

1. run `nx run api-journeys:migrations`
2. run `nx run api-journeys:seed`
3. run `nx run api-gateway:serve-all`
4. in another terminal run `nx run journeys:serve`
5. in your local browser navigate to [http://localhost:4100](http://localhost:4100)
