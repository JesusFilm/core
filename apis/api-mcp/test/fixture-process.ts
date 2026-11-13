import { type AddressInfo } from 'node:net'

import { readConfig } from '../src/config'
import { createRuntime } from '../src/runtime'

import { fixtureFactory } from './fixture'

const runtime = createRuntime(
  { ...readConfig(process.env), port: 0 },
  {
    factory: fixtureFactory(process.env.FIXTURE_REPLICA ?? 'fixture')
  }
)
void runtime.listen().then(() => {
  process.send?.({ port: (runtime.server.address() as AddressInfo).port })
})
process.on('SIGTERM', () => {
  void runtime.shutdown()
})
