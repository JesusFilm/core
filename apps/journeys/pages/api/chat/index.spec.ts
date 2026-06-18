import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { convertToModelMessages, streamText } from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'
import { type Mock, type MockedFunction } from 'vitest'

import { getCardChatEnabled } from '../../../src/libs/getCardChatEnabled'
import { getFlags } from '../../../src/libs/getFlags'
import {
  getActivePromptLabel,
  getLangfuse
} from '../../../src/libs/langfuse/client'

import handler from './index'

const { mockLoggerError, mockLoggerWarn, mockLoggerInfo } = vi.hoisted(() => ({
  mockLoggerError: vi.fn(),
  mockLoggerWarn: vi.fn(),
  mockLoggerInfo: vi.fn()
}))

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => ({ id: 'gemini' }))
}))
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({ id: 'openai' }))
}))
vi.mock('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: vi.fn(() => ({
    chatModel: vi.fn(() => ({ id: 'compat' }))
  }))
}))
vi.mock('ai', () => ({
  convertToModelMessages: vi.fn((messages) => messages),
  streamText: vi.fn()
}))
vi.mock('langfuse', () => ({
  Langfuse: vi.fn()
}))
vi.mock('../../../src/libs/getFlags', () => ({
  getFlags: vi.fn()
}))
vi.mock('../../../src/libs/getCardChatEnabled', () => ({
  getCardChatEnabled: vi.fn()
}))
vi.mock('../../../src/libs/langfuse/client', () => ({
  APOLOGIST_PROMPT_NAME: 'apologist-world-cup-chat',
  getActivePromptLabel: vi.fn(() => 'development'),
  getLangfuse: vi.fn(() => null)
}))
vi.mock('../../../src/libs/logger', () => ({
  logger: { error: mockLoggerError, warn: mockLoggerWarn, info: mockLoggerInfo }
}))

const mockGetFlags = getFlags as unknown as MockedFunction<typeof getFlags>
const mockGetCardChatEnabled = getCardChatEnabled as unknown as MockedFunction<
  typeof getCardChatEnabled
>
const mockGetLangfuse = getLangfuse as unknown as MockedFunction<
  typeof getLangfuse
>
const mockGetActivePromptLabel =
  getActivePromptLabel as unknown as MockedFunction<typeof getActivePromptLabel>
const mockStreamText = streamText as unknown as Mock
const mockConvertToModelMessages = convertToModelMessages as unknown as Mock
const mockCreateOpenAICompatible =
  createOpenAICompatible as unknown as MockedFunction<
    typeof createOpenAICompatible
  >

interface CapturedRes {
  res: NextApiResponse
  status: Mock
  end: Mock
  json: Mock
  setHeader: Mock
}

function makeRes(headersSent = false): CapturedRes {
  const status = vi.fn().mockReturnThis()
  const end = vi.fn().mockReturnThis()
  const json = vi.fn().mockReturnThis()
  const setHeader = vi.fn().mockReturnThis()
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
  trace: Mock
  generation: Mock
  generationEnd: Mock
  flushAsync: Mock
  getPrompt: Mock
  compile: Mock
}

function makeFakeLangfuse(
  opts: {
    promptResult?: unknown
    promptError?: Error
  } = {}
): FakeLangfuse {
  const generationEnd = vi.fn()
  const generation = vi.fn(() => ({ end: generationEnd }))
  const trace = vi.fn(() => ({ generation }))
  const flushAsync = vi.fn().mockResolvedValue(undefined)
  const compile = vi.fn(
    (vars: { language?: string }) =>
      `compiled-system[lang=${vars.language ?? ''}]`
  )
  const getPrompt = vi.fn(async () => {
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
let mockPipeStream: Mock

function installStreamTextSuccess(): void {
  mockPipeStream = vi.fn()
  mockStreamText.mockImplementation((config) => {
    lastStreamConfig = config as typeof lastStreamConfig
    return { pipeUIMessageStreamToResponse: mockPipeStream }
  })
}

function installStreamTextSyncThrow(error: Error): void {
  mockPipeStream = vi.fn()
  mockStreamText.mockImplementation(() => {
    throw error
  })
}

const ORIGINAL_ENV = process.env

describe('/api/chat handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    // Default the per-card kill switch to "enabled" so the existing happy-path
    // tests reach streamText. Tests that exercise the 403 override this.
    mockGetCardChatEnabled.mockResolvedValue(true)
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

      const { res, status, json } = makeRes()

      await handler(req, res)

      expect(mockGetFlags).toHaveBeenCalledTimes(1)
      expect(status).toHaveBeenCalledWith(404)
      // Carries a `code` so the client recognises the deterministic flag-off
      // and hides Retry. Crucially, this still never reads req.body (the Proxy
      // above would throw) — the flag check alone decides the 404.
      expect(json).toHaveBeenCalledWith({
        error: 'not found',
        code: 'not_found'
      })
    })

    it('returns 404 when apologistChat flag is missing', async () => {
      mockGetFlags.mockResolvedValue({})

      const req = {
        method: 'POST',
        body: { messages: [{ role: 'user', content: 'hi' }] }
      } as unknown as NextApiRequest

      const { res, status, json } = makeRes()

      await handler(req, res)

      expect(status).toHaveBeenCalledWith(404)
      expect(json).toHaveBeenCalledWith({
        error: 'not found',
        code: 'not_found'
      })
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
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
    })
  })

  describe('resolveChatModel', () => {
    beforeEach(() => {
      mockGetFlags.mockResolvedValue({ apologistChat: true })
    })

    function postReq(): NextApiRequest {
      return {
        method: 'POST',
        body: {
          messages: [{ role: 'user', content: 'hi' }],
          journeyId: 'journey-1',
          cardId: 'card-1'
        },
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
          journeyId: 'journey-1',
          cardId: 'card-1',
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

      await handler(postReq(), makeRes().res)

      expect(fake.getPrompt).toHaveBeenCalledTimes(1)
      expect(lastStreamConfig?.system).toContain(
        'You are a helpful Christian apologist'
      )
      expect(mockLoggerWarn).toHaveBeenCalled()
    })

    it("falls back when prompt type is not 'text'", async () => {
      const fake = makeFakeLangfuse({
        promptResult: { type: 'chat', compile: vi.fn() }
      })
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      expect(lastStreamConfig?.system).toContain(
        'You are a helpful Christian apologist'
      )
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
          journeyId: overrides.journeyId ?? 'journey-1',
          cardId: 'card-1',
          ...(overrides.language != null && { language: overrides.language }),
          ...(overrides.sessionId != null && {
            sessionId: overrides.sessionId
          })
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

      await handler(postReq(), makeRes().res)

      const generationCall = fake.generation.mock.calls[0][0]
      expect(generationCall.prompt).toBeUndefined()
    })

    it('does not create a trace, generation, or flush when langfuse is null', async () => {
      mockGetLangfuse.mockReturnValue(null)

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

    it('logs a structured info event on successful completion (no PII)', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(
        {
          method: 'POST',
          body: {
            messages: [{ role: 'user', content: 'hi' }],
            language: 'es',
            sessionId: 'sess-1',
            journeyId: 'journey-1',
            cardId: 'card-1'
          },
          headers: { 'x-vercel-ip-country': 'NZ' }
        } as unknown as NextApiRequest,
        makeRes().res
      )

      await lastStreamConfig?.onFinish?.({
        text: 'a reply',
        usage: { inputTokens: 5, outputTokens: 9 },
        finishReason: 'stop'
      })

      expect(mockLoggerInfo).toHaveBeenCalledTimes(1)
      const [fields, message] = mockLoggerInfo.mock.calls[0]
      expect(message).toBe('[chat] completed')
      expect(fields).toMatchObject({
        event: 'apologist_chat_completed',
        journeyId: 'journey-1',
        cardId: 'card-1',
        language: 'es',
        ipCountry: 'NZ',
        sessionId: 'sess-1',
        provider: 'apologist',
        modelId: 'openai/gpt/4o-mini',
        turn: 1,
        promptTokens: 5,
        completionTokens: 9,
        finishReason: 'stop'
      })
      expect(typeof fields.durationMs).toBe('number')
      expect(typeof fields.promptChars).toBe('number')
      // No PII: raw message text / content is never logged, only counts.
      expect(fields).not.toHaveProperty('messages')
      expect(fields).not.toHaveProperty('text')
      // Regression guard: journeyTitle was removed as client-controlled
      // (untrusted) input and must never return to the logs.
      expect(fields).not.toHaveProperty('journeyTitle')
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

    it("ends with ERROR and logs a no-PII error event when onFinish reports finishReason 'error'", async () => {
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

      await lastStreamConfig?.onFinish?.({
        text: 'secret model reply',
        finishReason: 'error'
      })

      expect(fake.generationEnd).toHaveBeenCalledTimes(1)
      expect(fake.generationEnd).toHaveBeenCalledWith({
        level: 'ERROR',
        statusMessage: 'finishReason=error'
      })
      expect(fake.flushAsync).toHaveBeenCalledTimes(1)

      // Error event carries its own tag but mirrors the success event's
      // non-PII triage fields, so both are queryable the same way in Datadog.
      expect(mockLoggerError).toHaveBeenCalledTimes(1)
      const [fields, message] = mockLoggerError.mock.calls[0]
      expect(message).toBe('[chat] completed with error')
      expect(fields).toMatchObject({
        event: 'apologist_chat_error',
        journeyId: 'journey-1',
        language: 'es',
        ipCountry: 'NZ',
        sessionId: 'sess-1',
        provider: 'apologist',
        modelId: 'openai/gpt/4o-mini',
        turn: 1,
        finishReason: 'error'
      })
      expect(typeof fields.durationMs).toBe('number')
      expect(typeof fields.promptChars).toBe('number')
      // No PII: the user's message text, the model reply, and the raw IP are
      // never logged — only counts and identifiers.
      expect(fields).not.toHaveProperty('messages')
      expect(fields).not.toHaveProperty('text')
      expect(fields).not.toHaveProperty('journeyTitle')
    })

    it('ends with ERROR and flushes when onError fires (mid-stream failure)', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

      await handler(postReq(), makeRes().res)

      await lastStreamConfig?.onError?.({ error: new Error('socket hangup') })

      expect(fake.generationEnd).toHaveBeenCalledTimes(1)
      expect(fake.generationEnd).toHaveBeenCalledWith({
        level: 'ERROR',
        statusMessage: 'socket hangup'
      })
      expect(fake.flushAsync).toHaveBeenCalledTimes(1)
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'apologist_chat_stream_error' }),
        '[chat] streamText onError'
      )
    })

    it('ends the generation exactly once when onError fires before onFinish', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

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
    })

    it('ends the generation exactly once when onFinish fires before onError', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)

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
    })

    it('responds 500 + ends the generation when streamText throws synchronously', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)
      installStreamTextSyncThrow(new Error('sync boom'))

      const { res, status, json } = makeRes(false)
      await handler(postReq(), res)

      expect(fake.generationEnd).toHaveBeenCalledTimes(1)
      expect(fake.generationEnd).toHaveBeenCalledWith({
        level: 'ERROR',
        statusMessage: 'sync boom'
      })
      expect(fake.flushAsync).toHaveBeenCalledTimes(1)
      expect(status).toHaveBeenCalledWith(500)
      // Generic message; raw 'sync boom' stays in server logs.
      expect(json).toHaveBeenCalledWith({ error: 'upstream streamText failed' })
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'apologist_chat_sync_error' }),
        '[chat] synchronous error'
      )
    })

    it('calls res.end() instead of writing JSON when headers were already sent before the throw', async () => {
      const fake = makeFakeLangfuse()
      mockGetLangfuse.mockReturnValue(fake as never)
      installStreamTextSyncThrow(new Error('post-headers boom'))

      const { res, status, json, end } = makeRes(true)
      await handler(postReq(), res)

      expect(status).not.toHaveBeenCalled()
      expect(json).not.toHaveBeenCalled()
      expect(end).toHaveBeenCalledWith()
    })
  })

  describe('request bounds (NES-1579)', () => {
    beforeEach(() => {
      mockGetFlags.mockResolvedValue({ apologistChat: true })
    })

    function postReq(body: unknown): NextApiRequest {
      // journeyId + cardId are now required (NES-1679). Inject them into object
      // bodies so each bounds test fails for its intended reason rather than for
      // a missing id. Non-object bodies (e.g. the "not-an-object" case) and
      // bodies that already set these ids pass through unchanged.
      const withRequiredIds =
        body != null && typeof body === 'object' && !Array.isArray(body)
          ? {
              journeyId: 'journey-1',
              cardId: 'card-1',
              ...(body as Record<string, unknown>)
            }
          : body
      return {
        method: 'POST',
        body: withRequiredIds,
        headers: {}
      } as unknown as NextApiRequest
    }

    it('rejects a non-object body with 400 invalid request', async () => {
      const { res, status, json } = makeRes()

      await handler(postReq('not-an-object'), res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('rejects when messages is missing from the body', async () => {
      const { res, status, json } = makeRes()

      await handler(postReq({}), res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('rejects when a message is missing role', async () => {
      const { res, status, json } = makeRes()

      await handler(postReq({ messages: [{ content: 'hi' }] }), res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('rejects when a message role is outside the user/assistant/system enum', async () => {
      const { res, status, json } = makeRes()

      await handler(
        postReq({ messages: [{ role: 'banana', content: 'hi' }] }),
        res
      )

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('rejects a message that has neither content nor parts', async () => {
      const { res, status, json } = makeRes()

      await handler(postReq({ messages: [{ role: 'user' }] }), res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('rejects with 400 when convertToModelMessages throws', async () => {
      mockGetLangfuse.mockReturnValue(null)
      mockConvertToModelMessages.mockImplementationOnce(() => {
        throw new Error('unsupported part shape')
      })

      const { res, status, json } = makeRes()

      await handler(
        postReq({ messages: [{ role: 'user', content: 'hi' }] }),
        res
      )

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'apologist_chat_convert_error' }),
        '[chat] convertToModelMessages failed'
      )
    })

    it('rejects when a single message exceeds the per-message char cap', async () => {
      const { res, status, json } = makeRes()

      await handler(
        postReq({
          messages: [{ role: 'user', content: 'x'.repeat(4001) }]
        }),
        res
      )

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('rejects when the messages array exceeds the count cap', async () => {
      // 41 > MAX_MESSAGES (40, raised in NES-1663).
      const messages = Array.from({ length: 41 }, () => ({
        role: 'user',
        content: 'hi'
      }))
      const { res, status, json } = makeRes()

      await handler(postReq({ messages }), res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('rejects an over-cap conversation with a coded 400 and logs a warn event (NES-1663)', async () => {
      // 11 messages * 4000 chars = 44000 > MAX_TOTAL_CHARS (40000), each at the
      // per-message cap and within the message-count cap.
      const messages = Array.from({ length: 11 }, () => ({
        role: 'user',
        content: 'x'.repeat(4000)
      }))
      const { res, status, json } = makeRes()

      await handler(
        {
          method: 'POST',
          body: {
            messages,
            language: 'es',
            sessionId: 'sess-1',
            journeyId: 'journey-1',
            cardId: 'card-1'
          },
          headers: {}
        } as unknown as NextApiRequest,
        res
      )

      expect(status).toHaveBeenCalledWith(400)
      // Coded body: the client switches on `code` (AI SDK v6 hides the status)
      // to show the catered message + hide Retry.
      expect(json).toHaveBeenCalledWith({
        error: 'request too large',
        code: 'conversation_capped'
      })
      expect(mockStreamText).not.toHaveBeenCalled()

      // Observability: warn (not error — it's user-driven, not a fault) with
      // non-PII triage fields for the Datadog frequency query.
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        {
          event: 'chat_conversation_capped',
          sessionId: 'sess-1',
          journeyId: 'journey-1',
          language: 'es',
          messageCount: 11,
          promptChars: 44000
        },
        'chat conversation hit size cap'
      )
      // Never escalated to an error log — keeps it out of error alerts.
      expect(mockLoggerError).not.toHaveBeenCalled()
    })

    it('counts parts[].text toward the per-message and total caps', async () => {
      const messages = [
        {
          role: 'user',
          parts: [{ type: 'text', text: 'x'.repeat(4001) }]
        }
      ]
      const { res, status, json } = makeRes()

      await handler(postReq({ messages }), res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('forwards maxOutputTokens=512 to streamText on the happy path', async () => {
      mockGetLangfuse.mockReturnValue(null)

      await handler(
        postReq({ messages: [{ role: 'user', content: 'hi' }] }),
        makeRes().res
      )

      expect(mockStreamText).toHaveBeenCalledTimes(1)
      expect(mockStreamText.mock.calls[0][0]).toMatchObject({
        maxOutputTokens: 512
      })
    })

    it('accepts a request right at the per-message char cap', async () => {
      mockGetLangfuse.mockReturnValue(null)
      const { res, status, json } = makeRes()

      await handler(
        postReq({
          messages: [{ role: 'user', content: 'x'.repeat(4000) }]
        }),
        res
      )

      expect(status).not.toHaveBeenCalledWith(400)
      expect(json).not.toHaveBeenCalledWith({ error: 'invalid request' })
      expect(mockStreamText).toHaveBeenCalledTimes(1)
    })
  })

  describe('per-card kill switch (NES-1679)', () => {
    beforeEach(() => {
      mockGetFlags.mockResolvedValue({ apologistChat: true })
    })

    function postReq(body: Record<string, unknown>): NextApiRequest {
      return {
        method: 'POST',
        body,
        headers: {}
      } as unknown as NextApiRequest
    }

    it('returns 400 when cardId is missing from the body', async () => {
      const { res, status, json } = makeRes()

      await handler(
        postReq({ messages: [{ role: 'user', content: 'hi' }] }),
        res
      )

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      // The card lookup never runs — the schema rejects the request first.
      expect(mockGetCardChatEnabled).not.toHaveBeenCalled()
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('returns 400 (not 403) when journeyId is missing from the body', async () => {
      const { res, status, json } = makeRes()

      await handler(
        postReq({
          messages: [{ role: 'user', content: 'hi' }],
          cardId: 'card-1'
        }),
        res
      )

      // A missing journeyId is a malformed request, not a killed card: it must
      // 400 invalid_request, not route through the kill switch to a 403
      // chat_disabled (which would wrongly show the "chat turned off" copy).
      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({
        error: 'invalid request',
        code: 'invalid_request'
      })
      expect(mockGetCardChatEnabled).not.toHaveBeenCalled()
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it('passes journeyId + cardId to the lookup and streams when chat is enabled', async () => {
      mockGetCardChatEnabled.mockResolvedValue(true)
      mockGetLangfuse.mockReturnValue(null)

      await handler(
        postReq({
          messages: [{ role: 'user', content: 'hi' }],
          journeyId: 'journey-1',
          cardId: 'card-1'
        }),
        makeRes().res
      )

      expect(mockGetCardChatEnabled).toHaveBeenCalledWith({
        journeyId: 'journey-1',
        cardId: 'card-1'
      })
      expect(mockStreamText).toHaveBeenCalledTimes(1)
    })

    it('returns 403 with a chat_disabled code when the card has chat disabled', async () => {
      mockGetCardChatEnabled.mockResolvedValue(false)
      const { res, status, json } = makeRes()

      await handler(
        postReq({
          messages: [{ role: 'user', content: 'hi' }],
          journeyId: 'journey-1',
          cardId: 'card-1'
        }),
        res
      )

      expect(status).toHaveBeenCalledWith(403)
      expect(json).toHaveBeenCalledWith({
        error: 'chat disabled for this card',
        code: 'chat_disabled'
      })
      // Fails closed before any model work.
      expect(mockStreamText).not.toHaveBeenCalled()
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'chat_card_disabled' }),
        '[chat] blocked: chat disabled for card'
      )
    })

    it('does not run the card lookup when the apologistChat flag is off', async () => {
      mockGetFlags.mockResolvedValue({ apologistChat: false })
      const { res, status } = makeRes()

      await handler(
        postReq({
          messages: [{ role: 'user', content: 'hi' }],
          journeyId: 'journey-1',
          cardId: 'card-1'
        }),
        res
      )

      expect(status).toHaveBeenCalledWith(404)
      expect(mockGetCardChatEnabled).not.toHaveBeenCalled()
    })
  })
})
