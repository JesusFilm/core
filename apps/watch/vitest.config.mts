import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Pin i18next / react-i18next to one resolved module file. Components import
// `useTranslation` via `next-i18next/pages` (CJS), while setupTests configures
// the instance via `react-i18next` (ESM). Without a single shared file, the
// ESM and CJS builds keep separate globals and useTranslation reports
// NO_I18NEXT_INSTANCE — translations then render as raw, un-interpolated keys.
const i18nextPath = require.resolve('i18next')
const reactI18nextPath = require.resolve('react-i18next')

// Match the previous Jest behaviour (@nx/react/plugins/jest), where importing a
// static asset returned its bare filename. Vite would otherwise resolve these to
// a `/public/...` URL, breaking specs that assert on the imported filename.
const assetFileNamePlugin = {
  name: 'watch-asset-filename-mock',
  enforce: 'pre' as const,
  load(id: string) {
    if (/\.(png|jpe?g|gif|svg|webp|avif|ico|bmp)(\?.*)?$/.test(id)) {
      const fileName = id.split('?')[0].split('/').pop() ?? id
      return `export default ${JSON.stringify(fileName)}`
    }
    return undefined
  }
}

export default defineConfig({
  plugins: [
    assetFileNamePlugin,
    react(),
    tsconfigPaths({
      root: resolve(__dirname, '../..'),
      ignoreConfigErrors: true
    })
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'i18next', 'react-i18next'],
    alias: [
      { find: /^i18next$/, replacement: i18nextPath },
      { find: /^react-i18next$/, replacement: reactI18nextPath }
    ]
  },
  test: {
    server: {
      deps: {
        // Inline the i18n stack so setupTests' `initReactI18next` and the
        // `next-i18next/pages` `useTranslation` in components resolve to the
        // SAME module instance. Without this, vite-transformed setup code and
        // externalized component requires get separate react-i18next singletons,
        // and useTranslation reports NO_I18NEXT_INSTANCE (keys render raw).
        inline: ['i18next', 'react-i18next', 'next-i18next']
      }
    },
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost'
      }
    },
    reporters: ['default'],
    setupFiles: ['./setupTests.tsx'],
    testTimeout: 10000,
    alias: [
      {
        find: 'swiper/react',
        replacement: resolve(__dirname, '../__mocks__/swiper/react.tsx')
      },
      {
        find: 'swiper/modules',
        replacement: resolve(__dirname, '../__mocks__/swiper/modules.tsx')
      },
      {
        find: /^swiper\/css(\/.*)?$/,
        replacement: resolve(__dirname, '../__mocks__/swiper/css.ts')
      }
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['cobertura'],
      reportsDirectory: '../../coverage/apps/watch'
    },
    retry: process.env.CI === 'true' ? 3 : 0,
    passWithNoTests: true
  }
})
