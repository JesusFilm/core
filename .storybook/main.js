const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const storiesForProject = {
  journeys: [
    '../apps/journeys/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/**/*.stories.mdx',
    '../apps/journeys/src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'journeys-admin': [
    '../apps/journeys-admin/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys-admin/src/components/**/*.stories.mdx',
    '../apps/journeys-admin/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys-admin/src/components/**/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'journeys-ui': [
    '../libs/journeys/ui/src/**/**/*.stories.mdx',
    '../libs/journeys/ui/src/**/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'shared-ui': [
    '../libs/shared/ui/src/**/*.stories.mdx',
    '../libs/shared/ui/src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  watch: [
    '../apps/watch/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/watch/src/components/**/*.stories.mdx',
    '../apps/watch/src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'watch-admin': [
    '../apps/watch-admin/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/watch-admin/src/components/**/*.stories.mdx',
    '../apps/watch-admin/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/watch-admin/src/components/**/**/*.stories.@(js|jsx|ts|tsx)'
  ]
  // Add new UI projects here and in allStories
}

const allStories = [
  ...storiesForProject['journeys'],
  ...storiesForProject['journeys-admin'],
  ...storiesForProject['journeys-ui'],
  ...storiesForProject['watch'],
  ...storiesForProject['watch-admin'],
  ...storiesForProject['shared-ui']
]

const affectedStories = () => {
  const affectedApps = process.env.NX_AFFECTED_APPS ?? ''
  const affectedLibs = process.env.NX_AFFECTED_LIBS ?? ''
  const affectedProjects = [
    ...affectedApps.split(' '),
    ...affectedLibs.split(' ')
  ]

  const stories = affectedProjects
    .map((project) => {
      if (project === 'shared-storybook' || project === '') return []
      return storiesForProject[project]
    })
    .flat()

  return stories.length > 0 ? stories : undefined
}

module.exports = {
  stories:
    affectedStories() ||
    storiesForProject[process.env.NX_TASK_TARGET_PROJECT] ||
    allStories,
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y'
  ],
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

    // TODO: Remove once Storybook supports Emotion 11.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@emotion/styled': require.resolve('@emotion/styled'),
      '@emotion/core': require.resolve('@emotion/react'),
      '@emotion-theming': require.resolve('@emotion/react'),
      '@emotion/react': require.resolve('@emotion/react'),
      '@emotion/cache': require.resolve('@emotion/cache')
    }

    return config
  }
}
