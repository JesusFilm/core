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
    expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body))).toEqual({
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
})
