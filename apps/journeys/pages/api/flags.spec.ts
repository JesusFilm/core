import type { NextApiRequest, NextApiResponse } from 'next'

jest.mock('../../src/libs/getFlags', () => ({
  getFlags: jest.fn()
}))

import { getFlags } from '../../src/libs/getFlags'

import handler from './flags'

const mockGetFlags = getFlags as jest.MockedFunction<typeof getFlags>

function makeRes() {
  const status = jest.fn().mockReturnThis()
  const json = jest.fn().mockReturnThis()
  const setHeader = jest.fn().mockReturnThis()
  return {
    res: {
      status,
      json,
      setHeader
    } as unknown as NextApiResponse,
    status,
    json,
    setHeader
  }
}

describe('/api/flags handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns flags as JSON with no-store cache header', async () => {
    mockGetFlags.mockResolvedValue({ apologistChat: true, other: false })

    const { res, status, json, setHeader } = makeRes()

    await handler({} as NextApiRequest, res)

    expect(mockGetFlags).toHaveBeenCalledTimes(1)
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ apologistChat: true, other: false })
  })

  it('returns empty object when LaunchDarkly resolves no flags', async () => {
    mockGetFlags.mockResolvedValue({})

    const { res, status, json } = makeRes()

    await handler({} as NextApiRequest, res)

    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({})
  })
})
