const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const storiesForProject = {
  journeys: [
    '../apps/journeys/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/**/*.stories.mdx',
    '../apps/journeys/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/blocks/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'journey-admin': [
    '../apps/journey-admin/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journey-admin/src/components/**/*.stories.mdx',
    '../apps/journey-admin/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journey-admin/src/components/blocks/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'shared-ui': [
    '../libs/shared/ui/src/**/**/*.stories.mdx',
    '../libs/shared/ui/src/**/**/*.stories.@(js|jsx|ts|tsx)'
  ]
  // Add new UI projects here and in allStories
}

const allStories = [
  ...storiesForProject['journeys'],
  ...storiesForProject['journey-admin'],
  ...storiesForProject['shared-ui']
]

module.exports = {
  stories: storiesForProject[process.env.NX_TASK_TARGET_PROJECT] || allStories,
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  core: {
    builder: 'webpack5'
  },
  webpackFinal: async (config) => {
    const tsPaths = new TsconfigPathsPlugin({
      configFile: './tsconfig.base.json'
    })

    config.resolve.plugins
      ? config.resolve.plugins.push(tsPaths)
      : (config.resolve.plugins = [tsPaths])

    return config
  }
}
