import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { StorybookConfig } from '@storybook/nextjs'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

const require = createRequire(import.meta.url);

const storiesForProject = {
  journeys: [
    '../apps/journeys/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys/src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'journeys-admin': [
    '../apps/journeys-admin/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys-admin/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/journeys-admin/src/components/**/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'journeys-ui': ['../libs/journeys/ui/src/**/**/*.stories.@(js|jsx|ts|tsx)'],
  'shared-ui': ['../libs/shared/ui/src/**/*.stories.@(js|jsx|ts|tsx)'],
  watch: [
    '../apps/watch/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../apps/watch/src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'api-journeys-modern': [
    '../apis/api-journeys-modern/src/emails/stories/*.stories.@(js|jsx|ts|tsx)'
  ],
  'api-users': [
    '../apis/api-users/src/emails/stories/*.stories.@(js|jsx|ts|tsx)'
  ],
  'videos-admin': ['../apps/videos-admin/src/**/*.stories.@(js|jsx|ts|tsx)']
  // Add new UI projects here and in allStories
}

const stories = [
  ...storiesForProject['journeys'],
  ...storiesForProject['journeys-admin'],
  ...storiesForProject['journeys-ui'],
  ...storiesForProject['watch'],
  ...storiesForProject['shared-ui'],
  ...storiesForProject['api-journeys-modern'],
  ...storiesForProject['api-users'],
  ...storiesForProject['videos-admin']
]

const config: StorybookConfig = {
  staticDirs: ['./static'],

  stories,

  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("storybook-addon-apollo-client"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-docs")
  ],

  webpackFinal: async (config) => {
    const tsPaths = new TsconfigPathsPlugin({
      configFile: './tsconfig.base.json'
    })

    if (config.resolve == null) config.resolve = {}

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
    name: getAbsolutePath("@storybook/nextjs"),
    options: {}
  },
  docs: {},
  features: {
    experimentalRSC: true
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
}

export default config

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
