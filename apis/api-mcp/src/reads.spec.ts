import {
  fingerprint,
  maxStructuredResultBytes,
  resultContractVersion
} from '@core/yoga/mcp/readContract'

import { config } from '../test/helpers'

import { createReadSession } from './reads'

describe('versioned owning-service results', () => {
  const fetchMock = vi.fn<typeof fetch>()
  const request = { tool: 'journeys_list' as const, input: { limit: 20 } }
  const session = () =>
    createReadSession(
      {
        ...config(),
        issuerUrl: new URL('http://127.0.0.1:4011'),
        gatewayUrl: new URL('http://127.0.0.1:4000'),
        exchangeSecret: 'controlled-exchange-secret-at-least-32'
      },
      'controlled-token',
      '0b276608-2afd-4d72-8567-09c90e7433dc'
    )

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValueOnce(Response.json({ credential: 'signed' }))
  })

  afterEach(() => vi.unstubAllGlobals())

  it('binds output acceptance to the complete versioned page and response', async () => {
    const data = { contractVersion: resultContractVersion, journeys: [] }
    fetchMock.mockResolvedValueOnce(Response.json({ data }))
    const reads = session()
    expect(await reads.read(request)).toEqual(data)
    fetchMock.mockResolvedValueOnce(
      Response.json({ permitId: '6a8ced4d-22fd-433b-824f-d56510717135' })
    )
    const body = Buffer.from(JSON.stringify({ structuredContent: data }))
    await reads.authorizeOutput(body)
    expect(JSON.parse(fetchMock.mock.calls[2][1]?.body as string)).toEqual({
      request,
      stage: 'output',
      dataHash: fingerprint(data),
      outputHash: fingerprint(body.toString('utf8'))
    })
  })

  it('validates saved result structure before authorizing historical receipt output', async () => {
    const edit = {
      tool: 'journey_edit' as const,
      input: {
        journeyId: 'journey',
        expectedRevision: '4',
        idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09',
        commands: [
          {
            type: 'typography_set' as const,
            blockId: 'heading',
            content: 'new'
          }
        ]
      }
    }
    const receipt = {
      contractVersion: resultContractVersion,
      operationId: edit.input.idempotencyKey,
      journeyId: 'journey',
      committedRevision: '5',
      kind: 'historical_receipt',
      adminLink: 'https://admin.example/journeys/journey',
      status: 'committed',
      completedAt: '2026-11-17T00:00:00.000Z',
      historyId: null,
      changedFields: [{ blockId: 'heading', fields: ['content'] }],
      idMap: {},
      effectIds: [],
      warnings: []
    }
    fetchMock.mockResolvedValueOnce(Response.json({ data: receipt }))
    const saved = session()
    expect(await saved.read(edit)).toEqual(receipt)
    fetchMock.mockResolvedValueOnce(
      Response.json({ permitId: '6a8ced4d-22fd-433b-824f-d56510717135' })
    )
    await saved.authorizeOutput(Buffer.from(JSON.stringify(receipt)))
    expect(
      JSON.parse(fetchMock.mock.calls[2][1]?.body as string)
    ).toMatchObject({
      request: edit,
      dataHash: fingerprint(receipt),
      stage: 'output'
    })
    fetchMock.mockResolvedValueOnce(Response.json({ credential: 'signed' }))
    fetchMock.mockResolvedValueOnce(
      Response.json({ data: { ...receipt, host: 'private-host-sentinel' } })
    )
    const invalid = session()
    await expect(invalid.read(edit)).rejects.toThrow()
    await invalid.authorizeOutput(Buffer.from('{}'))
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })

  it('counts historical errors as protected output requiring a fresh permit', async () => {
    const request = {
      tool: 'journey_operation_get' as const,
      input: {
        journeyId: 'journey',
        idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09'
      }
    }
    const failure = {
      contractVersion: '1',
      kind: 'operation_failure',
      code: 'RESULT_EXPIRED'
    }
    fetchMock.mockResolvedValueOnce(Response.json({ data: failure }))
    const reads = session()
    expect(await reads.read(request)).toEqual(failure)
    fetchMock.mockResolvedValueOnce(
      Response.json({ permitId: '6a8ced4d-22fd-433b-824f-d56510717135' })
    )
    await reads.authorizeOutput(Buffer.from(JSON.stringify(failure)))
    expect(
      JSON.parse(fetchMock.mock.calls[2][1]?.body as string)
    ).toMatchObject({
      request,
      dataHash: fingerprint(failure),
      stage: 'output'
    })
  })

  it.each(['REVISION_CONFLICT', 'LIMIT_EXCEEDED'])(
    'counts read failure %s as protected output',
    async (code) => {
      const request = {
        tool: 'journey_read' as const,
        input: { journeyId: 'journey', view: 'steps' as const }
      }
      const failure = { contractVersion: '1', kind: 'read_failure', code }
      fetchMock.mockResolvedValueOnce(Response.json({ data: failure }))
      const reads = session()
      expect(await reads.read(request)).toEqual(failure)
      fetchMock.mockResolvedValueOnce(
        Response.json({ permitId: '6a8ced4d-22fd-433b-824f-d56510717135' })
      )
      await reads.authorizeOutput(Buffer.from(JSON.stringify(failure)))
      expect(
        JSON.parse(fetchMock.mock.calls[2][1]?.body as string)
      ).toMatchObject({
        request,
        dataHash: fingerprint(failure),
        stage: 'output'
      })
    }
  )

  it.each([undefined, '2', 1])(
    'rejects an absent or unsupported owner result version %s',
    async (contractVersion) => {
      fetchMock.mockResolvedValueOnce(
        Response.json({ data: { contractVersion, journeys: [] } })
      )
      const reads = session()
      await expect(reads.read(request)).rejects.toThrow()
      await reads.authorizeOutput(Buffer.from('{}'))
      expect(fetchMock).toHaveBeenCalledTimes(2)
    }
  )

  it('avoids metadata-only fences but closes every attempted exchange including failed authentication', async () => {
    const reads = session()
    await reads.authorizeOutput(Buffer.from('{}'))
    await reads.settleOutput()
    expect(fetchMock).not.toHaveBeenCalled()
    fetchMock
      .mockReset()
      .mockResolvedValueOnce(Response.json({}, { status: 403 }))
      .mockResolvedValueOnce(Response.json({ fenced: true }))
    const denied = session()
    await expect(denied.read(request)).rejects.toThrow()
    await denied.settleOutput()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toBe(
      'http://127.0.0.1:4011/internal/reads/fence'
    )
  })

  it('prevents a buffered response from beginning output authorization after closure', async () => {
    const data = { contractVersion: resultContractVersion, journeys: [] }
    fetchMock.mockResolvedValueOnce(Response.json({ data }))
    const reads = session()
    await reads.read(request)
    fetchMock.mockResolvedValueOnce(Response.json({ fenced: true }))
    await reads.settleOutput()
    await expect(reads.authorizeOutput(Buffer.from('{}'))).rejects.toThrow(
      'Sender closed'
    )
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('fences cancellation while credential exchange is still unresolved', async () => {
    let resolveExchange!: (response: Response) => void
    fetchMock.mockReset().mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveExchange = resolve
        })
    )
    const reads = session()
    const reading = reads.read(request)
    const rejected = expect(reading).rejects.toThrow('Sender closed')
    fetchMock.mockResolvedValueOnce(Response.json({ fenced: true }))
    await reads.settleOutput()
    resolveExchange(Response.json({ credential: 'signed' }))
    await rejected
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(fetchMock.mock.calls[1][1]?.body as string)).toEqual({
      executorId: '0b276608-2afd-4d72-8567-09c90e7433dc',
      executor: 'mcp'
    })
  })

  it('fences cancellation before an owning response without releasing buffered details', async () => {
    let resolveOwner!: (response: Response) => void
    let ownerStarted!: () => void
    const started = new Promise<void>((resolve) => {
      ownerStarted = resolve
    })
    fetchMock.mockImplementationOnce(() => {
      ownerStarted()
      return new Promise<Response>((resolve) => {
        resolveOwner = resolve
      })
    })
    const reads = session()
    const reading = reads.read(request)
    const rejected = expect(reading).rejects.toThrow('Sender closed')
    await started
    fetchMock.mockResolvedValueOnce(Response.json({ fenced: true }))
    await reads.settleOutput()
    resolveOwner(
      Response.json({
        data: { contractVersion: '1', privateContent: 'must-not-release' }
      })
    )
    await rejected
    await expect(reads.authorizeOutput(Buffer.from('private'))).rejects.toThrow(
      'Sender closed'
    )
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('accepts exactly 512 KiB of structured data with its bounded response envelope', async () => {
    const data = {
      contractVersion: resultContractVersion,
      journeys: [],
      padding: ''
    }
    data.padding = 'x'.repeat(
      maxStructuredResultBytes - Buffer.byteLength(JSON.stringify(data))
    )
    expect(Buffer.byteLength(JSON.stringify({ data }))).toBeGreaterThan(
      maxStructuredResultBytes
    )
    fetchMock.mockResolvedValueOnce(Response.json({ data }))
    expect(await session().read(request)).toEqual(data)
    fetchMock.mockResolvedValueOnce(Response.json({ credential: 'signed' }))
    fetchMock.mockResolvedValueOnce(
      Response.json({ data: { ...data, padding: data.padding + 'x' } })
    )
    const oversized = session()
    await expect(oversized.read(request)).rejects.toThrow('LIMIT_EXCEEDED')
    await oversized.authorizeOutput(Buffer.from('{}'))
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('reports the exact sender fence when closure races a lost output acceptance response', async () => {
    const data = { contractVersion: resultContractVersion, journeys: [] }
    fetchMock.mockResolvedValueOnce(Response.json({ data }))
    const reads = session()
    await reads.read(request)
    let rejectOutput!: (error: Error) => void
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((_resolve, reject) => {
          rejectOutput = reject
        })
    )
    const releasing = reads.authorizeOutput(Buffer.from('{}'))
    const failed = expect(releasing).rejects.toThrow('lost response')
    fetchMock.mockResolvedValueOnce(Response.json({ fenced: true }))
    await reads.settleOutput()
    expect(fetchMock.mock.calls[3][0]).toBe(
      'http://127.0.0.1:4011/internal/reads/fence'
    )
    expect(JSON.parse(fetchMock.mock.calls[3][1]?.body as string)).toEqual({
      executorId: '0b276608-2afd-4d72-8567-09c90e7433dc',
      executor: 'mcp'
    })
    rejectOutput(new Error('lost response'))
    await failed
  })
})
