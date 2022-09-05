---
title: 1. Development Environment
---

# Setup Development Environment

We use [Visual Studio Code](https://code.visualstudio.com/) with the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension. This lets you use a [Docker container](https://docker.com/) as a full-featured development environment. A devcontainer.json file in Core tells VS Code how to access (or create) a development container with a well-defined tool and runtime stack.

To get started try the following:

1. Install [Visual Studio Code](https://code.visualstudio.com/)
1. Install [Docker Desktop](https://www.docker.com/get-started)
1. Start Docker Desktop
   - **PC users**: Windows limits resources to WSL 2 (Memory/CPU), this limit can be configured in your [.wslconfig file](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#configure-global-options-with-wslconfig).
1. Start VS Code and add [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) Extension
1. run `Remote-Containers: Clone Repository in Container Volume...` from the Command Palette (F1).
1. Pick GitHub (You'll need to authenticate with GitHub), then enter `JesusFilm/core`, finally choose the `main` branch to clone.
1. The VS Code window (instance) will reload, clone the source code, and start building the dev container. A progress notification provides status updates.
1. After the build completes, VS Code will automatically connect to the container. You can now work with the repository source code in this independent environment as you would if you had cloned the code locally.
