import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const toolDir = dirname(fileURLToPath(import.meta.url))

// Tool-local Vitest config. The pure modules (env, normalize, sanitize,
// aggregate) are unit-tested here; the I/O modules (langfuse, openrouter,
// pdf) are verified by the documented manual run. Node environment, no
// coverage — see tools/langfuse-export/README.md.
// `root` is pinned to the tool dir so `include` resolves regardless of the
// shell's cwd (the repo runs Vitest from the workspace root).
export default defineConfig({
  root: toolDir,
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: { enabled: false },
    passWithNoTests: true
  }
})
