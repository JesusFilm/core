import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { streamText } from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'

import { getFlags } from '../../../src/libs/getFlags'
import {
  getActivePromptLabel,
  getLangfuse
} from '../../../src/libs/langfuse/client'

import handler from './index'

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => ({ id: 'gemini' }))
}))
jest.mock('@ai-sdk/openai', () => ({
  openai: jest.fn(() => ({ id: 'openai' }))
}))
jest.mock('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: jest.fn(() => ({
    chatModel: jest.fn(() => ({ id: 'compat' }))
  }))
}))
jest.mock('ai', () => ({
  convertToModelMessages: jest.fn((messages) => messages),
  streamText: jest.fn()
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
  getActivePromptLabel: jest.fn(() => 'development'),
  getLangfuse: jest.fn(() => null)
}))

const mockGetFlags = getFlags as jest.MockedFunction<typeof getFlags>
const mockGetLangfuse = getLangfuse as jest.MockedFunction<typeof getLangfuse>
const mockGetActivePromptLabel = getActivePromptLabel as jest.MockedFunction<
  typeof getActivePromptLabel
>
const mockStreamText = streamText as unknown as jest.Mock
const mockCreateOpenAICompatible =
  createOpenAICompatible as jest.MockedFunction<typeof createOpenAICompatible>

interface CapturedRes {
  res: NextApiResponse
  status: jest.Mock
  end: jest.Mock
  json: jest.Mock
  setHeader: jest.Mock
}

function makeRes(headersSent = false): CapturedRes {
  const status = jest.fn().mockReturnThis()
  const end = jest.fn().mockReturnThis()
  const json = jest.fn().mockReturnThis()
  const setHeader = jest.fn().mockReturnThis()
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

interface FakeLangfuse {
  trace: jest.Mock
  generation: jest.Mock
  generationEnd: jest.Mock
  flushAsync: jest.Mock
  getPrompt: jest.Mock
  compile: jest.Mock
}

function makeFakeLangfuse(
  opts: {
    promptResult?: unknown
    promptError?: Error
  } = {}
): FakeLangfuse {
  const generationEnd = jest.fn()
  const generation = jest.fn(() => ({ end: generationEnd }))
  const trace = jest.fn(() => ({ generation }))
  const flushAsync = jest.fn().mockResolvedValue(undefined)
  const compile = jest.fn(
    (vars: { language?: string }) =>
      `compiled-system[lang=${vars.language ?? ''}]`
  )
  const getPrompt = jest.fn(async () => {
    if (opts.promptError != null) throw opts.promptError
    return (
      opts.promptResult ?? {
        type: 'text',
        compile
      }
    )
  })
  return { trace, generation, generationEnd, flushAsync, getPrompt, compile }
}

let lastStreamConfig: {
  onError?: (args: { error: unknown }) => Promise<void> | void
  onFinish?: (args: {
    text: string
    usage?: { inputTokens?: number; outputTokens?: number }
    finishReason: string
  }) => Promise<void> | void
  system: string
  messages: unknown
  model: unknown
} | null = null
let mockPipeStream: jest.Mock

function installStreamTextSuccess(): void {
  mockPipeStream = jest.fn()
  mockStreamText.mockImplementation((config) => {
    lastStreamConfig = config as typeof lastStreamConfig
    return { pipeUIMessageStreamToResponse: mockPipeStream }
  })
}

function installStreamTextSyncThrow(error: Error): void {
  mockPipeStream = jest.fn()
  mockStreamText.mockImplementation(() => {
    throw error
  })
}

const ORIGINAL_ENV = process.env

describe('/api/chat handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.CHAT_PROVIDER
    delete process.env.OPENROUTER_API_KEY
    delete process.env.OPENROUTER_MODEL
    delete process.env.APOLOGIST_API_URL
    delete process.env.APOLOGIST_API_KEY
    delete process.env.APOLOGIST_MODEL_ID
    process.env.APOLOGIST_API_URL = 'https://apologist.test'
    process.env.APOLOGIST_API_KEY = 'apologist-test-key'
    mockGetActivePromptLabel.mockReturnValue('development')
    mockGetLangfuse.mockReturnValue(null)
    lastStreamConfig = null
    installStreamTextSuccess()
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  describe('flag gating', () => {
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

    it('returns 405 for non-POST when flag is on', async () => {
      mockGetFlags.mockResolvedValue({ apologistChat: true })

      const req = { method: 'GET' } as unknown as NextApiRequest

      const { res, status, end, setHeader } = makeRes()

      await handler(req, res)

      expect(setHeader).toHaveBeenCalledWith('Allow', 'POST')
      expect(status).toHaveBeenCalledWith(405)
      expect(end).toHaveBeenCalledWith('Method Not Allowed')
    })

    it('returns 400 when POST has no messages', async () => {
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

  describe('resolveChatModel', () => {
    beforeEach(() => {
      mockGetFlags.mockResolvedValue({ apologistChat: true })
    })

    function postReq(): NextApiRequest {
      return {
        method: 'POST',
        body: { messages: [{ role: 'user', content: 'hi' }] },
        headers: {}
      } as unknown as NextApiRequest
    }

    it('uses apologist provider by default and forwards env-driven model id', async () => {
      process.env.APOLOGIST_MODEL_ID = 'openai/gpt/4o-mini'
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      expect(mockCreateOpenAICompatible).toHaveBeenCalledWith({
        name: 'apologist',
        baseURL: 'https://apologist.test',
        apiKey: 'apologist-test-key'
      })
      expect(fake.trace.mock.calls[0][0].metadata).toMatchObject({
        provider: 'apologist',
        modelId: 'openai/gpt/4o-mini'
      })
    })

    it('selects gemini provider when CHAT_PROVIDER=gemini', async () => {
      process.env.CHAT_PROVIDER = 'gemini'
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      expect(fake.trace.mock.calls[0][0].metadata).toMatchObject({
        provider: 'gemini',
        modelId: 'gemini-2.0-flash'
      })
    })

    it('selects openai provider when CHAT_PROVIDER=openai', async () => {
      process.env.CHAT_PROVIDER = 'openai'
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      expect(fake.trace.mock.calls[0][0].metadata).toMatchObject({
        provider: 'openai',
        modelId: 'gpt-4o'
      })
    })

    it('selects openrouter provider with default model when only key is set', async () => {
      process.env.CHAT_PROVIDER = 'openrouter'
      process.env.OPENROUTER_API_KEY = 'or-test'
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      expect(mockCreateOpenAICompatible).toHaveBeenCalledWith({
        name: 'openrouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: 'or-test'
      })
      expect(fake.trace.mock.calls[0][0].metadata).toMatchObject({
        provider: 'openrouter',
        modelId: 'google/gemini-3-flash-preview'
      })
    })

    it('selects openrouter provider with overridden model id from OPENROUTER_MODEL', async () => {
      process.env.CHAT_PROVIDER = 'openrouter'
      process.env.OPENROUTER_API_KEY = 'or-test'
      process.env.OPENROUTER_MODEL = 'anthropic/claude-3.5-sonnet'
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      expect(fake.trace.mock.calls[0][0].metadata).toMatchObject({
        provider: 'openrouter',
        modelId: 'anthropic/claude-3.5-sonnet'
      })
    })

    it('returns 503 when openrouter is selected but OPENROUTER_API_KEY is missing', async () => {
      process.env.CHAT_PROVIDER = 'openrouter'
      const { res, status, json } = makeRes()

      await handler(postReq(), res)

      expect(status).toHaveBeenCalledWith(503)
      expect(json).toHaveBeenCalledWith({
        error: 'openrouter provider is not configured'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('returns 503 when apologist is selected but APOLOGIST_API_URL is missing', async () => {
      delete process.env.APOLOGIST_API_URL
      const { res, status, json } = makeRes()

      await handler(postReq(), res)

      expect(status).toHaveBeenCalledWith(503)
      expect(json).toHaveBeenCalledWith({
        error: 'apologist provider is not configured'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('returns 503 when apologist is selected but APOLOGIST_API_KEY is missing', async () => {
      delete process.env.APOLOGIST_API_KEY
      const { res, status, json } = makeRes()

      await handler(postReq(), res)

      expect(status).toHaveBeenCalledWith(503)
      expect(json).toHaveBeenCalledWith({
        error: 'apologist provider is not configured'
      })
    })
  })

  describe('resolveSystemMessage', () => {
    beforeEach(() => {
      mockGetFlags.mockResolvedValue({ apologistChat: true })
    })

    function postReq(language?: string): NextApiRequest {
      return {
        method: 'POST',
        body: {
          messages: [{ role: 'user', content: 'hi' }],
          ...(language != null && { language })
        },
        headers: {}
      } as unknown as NextApiRequest
    }

    it('uses the static fallback prompt without a language line when langfuse is null', async () => {
      mockGetLangfuse.mockReturnValue(null)

      await handler(postReq(), makeRes().res)

      expect(mockStreamText).toHaveBeenCalledTimes(1)
      const system = lastStreamConfig?.system
      expect(system).toContain('You are a helpful Christian apologist')
      expect(system).toContain('Be warm, empathetic, and conversational.')
      expect(system).not.toContain('Respond in the following language')
    })

    it('appends the language line to the fallback prompt when language is present', async () => {
      mockGetLangfuse.mockReturnValue(null)

      await handler(postReq('Spanish'), makeRes().res)

      expect(lastStreamConfig?.system).toContain(
        'Respond in the following language: Spanish'
      )
    })

    it('falls back when langfuse.getPrompt throws (regression: 404 / bad label)', async () => {
      const fake = makeFakeLangfuse({
        promptError: Object.assign(new Error('not found'), {
          name: 'LangfuseHTTPError'
        })
      })
      mockGetLangfuse.mockReturnValue(fake as never)
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

      await handler(postReq(), makeRes().res)

      expect(fake.getPrompt).toHaveBeenCalledTimes(1)
      expect(lastStreamConfig?.system).toContain(
        'You are a helpful Christian apologist'
      )
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it("falls back when prompt type is not 'text'", async () => {
      const fake = makeFakeLangfuse({
        promptResult: { type: 'chat', compile: jest.fn() }
      })
      mockGetLangfuse.mockReturnValue(fake as never)
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

      await handler(postReq(), makeRes().res)

      expect(lastStreamConfig?.system).toContain(
        'You are a helpful Christian apologist'
      )
      warnSpy.mockRestore()
    })

    it('compiles the prompt with the language variable on success', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq('French'), makeRes().res)

      expect(fake.getPrompt).toHaveBeenCalledWith(
        'apologist-world-cup-chat',
        undefined,
        { label: 'development' }
      )
      expect(fake.compile).toHaveBeenCalledWith({ language: 'French' })
      expect(lastStreamConfig?.system).toBe('compiled-system[lang=French]')
    })

    it('omits the language variable from compile when none is supplied', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      expect(fake.compile).toHaveBeenCalledWith({})
    })

    it('forwards the active prompt label from getActivePromptLabel', async () => {
      mockGetActivePromptLabel.mockReturnValue('production')
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      expect(fake.getPrompt).toHaveBeenCalledWith(
        'apologist-world-cup-chat',
        undefined,
        { label: 'production' }
      )
    })
  })

  describe('tracing lifecycle', () => {
    beforeEach(() => {
      mockGetFlags.mockResolvedValue({ apologistChat: true })
    })

    function postReq(
      overrides: Partial<{
        language: string
        sessionId: string
        journeyId: string
        ipCountry: string
      }> = {}
    ): NextApiRequest {
      const headers: Record<string, string> = {}
      if (overrides.ipCountry != null)
        headers['x-vercel-ip-country'] = overrides.ipCountry
      return {
        method: 'POST',
        body: {
          messages: [{ role: 'user', content: 'hi' }],
          ...(overrides.language != null && { language: overrides.language }),
          ...(overrides.sessionId != null && {
            sessionId: overrides.sessionId
          }),
          ...(overrides.journeyId != null && { journeyId: overrides.journeyId })
        },
        headers
      } as unknown as NextApiRequest
    }

    it('builds a trace + generation with full request metadata', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(
        postReq({
          language: 'es',
          sessionId: 'sess-1',
          journeyId: 'journey-1',
          ipCountry: 'NZ'
        }),
        makeRes().res
      )

      expect(fake.trace).toHaveBeenCalledWith({
        name: 'apologist-chat',
        sessionId: 'sess-1',
        metadata: {
          journeyId: 'journey-1',
          language: 'es',
          ipCountry: 'NZ',
          provider: 'apologist',
          modelId: 'openai/gpt/4o-mini'
        }
      })
      expect(fake.generation).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'apologist-generation',
          model: 'openai/gpt/4o-mini',
          input: [{ role: 'user', content: 'hi' }],
          prompt: expect.objectContaining({ type: 'text' })
        })
      )
    })

    it('omits prompt linkage when the prompt fetch falls back', async () => {
      const fake = makeFakeLangfuse({
        promptError: new Error('boom')
      })
      mockGetLangfuse.mockReturnValue(fake as never)
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

      await handler(postReq(), makeRes().res)

      const generationCall = fake.generation.mock.calls[0][0]
      expect(generationCall.prompt).toBeUndefined()
      warnSpy.mockRestore()
    })

    it('does not create a trace, generation, or flush when langfuse is null', async () => {
      mockGetLangfuse.mockReturnValue(null)
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      await handler(postReq(), makeRes().res)

      expect(mockStreamText).toHaveBeenCalledTimes(1)
      expect(mockPipeStream).toHaveBeenCalledTimes(1)

      await expect(
        lastStreamConfig?.onFinish?.({
          text: 'reply',
          usage: { inputTokens: 1, outputTokens: 2 },
          finishReason: 'stop'
        })
      ).resolves.not.toThrow()

      await expect(
        lastStreamConfig?.onError?.({ error: new Error('mid-stream') })
      ).resolves.not.toThrow()

      errorSpy.mockRestore()
    })

    it('ends the generation with output + usage on a successful onFinish', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      await lastStreamConfig?.onFinish?.({
        text: 'hello back',
        usage: { inputTokens: 11, outputTokens: 7 },
        finishReason: 'stop'
      })

      expect(fake.generationEnd).toHaveBeenCalledTimes(1)
      expect(fake.generationEnd).toHaveBeenCalledWith({
        output: 'hello back',
        usage: { input: 11, output: 7, unit: 'TOKENS' },
        level: 'DEFAULT'
      })
      expect(fake.flushAsync).toHaveBeenCalledTimes(1)
    })

    it('omits usage from the end payload when streamText reports no usage', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      await lastStreamConfig?.onFinish?.({
        text: 'no usage path',
        finishReason: 'stop'
      })

      expect(fake.generationEnd).toHaveBeenCalledWith({
        output: 'no usage path',
        usage: undefined,
        level: 'DEFAULT'
      })
    })

    it("ends with ERROR when onFinish reports finishReason 'error'", async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      await lastStreamConfig?.onFinish?.({
        text: '',
        finishReason: 'error'
      })

      expect(fake.generationEnd).toHaveBeenCalledTimes(1)
      expect(fake.generationEnd).toHaveBeenCalledWith({
        level: 'ERROR',
        statusMessage: 'finishReason=error'
      })
      expect(fake.flushAsync).toHaveBeenCalledTimes(1)
    })

    it('ends with ERROR and flushes when onError fires (mid-stream failure)', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      await handler(postReq(), makeRes().res)

      await lastStreamConfig?.onError?.({ error: new Error('socket hangup') })

      expect(fake.generationEnd).toHaveBeenCalledTimes(1)
      expect(fake.generationEnd).toHaveBeenCalledWith({
        level: 'ERROR',
        statusMessage: 'socket hangup'
      })
      expect(fake.flushAsync).toHaveBeenCalledTimes(1)
      errorSpy.mockRestore()
    })

    it('ends the generation exactly once when onError fires before onFinish', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      await handler(postReq(), makeRes().res)

      await lastStreamConfig?.onError?.({ error: new Error('first') })
      await lastStreamConfig?.onFinish?.({
        text: 'late',
        usage: { inputTokens: 1, outputTokens: 1 },
        finishReason: 'stop'
      })

      expect(fake.generationEnd).toHaveBeenCalledTimes(1)
      expect(fake.generationEnd).toHaveBeenCalledWith({
        level: 'ERROR',
        statusMessage: 'first'
      })
      errorSpy.mockRestore()
    })

    it('ends the generation exactly once when onFinish fires before onError', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      await handler(postReq(), makeRes().res)

      await lastStreamConfig?.onFinish?.({
        text: 'good',
        usage: { inputTokens: 2, outputTokens: 3 },
        finishReason: 'stop'
      })
      await lastStreamConfig?.onError?.({ error: new Error('late error') })

      expect(fake.generationEnd).toHaveBeenCalledTimes(1)
      expect(fake.generationEnd).toHaveBeenCalledWith({
        output: 'good',
        usage: { input: 2, output: 3, unit: 'TOKENS' },
        level: 'DEFAULT'
      })
      errorSpy.mockRestore()
    })

    it('responds 500 + ends the generation when streamText throws synchronously', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)
      installStreamTextSyncThrow(new Error('sync boom'))
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      const { res, status, json } = makeRes(false)
      await handler(postReq(), res)

      expect(fake.generationEnd).toHaveBeenCalledTimes(1)
      expect(fake.generationEnd).toHaveBeenCalledWith({
        level: 'ERROR',
        statusMessage: 'sync boom'
      })
      expect(fake.flushAsync).toHaveBeenCalledTimes(1)
      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'sync boom' })
      errorSpy.mockRestore()
    })

    it('calls res.end() instead of writing JSON when headers were already sent before the throw', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)
      installStreamTextSyncThrow(new Error('post-headers boom'))
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      const { res, status, json, end } = makeRes(true)
      await handler(postReq(), res)

      expect(status).not.toHaveBeenCalled()
      expect(json).not.toHaveBeenCalled()
      expect(end).toHaveBeenCalledWith()
      errorSpy.mockRestore()
    })
  })
})
