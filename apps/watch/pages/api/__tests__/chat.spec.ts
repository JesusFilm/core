import { EventEmitter } from 'events'
import type { NextApiRequest, NextApiResponse } from 'next'


jest.mock(
  '@langfuse/tracing',
  () => ({
    observe: jest.fn((handler) => handler),
    updateActiveObservation: jest.fn(),
    updateActiveTrace: jest.fn()
  }),
  { virtual: true }
)

const mockEnd = jest.fn()
jest.mock('@opentelemetry/api', () => ({
  trace: {
    getActiveSpan: jest.fn(() => ({
      end: mockEnd
    }))
  }
}))

jest.mock(
  '../../../instrumentation',
  () => ({
    langfuseSpanProcessor: {
      forceFlush: jest.fn().mockResolvedValue(undefined)
    }
  }),
  { virtual: true }
)

jest.mock(
  '../../../src/libs/ai/langfuse/promptHelper',
  () => ({
    getPrompt: jest.fn(() => Promise.resolve('mocked-system-prompt'))
  }),
  { virtual: true }
)

const mockModel = { id: 'openai/gpt/4o' }
jest.mock(
  '@ai-sdk/openai-compatible',
  () => ({
    createOpenAICompatible: jest.fn(() => jest.fn(() => mockModel))
  }),
  { virtual: true }
)

const mockPipeDataStreamToResponse = jest.fn()
let capturedOnFinish: (({ text }: { text: string }) => void) | undefined
jest.mock('ai', () => ({
  convertToModelMessages: jest.fn(() => 'converted-messages'),
  streamText: jest.fn((options) => {
    capturedOnFinish = options.onFinish
    return {
      pipeDataStreamToResponse: mockPipeDataStreamToResponse
    }
  })
}))

const { updateActiveObservation, updateActiveTrace } = jest.requireMock(
  '@langfuse/tracing'
) as {
  updateActiveObservation: jest.Mock
  updateActiveTrace: jest.Mock
}

const { trace } = jest.requireMock('@opentelemetry/api') as {
  trace: { getActiveSpan: jest.Mock }
}

const { langfuseSpanProcessor } = jest.requireMock('../../../instrumentation') as {
  langfuseSpanProcessor: { forceFlush: jest.Mock }
}

const { getPrompt } = jest.requireMock(
  '../../../src/libs/ai/langfuse/promptHelper'
) as {
  getPrompt: jest.Mock
}

const { convertToModelMessages, streamText } = jest.requireMock('ai') as {
  convertToModelMessages: jest.Mock
  streamText: jest.Mock
}

const { chatHandler } = require('../chat') as {
  chatHandler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
}

describe('chatHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    capturedOnFinish = undefined
  })

  it('should return 405 for non-POST methods', async () => {
    const req = { method: 'GET' } as unknown as NextApiRequest
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse

    await chatHandler(req, res)

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST')
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should stream chat responses and flush spans', async () => {
    const body = {
      messages: [
        {
          parts: [
            {
              type: 'text',
              text: 'Hello'
            }
          ]
        }
      ],
      contextText: 'context',
      sessionId: 'session-123',
      journeyId: 'journey-456',
      userId: 'user-789'
    }

    const req = {
      method: 'POST',
      body
    } as unknown as NextApiRequest

    const res = Object.assign(new EventEmitter(), {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }) as unknown as NextApiResponse & EventEmitter

    await chatHandler(req, res)

    expect(updateActiveObservation).toHaveBeenCalledWith({ input: 'Hello' })
    expect(updateActiveTrace).toHaveBeenCalledWith({
      name: 'ai-assistant-chat',
      sessionId: 'session-123',
      userId: 'user-789',
      input: 'Hello',
      metadata: { journeyId: 'journey-456' }
    })

    expect(getPrompt).toHaveBeenCalledWith('Chat-Prompt', { contextText: 'context' })
    expect(convertToModelMessages).toHaveBeenCalledWith(body.messages)
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: mockModel,
        system: 'mocked-system-prompt',
        messages: 'converted-messages',
        experimental_telemetry: { isEnabled: true }
      })
    )

    expect(mockPipeDataStreamToResponse).toHaveBeenCalledWith(
      res,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive'
        })
      })
    )

    capturedOnFinish?.({ text: 'final text' })

    expect(updateActiveObservation).toHaveBeenLastCalledWith({ output: 'final text' })
    expect(updateActiveTrace).toHaveBeenLastCalledWith({ output: 'final text' })
    expect(trace.getActiveSpan).toHaveBeenCalled()
    expect(mockEnd).toHaveBeenCalled()

    res.emit('finish')
    await Promise.resolve()

    expect(langfuseSpanProcessor.forceFlush).toHaveBeenCalled()
  })
})
