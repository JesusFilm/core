# Contributing to Jesus Film Core

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

The following is a set of guidelines for contributing to the Core Monorepo, which are hosted in the JesusFilm Organization on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table Of Contents

[What should I know before I get started?](#what-should-i-know-before-i-get-started)

- [Monorepo](#monorepo)
- [Back-end Architecture](#back-end-architecture)
  - [Schema Extensions](#schema-extensions)
- [Front-end Architecture](#front-end-architecture)

[Getting Started](#getting-started)

- [Developing inside a Container](#developing-inside-a-container)
- [Starting the gateway, back-end and front-end projects](#starting-the-gateway-back-end-and-front-end-projects)

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

#### Schema Extensions

It's important that once you've started on a schema extension that you to regenerate the schema. We leverage the generated schema to create types for front-end apps so they're super important! You can even extend the schema and generate types before you even write the related resolvers.

1. Start the server for the back-end project e.g `nx serve api-journeys`
1. In another terminal run the schema generator against the backend project e.g `nx generate-graphql api-journeys`
1. Run the gateway schema `nx generate-graphql api-gateway`
1. Commit the changed schema.graphql files

### Front-end Architecture

Jesus Film uses [React](https://reactjs.org/) as our primary library to build out front-end user interfaces. These are built on top of the [Apollo Client](https://www.apollographql.com/apollo-client) to manage state and back-end interactions. We leverage the [Next.js](https://nextjs.org/) Framework to ship web based apps quickly and regularly on the [Vercel](https://vercel.com/) platform.

We are building out our component library to support the growing needs of our product suite. To support this effort all of our components have stories attached for use in [Storybook](https://storybook.js.org/). These stories are published to our library which can be found on our [Chromatic Library](https://www.chromatic.com/library?appId=612c2a83fdc2b2003a5c2eb7&groupPrefix=Journeys%2FBlocks).

For best practices in writing components, stories and unit tests please refer to our [wiki](https://github.com/JesusFilm/core/wiki/).

## Getting Started

### Developing inside a Container

We recommend using [Visual Studio Code](https://code.visualstudio.com/) with the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension which lets you use a [Docker container](https://docker.com/) as a full-featured development environment. A devcontainer.json file in Core tells VS Code how to access (or create) a development container with a well-defined tool and runtime stack. To get started try the following:

1. Install [Visual Studio Code](https://code.visualstudio.com/)
1. Install [Docker Desktop](https://www.docker.com/get-started)
1. Start Docker Desktop
1. Docker set up:
   - **Mac users**: add `/workspaces` from Docker -> Preferences... > Resources > File Sharing and then apply and restart Docker.
   - **PC users**: Windows limits resources to WSL 2 (Memory/CPU), this limit can be configured in your [.wslconfig file](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#configure-global-options-with-wslconfig).
1. Start VS Code and add [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) Extension
1. run `Remote-Containers: Clone Repository in Container Volume...` from the Command Palette (F1).
1. Pick GitHub (You'll need to authenticate with GitHub), then enter `JesusFilm/core`, finally choose the `main` branch to clone.
1. The VS Code window (instance) will reload, clone the source code, and start building the dev container. A progress notification provides status updates.
1. After the build completes, VS Code will automatically connect to the container. You can now work with the repository source code in this independent environment as you would if you had cloned the code locally.

## Starting the gateway, back-end and front-end projects

As an example we are going to run through the steps to get the Next Steps Journeys project running in your web browser. This example assumes you are running it from the development container.

1. Set up env files for projects
   - Make a copy of `apps/api-gateway/.env.example` with the file name `apps/api-gateway/.env.local`. Open the file and set up your own environment variables.
   - Make a copy of `apps/api-journeys/.env.example` with the file name `apps/api-journeys/.env.local`. Open the file and set up your own environment variables.
   - Make a copy of `apps/api-users/.env.example` with the file name `apps/api-users/.env.local`. Open the file and set up your own environment variables.
   - Make a copy of `apps/api-languages/.env.example` with the file name `apps/journeys/.env.local`. Open the file and set up your own environment variables.
   - Make a copy of `apps/api-videos/.env.example` with the file name `apps/journeys/.env.local`. Open the file and set up your own environment variables.
   - Make a copy of `apps/journeys/.env.example` with the file name `apps/journeys/.env.local`. Open the file and set up your own environment variables.
   - Make a copy of `apps/journeys-admin/.env.example` with the file name `apps/journeys/.env.local`. Open the file and set up your own environment variables.
1. Seed the database
   - run `nx run api-journeys:seed`
   - run `nx run api-users:seed`
   - run `nx run api-languages:seed`
   - run `nx run api-videos:seed`
1. Starting the projects
   - run `nx run journeys:serve-all`
   - run `nx run journeys-admin:serve-all`
1. in your local browser navigate to [http://localhost:4100](http://localhost:4100)

## Adding to the code base

New features should be merged to a `feature/*` branch where it can be refined until it's ready to be merged to `main`.
