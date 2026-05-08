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
    setupFiles: [resolve(__dirname, 'src/setupTests.tsx')],
    alias: {
      '@/': `${resolve(__dirname, 'src')}/`
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['cobertura'],
      reportsDirectory: '../../coverage/apps/player'
    },
    retry: process.env.CI === 'true' ? 3 : 0,
    passWithNoTests: true
  }
})
