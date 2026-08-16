import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Match the previous Jest behaviour (@nx/react/plugins/jest), where importing a
// static asset returned its bare filename. Vite would otherwise resolve these to
// a `/public/...` URL, breaking specs that assert on the imported filename.
const assetFileNamePlugin = {
  name: 'watch-modern-asset-filename-mock',
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
    dedupe: ['react', 'react-dom']
  },
  css: {
    postcss: { plugins: [] }
  },
  test: {
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
      // Vitest 4 emptied coverage's include/exclude defaults and dropped
      // `coverage.all`. Restore the Vitest 3 report shape so untested source
      // still counts — see docs/agents/testing.md.
      include: ['**/*.{js,cjs,mjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/[.]**',
        '**/*.d.ts',
        'test?(s)/**',
        '**/__tests__/**',
        '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
      ],
      reporter: ['cobertura'],
      reportsDirectory: '../../coverage/apps/watch-modern'
    },
    retry: process.env.CI === 'true' ? 3 : 0,
    passWithNoTests: true
  }
})
