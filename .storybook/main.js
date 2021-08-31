const storiesForProject = {
  journeys: [
    '../apps/journeys/src/app/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/**/ *.stories.mdx',
    '../apps/journeys/src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  myapp: [
    '../apps/myapp/src/app/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  projectB: './projectB/**.stories.js',
  // etc
};

console.log(storiesForProject[process.env.NX_TASK_TARGET_PROJECT])

module.exports = {
  stories: storiesForProject[process.env.NX_TASK_TARGET_PROJECT] || '**/*.stories.js',
  addons: ['@storybook/addon-essentials', '@nrwl/react/plugins/storybook'],
  // uncomment the property below if you want to apply some webpack config globally
  // webpackFinal: async (config, { configType }) => {
  //   // Make whatever fine-grained changes you need that should apply to all storybook configs

  //   // Return the altered config
  //   return config;
  // },
}
