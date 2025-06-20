import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/arclight-canary',
  plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  worker: {
    plugins: () => [nxViteTsPaths()]
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/arclight-canary',
      provider: 'v8'
    }
  }
})
