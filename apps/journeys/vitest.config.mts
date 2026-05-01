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
      root: resolve(__dirname, '../..'),
      ignoreConfigErrors: true
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost'
      }
    },
    reporters: ['default'],
    setupFiles: ['./setupTests.ts'],
    alias: {
      'swiper/react': resolve(__dirname, '../__mocks__/swiper/react.tsx'),
      'swiper/modules': resolve(__dirname, '../__mocks__/swiper/modules.tsx'),
      'swiper/css': resolve(__dirname, '../__mocks__/swiper/css.ts'),
      'styled-jsx/style': resolve(
        __dirname,
        '../__mocks__/styled-jsx/style.ts'
      )
    },
    coverage: {
      provider: 'v8',
      reporter: ['cobertura'],
      reportsDirectory: '../../coverage/apps/journeys'
    },
    retry: process.env.CI === 'true' ? 3 : 0,
    passWithNoTests: true
  }
})
