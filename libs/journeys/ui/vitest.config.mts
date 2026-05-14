import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      root: resolve(__dirname, '../../..'),
      ignoreConfigErrors: true
    })
  ],
  resolve: {
    alias: {
      'next-i18next/pages': resolve(
        __dirname,
        './test/next-i18next-pages.ts'
      )
    }
  },
  test: {
    root: __dirname,
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost'
      }
    },
    reporters: ['default'],
    setupFiles: ['./setupTests.ts'],
    alias: [
      {
        find: /^swiper\/react$/,
        replacement: resolve(__dirname, '../../../apps/__mocks__/swiper/react.tsx')
      },
      {
        find: /^swiper\/modules$/,
        replacement: resolve(__dirname, '../../../apps/__mocks__/swiper/modules.tsx')
      },
      {
        find: /^swiper\/css(\/.*)?$/,
        replacement: resolve(__dirname, '../../../apps/__mocks__/swiper/css.ts')
      }
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['cobertura'],
      reportsDirectory: '../../../coverage/libs/journeys/ui'
    },
    retry: process.env.CI === 'true' ? 3 : 0,
    passWithNoTests: true
  }
})
