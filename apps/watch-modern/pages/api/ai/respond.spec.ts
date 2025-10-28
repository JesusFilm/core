import { createHash, createHmac } from 'node:crypto'

import type { NextApiRequest, NextApiResponse } from 'next'

import handler from './respond'

jest.mock(
  '@ai-sdk/openai',
  () => ({
    createOpenAI: jest.fn(() => ({
      responses: jest.fn(() => 'mock-model')
    }))
  }),
  { virtual: true }
)

jest.mock(
  'ai',
  () => ({
    convertToCoreMessages: jest.fn((messages: unknown) => messages),
    generateText: jest.fn().mockResolvedValue({
      text: 'ok',
      response: { id: 'response', timestamp: new Date() },
      finishReason: 'stop',
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }
    })
  }),
  { virtual: true }
)

jest.mock('next-firebase-auth', () => ({
  verifyIdToken: jest.fn()
}))

jest.mock('../../../src/libs/auth/initAuth', () => ({
  initAuth: jest.fn(),
  authCookieHeaderName: 'watch-modern.AuthUser'
}))

type MockResponse = NextApiResponse & {
  statusCode: number
  headers: Record<string, string | string[]>
  body?: unknown
}

const createMockRes = (): MockResponse => {
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

const createMockReq = (overrides: Partial<NextApiRequest> = {}): NextApiRequest => ({
  method: 'POST',
  headers: { 'user-agent': 'jest', ...overrides.headers } as NextApiRequest['headers'],
  body: {
    messages: [
      {
        role: 'user',
        content: 'Hello there'
      }
    ],
    ...overrides.body
  },
  cookies: {},
  query: {},
  ...overrides
}) as NextApiRequest

describe('POST /studio/api/ai/respond guest usage enforcement', () => {
  const originalAuthSecret = process.env.AUTH_SECRET
  const originalOpenRouterKey = process.env.OPENROUTER_API_KEY

  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key'
  })

  afterEach(() => {
    process.env.AUTH_SECRET = originalAuthSecret
    process.env.OPENROUTER_API_KEY = originalOpenRouterKey
    jest.clearAllMocks()
  })

  it('returns 429 when guest usage exceeds the daily limit', async () => {
    const req = createMockReq()
    const res = createMockRes()

    const fingerprint = createHash('sha256')
      .update(String(req.headers['user-agent']))
      .digest('hex')
    const payload = JSON.stringify({
      id: 'guest-id',
      count: 5,
      resetAt: Date.now() + 1000,
      fingerprint
    })
    const signature = createHmac('sha256', process.env.AUTH_SECRET!)
      .update(payload)
      .digest('hex')
    const encoded = Buffer.from(`${payload}.${signature}`).toString('base64url')

    req.cookies = {
      'watch-modern.guest-usage': encoded
    }

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Daily guest limit reached'),
        requiresAuth: true,
        limit: 5
      })
    )
    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('watch-modern.guest-usage=')
    )
  })
})
