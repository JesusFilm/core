import { fingerprint, resultContractVersion } from '@core/yoga/mcp/readContract'

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

  it('does not report executor fences for metadata-only or failed-authentication sessions', async () => {
    const reads = session()
    await reads.authorizeOutput(Buffer.from('{}'))
    await reads.settleOutput()
    expect(fetchMock).not.toHaveBeenCalled()
    fetchMock
      .mockReset()
      .mockResolvedValueOnce(Response.json({}, { status: 403 }))
    const denied = session()
    await expect(denied.read(request)).rejects.toThrow()
    await denied.settleOutput()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('prevents a buffered response from beginning output authorization after closure', async () => {
    const data = { contractVersion: resultContractVersion, journeys: [] }
    fetchMock.mockResolvedValueOnce(Response.json({ data }))
    const reads = session()
    await reads.read(request)
    await reads.settleOutput()
    await reads.authorizeOutput(Buffer.from('{}'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
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
