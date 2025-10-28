import type { NextApiRequest, NextApiResponse } from 'next'

import handler from './login'

const mockSetAuthCookies = jest.fn()

jest.mock('next-firebase-auth', () => ({
  setAuthCookies: (...args: unknown[]) => mockSetAuthCookies(...args)
}))

jest.mock('../../src/libs/auth/initAuth', () => ({
  initAuth: jest.fn()
}))

type MockResponse = NextApiResponse & {
  statusCode: number
  json: jest.Mock
  headers: Record<string, string | string[]>
}

const createResponse = (): MockResponse => {
  const res: Partial<MockResponse> = {
    statusCode: 200,
    headers: {},
    setHeader: jest.fn((key: string, value: string | string[]) => {
      res.headers![key] = value
      return res as MockResponse
    }),
    status: jest.fn((code: number) => {
      res.statusCode = code
      return res as MockResponse
    }),
    json: jest.fn((payload: unknown) => {
      res.body = payload
      return res as MockResponse
    })
  }

  return res as MockResponse
}

const createRequest = (method: string): NextApiRequest =>
  ({ method, body: {}, cookies: {}, query: {}, headers: {} } as NextApiRequest)

describe('/studio/api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rejects non-POST requests', async () => {
    const req = createRequest('GET')
    const res = createResponse()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method Not Allowed' })
    expect(res.headers['Allow']).toBe('POST')
    expect(mockSetAuthCookies).not.toHaveBeenCalled()
  })

  it('sets auth cookies on POST requests', async () => {
    const req = createRequest('POST')
    const res = createResponse()

    await handler(req, res)

    expect(mockSetAuthCookies).toHaveBeenCalledWith(req, res, {})
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})
