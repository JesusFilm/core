import { privateOperationErrorCodes } from '@core/yoga/mcp/editContract'
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
      }),
      expect.objectContaining({
        name: 'journey_edit',
        annotations: expect.objectContaining({
          readOnlyHint: false,
          idempotentHint: true
        }),
        inputSchema: expect.objectContaining({
          additionalProperties: false,
          required: [
            'journeyId',
            'expectedRevision',
            'idempotencyKey',
            'commands'
          ]
        })
      }),
      expect.objectContaining({
        name: 'journey_operation_get',
        annotations: expect.objectContaining({ readOnlyHint: true }),
        inputSchema: expect.objectContaining({ additionalProperties: false })
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
        code:
          privateOperationErrorCodes.some(
            (privateCode) => privateCode === code
          ) || code === 'LIMIT_EXCEEDED'
            ? 'ACCESS_DENIED_OR_NOT_FOUND'
            : code
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
        revision: 'private-revision'
      }
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

  it('executes a registered saved edit and exposes its historical receipt unchanged', async () => {
    const input = {
      journeyId: 'a',
      expectedRevision: '7',
      idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09',
      commands: [
        {
          type: 'typography_set',
          blockId: 'heading',
          content: 'Updated heading'
        }
      ]
    }
    const receipt = {
      contractVersion: '1',
      kind: 'historical_receipt',
      adminLink: 'https://admin.example/journeys/journey',
      status: 'committed',
      operationId: input.idempotencyKey,
      journeyId: 'a',
      committedRevision: '8',
      completedAt: '2026-11-17T00:00:00.000Z',
      historyId: null,
      changedFields: [{ blockId: 'heading', fields: ['content'] }],
      idMap: {},
      effectIds: [],
      warnings: []
    }
    read.mockResolvedValue(receipt)
    const saved = await payload(
      await post(runtimeUrl(runtime), version, 'tools/call', {
        name: 'journey_edit',
        arguments: input
      })
    )
    expect(saved.result.structuredContent).toEqual(receipt)
    expect(read).toHaveBeenCalledExactlyOnceWith({
      tool: 'journey_edit',
      input
    })
    const lookedUp = await payload(
      await post(runtimeUrl(runtime), version, 'tools/call', {
        name: 'journey_operation_get',
        arguments: { journeyId: 'a', operationId: input.idempotencyKey }
      })
    )
    expect(lookedUp.result.structuredContent).toEqual(receipt)
  })

  it.each([
    {
      name: 'journey_edit',
      arguments: {
        journeyId: 'a',
        expectedRevision: '7',
        idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09',
        commands: [
          {
            type: 'typography_set',
            blockId: 'heading',
            content: 'private-text-sentinel',
            hostId: 'private-host-sentinel'
          }
        ]
      }
    },
    {
      name: 'journey_edit',
      arguments: {
        journeyId: 'a',
        expectedRevision: '7',
        idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09',
        commands: [
          { type: 'journey_replace', document: 'private-content-sentinel' }
        ]
      }
    },
    { name: 'journey_operation_get', arguments: { journeyId: 'a' } }
  ])(
    'rejects excluded edit fields without echoing arguments',
    async (params) => {
      const response = await payload(
        await post(runtimeUrl(runtime), version, 'tools/call', params)
      )
      expect(response.result.structuredContent).toMatchObject({
        code: 'VALIDATION_FAILED'
      })
      expect(JSON.stringify(response.result)).not.toContain('private-')
      expect(read).not.toHaveBeenCalled()
    }
  )

  it.each(privateOperationErrorCodes)(
    'projects protected historical failure %s',
    async (code) => {
      const failure = { contractVersion: '1', kind: 'operation_failure', code }
      read.mockResolvedValue(failure)
      const response = await payload(
        await post(runtimeUrl(runtime), version, 'tools/call', {
          name: 'journey_operation_get',
          arguments: {
            journeyId: 'a',
            idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09'
          }
        })
      )
      expect(response.result.isError).toBe(true)
      expect(response.result.structuredContent).toEqual(failure)
    }
  )

  it.each(['REVISION_CONFLICT', 'LIMIT_EXCEEDED'])(
    'projects authorized read failure %s',
    async (code) => {
      const failure = { contractVersion: '1', kind: 'read_failure', code }
      read.mockResolvedValue(failure)
      const response = await payload(
        await post(runtimeUrl(runtime), version, 'tools/call', {
          name: 'journey_read',
          arguments: { journeyId: 'a', view: 'steps' }
        })
      )
      expect(response.result.isError).toBe(true)
      expect(response.result.structuredContent).toEqual(failure)
    }
  )

  it('enforces decoded tool input bytes independently of envelope overhead', async () => {
    const response = await payload(
      await post(runtimeUrl(runtime), version, 'tools/call', {
        name: 'journey_edit',
        arguments: {
          journeyId: 'a',
          expectedRevision: '7',
          idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09',
          commands: [
            {
              type: 'typography_set',
              blockId: 'heading',
              content: 'é'.repeat(131072)
            }
          ]
        }
      })
    )
    expect(response.result.structuredContent).toMatchObject({
      code: 'LIMIT_EXCEEDED'
    })
    expect(read).not.toHaveBeenCalled()
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
