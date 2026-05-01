// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { StorybookConfig } from '@storybook/nextjs-vite'

const require = createRequire(import.meta.url)

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
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-docs')
  ],

  viteFinal: async (config) => {
    const __dirname = dirname(fileURLToPath(import.meta.url))
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@emotion/styled': require.resolve('@emotion/styled'),
      '@emotion/core': require.resolve('@emotion/react'),
      '@emotion-theming': require.resolve('@emotion/react'),
      '@emotion/react': require.resolve('@emotion/react'),
      '@emotion/cache': require.resolve('@emotion/cache'),
      // @mui/material-nextjs/v15-pagesRouter uses Node-only modules (html-tokenize,
      // buffer-from) that crash in Vite/browser. Replace with a browser-safe stub.
      '@mui/material-nextjs/v15-pagesRouter': resolve(
        __dirname,
        'mocks/mui-material-nextjs.js'
      )
    }
    return config
  },

  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
    options: {}
  },
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
}

export default config

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')))
}
