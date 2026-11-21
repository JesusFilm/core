import pino from 'pino'

import { readConfig } from './config'
import { createRuntime } from './runtime'
import { registerShutdown } from './shutdown'

const logger = pino({ name: 'api-mcp', base: undefined })

async function main(): Promise<void> {
  const runtime = createRuntime(readConfig(process.env), { logger })
  await runtime.listen()
  registerShutdown(runtime.shutdown, logger)
}

void main().catch(() => {
  logger.error({ event: 'startup_failed' })
  process.exitCode = 1
})
