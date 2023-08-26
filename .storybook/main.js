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
  ]
  // Add new UI projects here and in allStories
}

const stories = [
  '../libs/journeys/ui/src/components/StepFooter/HostAvatars/HostAvatars.stories.tsx',
  '../libs/journeys/ui/src/components/Button/Button.stories.tsx',
  '../libs/journeys/ui/src/components/Card/Card.stories.tsx',
  '../libs/journeys/ui/src/components/Icon/Icon.stories.tsx',
  '../libs/journeys/ui/src/components/Image/Image.stories.tsx',
  '../libs/journeys/ui/src/components/RadioOption/RadioOption.stories.tsx',
  '../libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.stories.tsx',
  '../libs/journeys/ui/src/components/SignUp/SignUp.stories.tsx',
  '../libs/journeys/ui/src/components/StepFooter/StepFooter.stories.tsx',
  '../libs/journeys/ui/src/components/StepFooter/ChatButtons/ChatButtons.stories.tsx',
  '../libs/journeys/ui/src/components/StepFooter/FooterButtonList/ReactionButton/ReactionButton.stories.tsx',
  '../libs/journeys/ui/src/components/StepFooter/FooterButtonList/ShareButton/ShareDialog/ShareDialog.stories.tsx',
  '../libs/journeys/ui/src/components/StepFooter/FooterButtonList/ShareButton/ShareButton.stories.tsx',
  '../libs/journeys/ui/src/components/StepFooter/FooterButtonList/StyledFooterButton/StyledFooterButton.stories.tsx',
  '../libs/journeys/ui/src/components/StepFooter/FooterButtonList/FooterButtonList.stories.tsx',
  '../libs/journeys/ui/src/components/TextField/TextField.stories.tsx',
  '../libs/journeys/ui/src/components/TextResponse/TextResponse.stories.tsx',
  '../libs/journeys/ui/src/components/Typography/Typography.stories.tsx',
  '../libs/journeys/ui/src/components/Video/Video.stories.tsx'
  // ...storiesForProject['journeys'],
  // ...storiesForProject['journeys-admin'],
  // ...storiesForProject['journeys-ui'],
  // ...storiesForProject['watch'],
  // ...storiesForProject['shared-ui']
]

module.exports = {
  staticDirs: [
    './static',
    { from: '../apps/watch/public/fonts', to: '/watch/fonts' }
  ],
  stories,
  addons: [
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    'storybook-addon-apollo-client'
  ],

  features: {
    interactionsDebugger: true
  },

  resolve: {
    fallback: {
      util: require.resolve('util/')
    }
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
  },

  framework: {
    name: '@storybook/nextjs',
    options: {}
  },

  docs: {
    autodocs: false
  }
}
