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

  it('advertises strict input rules with an optional list limit', async () => {
    const response = await payload(
      await post(runtimeUrl(runtime), version, 'tools/list')
    )
    expect(response.result.tools).toEqual([
      expect.objectContaining({
        name: 'journeys_list',
        inputSchema: expect.objectContaining({
          type: 'object',
          additionalProperties: false,
          properties: expect.objectContaining({
            limit: expect.objectContaining({
              type: 'integer',
              minimum: 1,
              maximum: 50,
              default: 20
            })
          })
        })
      }),
      expect.objectContaining({
        name: 'journey_read',
        inputSchema: expect.objectContaining({
          type: 'object',
          additionalProperties: false,
          required: ['journeyId', 'view']
        })
      })
    ])
    expect(JSON.stringify(response.result.tools[0])).not.toContain('"required"')
  })

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

  it.each([
    { name: 'journeys_list', arguments: { limit: 0 } },
    { name: 'journeys_list', arguments: { limit: 51 } },
    { name: 'journeys_list', arguments: { query: 'x'.repeat(201) } },
    {
      name: 'journeys_list',
      arguments: { ['private-field-' + 'x'.repeat(10000)]: 'private-value' }
    },
    { name: 'journey_read', arguments: {} },
    {
      name: 'journey_read',
      arguments: { journeyId: 'private-id', view: 'unsupported-view' }
    },
    {
      name: 'journey_read',
      arguments: {
        journeyId: 'private-id',
        view: 'steps',
        stepIds: Array.from({ length: 1001 }, () => 'private-step')
      }
    },
    {
      name: 'journey_read',
      arguments: { journeyId: 'private-id', view: 'outline', revision: '-1' }
    },
    {
      name: 'journey_read',
      arguments: {
        journeyId: 'private-id',
        view: 'outline',
        revision: '18446744073709551616'
      }
    },
    {
      name: 'journey_read',
      arguments: {
        journeyId: 'private-id',
        view: 'outline',
        'private-field': 'private-value'
      }
    }
  ])('versions and bounds invalid arguments for $name', async (params) => {
    const response = await payload(
      await post(runtimeUrl(runtime), version, 'tools/call', params)
    )
    expect(response.error).toBeUndefined()
    expect(response.result.isError).toBe(true)
    expect(response.result.structuredContent).toMatchObject({
      contractVersion: resultContractVersion,
      code: 'VALIDATION_FAILED',
      fieldRules: {
        type: 'object',
        additionalProperties: false,
        properties:
          params.name === 'journeys_list'
            ? { limit: { type: 'integer', minimum: 1, maximum: 50 } }
            : { stepIds: { minItems: 1, maxItems: 20 } }
      }
    })
    const serialized = JSON.stringify(response.result)
    expect(Buffer.byteLength(serialized)).toBeLessThan(8192)
    expect(serialized).not.toContain('private-')
    expect(serialized).not.toContain('unsupported-view')
    expect(read).not.toHaveBeenCalled()
  })

  it('applies input defaults before admitting a read', async () => {
    read.mockResolvedValue({ contractVersion: resultContractVersion })
    await post(runtimeUrl(runtime), version, 'tools/call', {
      name: 'journeys_list'
    })
    expect(read).toHaveBeenCalledExactlyOnceWith({
      tool: 'journeys_list',
      input: { limit: 20 }
    })
  })

  it.each([
    { method: 'tools/call', params: { name: 'unknown_tool', arguments: {} } },
    { method: 'tools/call', params: { arguments: {} } },
    { method: 'tools/call', params: { name: 'journeys_list', arguments: [] } },
    { method: 'unknown/method', params: {} }
  ])('retains protocol errors for $method with $params', async (request) => {
    const response = await payload(
      await post(runtimeUrl(runtime), version, request.method, request.params)
    )
    expect(response.error).toBeDefined()
    expect(response.result).toBeUndefined()
    expect(read).not.toHaveBeenCalled()
  })
})
