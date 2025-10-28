import type { ShortestConfig } from '@antiwork/shortest'

const defaultPort = Number.parseInt(process.env.WATCH_MODERN_SHORTEST_PORT ?? '4800', 10)
const baseUrl = process.env.WATCH_MODERN_SHORTEST_BASE_URL ?? `http://localhost:${defaultPort}`

export default {
  headless: true,
  baseUrl,
  testPattern: 'shortest/tests/**/*.test.ts',
  ai: {
    provider: 'anthropic'
  },
  browser: {
    contextOptions: {
      ignoreHTTPSErrors: true
    }
  }
} satisfies ShortestConfig
