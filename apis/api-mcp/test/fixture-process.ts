import { type AddressInfo } from 'node:net'

import pino from 'pino'

import { readConfig } from '../src/config'
import { createRuntime } from '../src/runtime'
import { registerShutdown } from '../src/shutdown'

import { fixtureFactory } from './fixture'

const logger = pino({ name: 'api-mcp', base: undefined })
const runtime = createRuntime(
  { ...readConfig(process.env), port: 0 },
  {
    logger,
    factory: fixtureFactory(process.env.FIXTURE_REPLICA ?? 'fixture')
  }
)
void runtime.listen().then(() => {
  process.send?.({ port: (runtime.server.address() as AddressInfo).port })
})
registerShutdown(runtime.shutdown, logger)
