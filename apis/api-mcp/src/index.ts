import pino from 'pino'

import { readConfig } from './config'
import { createRuntime } from './runtime'

const logger = pino({ name: 'api-mcp', base: undefined })

async function main(): Promise<void> {
  const runtime = createRuntime(readConfig(process.env), { logger })
  await runtime.listen()
  let stopping = false
  const stop = () => {
    if (stopping) return
    stopping = true
    void runtime.shutdown().catch(() => {
      logger.error({ event: 'shutdown_failed' })
      process.exitCode = 1
    })
  }
  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}

void main().catch(() => {
  logger.error({ event: 'startup_failed' })
  process.exitCode = 1
})
