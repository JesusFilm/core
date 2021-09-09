# shared-storybook

Dummy library to view components from all projects. This is used to bundle components and run VR on this library.

Recommended build from NX https://www.youtube.com/watch?v=c323HOuFKkA
To reduce boilerplate, we use the root .storybook config which is also shared with each ui project.

Simply add the glob which matches the file path for the stories for each new project created.
Glob patterns can be found [here](https://github.com/micromatch/micromatch#extended-globbing).

## Running demos

Run `nx demo shared-storybook` to view all components across projects via [Storybook](https://storybook.js.org/).