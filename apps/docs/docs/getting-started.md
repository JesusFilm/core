---
sidebar_position: 2
---

# Getting Started

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

## Developing inside a container

We recommend using [Visual Studio Code](https://code.visualstudio.com/) with the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension which lets you use a [Docker container](https://docker.com/) as a full-featured development environment. Our doucmentation is designed around developers using our container. A devcontainer.json file in Core tells VS Code how to access (or create) a development container with a well-defined tool and runtime stack. To get started try the following:

1. Install [Visual Studio Code](https://code.visualstudio.com/)
1. Install [Docker Desktop](https://www.docker.com/get-started)
1. Start Docker Desktop
   - **PC users**: Windows limits resources to WSL 2 (Memory/CPU), this limit can be configured in your [.wslconfig file](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#configure-global-options-with-wslconfig).
1. Start VS Code and add [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) Extension
1. run `Remote-Containers: Clone Repository in Container Volume...` from the Command Palette (F1).
1. Pick GitHub (You'll need to authenticate with GitHub), then enter `JesusFilm/core`, finally choose the `main` branch to clone.
1. The VS Code window (instance) will reload, clone the source code, and start building the dev container. A progress notification provides status updates.
1. After the build completes, VS Code will automatically connect to the container. You can now work with the repository source code in this independent environment as you would if you had cloned the code locally.

## Setup environment variables

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

## Configure microservice database

Microservices typically make use of a variety of database stores. The following command will create the required databases, migrate them to the latest state, and fill them with relevant data.

```shell
nx run-many --target=seed
```

## Start the gateway and web server

As an example we are going to run through the steps to get the Next Steps Journey project running in your web browser.

1. Start the gateway and microservices

```shell
nx run api-gateway:serve-all
```

2. Start a webserver e.g journeys

```shell
nx run journeys:serve
```

3. In your local browser navigate to [http://localhost:4100](http://localhost:4100)
