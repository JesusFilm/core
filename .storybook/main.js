const storiesForProject = {
  journeys: [
    '../apps/journeys/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/**/*.stories.mdx',
    '../apps/journeys/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/blocks/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  // Add new UI projects here and in allStories
};

const allStories = [...storiesForProject["journeys"]]

module.exports = {
  stories:
    storiesForProject[process.env.NX_TASK_TARGET_PROJECT] ||
    allStories,
  addons: [{
    name: '@storybook/addon-essentials',
    options: {
      outline: false,
    }
  }, '@nrwl/react/plugins/storybook', '@storybook/addon-a11y'
  ]
  // uncomment the property below if you want to apply some webpack config globally
  // webpackFinal: async (config, { configType }) => {
  //   // Make whatever fine-grained changes you need that should apply to all storybook configs

  //   // Return the altered config
  //   return config;
  // },
}
