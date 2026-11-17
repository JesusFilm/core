import pino from 'pino'

import { readConfig } from '../src/config'
import { createRuntime } from '../src/runtime'

const runtime = createRuntime(
  { ...readConfig(process.env), port: 0 },
  {
    logger: pino({ enabled: false })
  }
)
void runtime.listen().then(() => {
  process.send?.({ port: (runtime.server.address() as { port: number }).port })
})
process.once('SIGTERM', () => {
  void runtime.shutdown().finally(() => process.exit())
})
