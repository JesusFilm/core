import {
  resultContractVersion,
  safeReadErrors
} from '@core/yoga/mcp/readContract'

import { config, payload, post, runtimeUrl } from '../test/helpers'

import { createProtocolServer, protocolVersions } from './protocol'
import { createRuntime } from './runtime'

describe.each(protocolVersions)('versioned tool results on %s', (version) => {
  const read = vi.fn()
  let runtime: ReturnType<typeof createRuntime>

  beforeEach(async () => {
    read.mockReset()
    runtime = createRuntime(config(), {
      factory: () =>
        createProtocolServer({
          read,
          authorizeOutput: vi.fn(),
          settleOutput: vi.fn()
        })
    })
    await runtime.listen()
  })

  afterEach(async () => await runtime.shutdown())

  it.each(['journeys_list', 'journey_read'])(
    'preserves the owning result version for %s',
    async (name) => {
      const data = {
        contractVersion: resultContractVersion,
        nextCursor: null,
        ...(name === 'journeys_list' ? { journeys: [] } : { blocks: [] })
      }
      read.mockResolvedValue(data)
      const response = await payload(
        await post(runtimeUrl(runtime), version, 'tools/call', {
          name,
          arguments:
            name === 'journeys_list' ? {} : { journeyId: 'a', view: 'outline' }
        })
      )
      expect(response.result.isError).not.toBe(true)
      expect(response.result.structuredContent).toEqual(data)
    }
  )

  it.each(safeReadErrors)('versions expected %s errors', async (code) => {
    read.mockRejectedValue(new Error(code))
    for (const name of ['journeys_list', 'journey_read']) {
      const response = await payload(
        await post(runtimeUrl(runtime), version, 'tools/call', {
          name,
          arguments:
            name === 'journeys_list' ? {} : { journeyId: 'a', view: 'outline' }
        })
      )
      expect(response.result.isError).toBe(true)
      expect(response.result.structuredContent).toMatchObject({
        contractVersion: resultContractVersion,
        code
      })
    }
  })
})
