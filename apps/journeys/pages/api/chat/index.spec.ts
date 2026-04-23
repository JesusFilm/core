import type { NextApiRequest, NextApiResponse } from 'next'

import { getFlags } from '../../../src/libs/getFlags'

import handler from './index'

jest.mock('@ai-sdk/google', () => ({ google: jest.fn() }))
jest.mock('@ai-sdk/openai', () => ({ openai: jest.fn() }))
jest.mock('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: jest.fn(() => ({ chatModel: jest.fn() }))
}))
jest.mock('ai', () => ({
  convertToModelMessages: jest.fn(),
  streamText: jest.fn(() => ({
    pipeUIMessageStreamToResponse: jest.fn()
  }))
}))
jest.mock(
  'langfuse',
  () => ({
    Langfuse: jest.fn()
  }),
  { virtual: true }
)
jest.mock('../../../src/libs/getFlags', () => ({
  getFlags: jest.fn()
}))
jest.mock('../../../src/libs/langfuse/client', () => ({
  APOLOGIST_PROMPT_NAME: 'apologist-world-cup-chat',
  getActivePromptLabel: jest.fn(() => 'Development'),
  getLangfuse: jest.fn(() => null)
}))

const mockGetFlags = getFlags as jest.MockedFunction<typeof getFlags>

function makeRes() {
  const status = jest.fn().mockReturnThis()
  const end = jest.fn().mockReturnThis()
  const json = jest.fn().mockReturnThis()
  const setHeader = jest.fn().mockReturnThis()
  const headersSent = false
  return {
    res: {
      status,
      end,
      json,
      setHeader,
      headersSent
    } as unknown as NextApiResponse,
    status,
    end,
    json,
    setHeader
  }
}

describe('/api/chat handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 404 when apologistChat flag is off and does not read body', async () => {
    mockGetFlags.mockResolvedValue({ apologistChat: false })

    const body = new Proxy(
      {},
      {
        get: () => {
          throw new Error('req.body must not be read when flag is off')
        }
      }
    )
    const req = {
      method: 'POST',
      get body() {
        return body
      }
    } as unknown as NextApiRequest

    const { res, status, end, json } = makeRes()

    await handler(req, res)

    expect(mockGetFlags).toHaveBeenCalledTimes(1)
    expect(status).toHaveBeenCalledWith(404)
    expect(end).toHaveBeenCalledWith()
    expect(json).not.toHaveBeenCalled()
  })

  it('returns 404 when apologistChat flag is missing', async () => {
    mockGetFlags.mockResolvedValue({})

    const req = {
      method: 'POST',
      body: { messages: [{ role: 'user', content: 'hi' }] }
    } as unknown as NextApiRequest

    const { res, status, end } = makeRes()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(404)
    expect(end).toHaveBeenCalledWith()
  })

  it('passes the flag gate and returns 405 for non-POST when flag is on', async () => {
    mockGetFlags.mockResolvedValue({ apologistChat: true })

    const req = {
      method: 'GET'
    } as unknown as NextApiRequest

    const { res, status, end, setHeader } = makeRes()

    await handler(req, res)

    expect(setHeader).toHaveBeenCalledWith('Allow', 'POST')
    expect(status).toHaveBeenCalledWith(405)
    expect(end).toHaveBeenCalledWith('Method Not Allowed')
  })

  it('passes the flag gate and returns 400 when POST has no messages', async () => {
    mockGetFlags.mockResolvedValue({ apologistChat: true })

    const req = {
      method: 'POST',
      body: { messages: [] }
    } as unknown as NextApiRequest

    const { res, status, json } = makeRes()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'messages are required' })
  })
})
