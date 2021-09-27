const storiesForProject = {
  journeys: [
    '../apps/journeys/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/**/*.stories.mdx',
    '../apps/journeys/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/blocks/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'shared-ui': [
    '../libs/shared/ui/src/components/**/*.stories.mdx',
    '../libs/shared/ui/src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ]
  // Add new UI projects here and in allStories
}

const allStories = [
  ...storiesForProject['journeys'],
  ...storiesForProject['shared-ui']
]

module.exports = {
  stories: storiesForProject[process.env.NX_TASK_TARGET_PROJECT] || allStories,
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        outline: false
      }
    },
    '@storybook/addon-a11y'
  ],
  core: {
    builder: 'webpack5'
  },
  babel: async (options) => ({
    ...options,
    plugins: [
      ...options.plugins,
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }]
    ]
  })
  // uncomment the property below if you want to apply some webpack config globally
  // webpackFinal: async (config, { configType }) => {
  //   // Make whatever fine-grained changes you need that should apply to all storybook configs

  //   // Return the altered config
  //   return config;
  // },
}
