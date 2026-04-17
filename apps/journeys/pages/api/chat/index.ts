import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  type LanguageModel,
  UIMessage,
  UIMessageChunk,
  convertToModelMessages,
  createUIMessageStream,
  generateText,
  pipeUIMessageStreamToResponse
} from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'

type ChatProvider = 'apologist' | 'gemini' | 'openai'

/**
 * Fetch wrapper that logs every upstream HTTP call made by the AI SDK
 * provider. Logs request URL/method/body-preview before the call and
 * response status/content-type + first 1KB (or byte count if streaming)
 * after the call. Uses response.clone() so the real call path still sees
 * an intact body.
 */
const loggingFetch: typeof fetch = async (input, init) => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url
  const method = init?.method ?? 'POST'

  let bodyPreview = '(no body)'
  if (init?.body != null) {
    if (typeof init.body === 'string') {
      bodyPreview = init.body.slice(0, 400)
    } else if (init.body instanceof Uint8Array) {
      try {
        bodyPreview = new TextDecoder().decode(init.body).slice(0, 400)
      } catch {
        bodyPreview = `(binary body, ${init.body.byteLength} bytes)`
      }
    } else {
      bodyPreview = `(body type=${typeof init.body})`
    }
  }

  console.log(
    '[apologist:upstream] ->',
    method,
    url,
    'bodyPreview=',
    bodyPreview
  )

  const response = await fetch(input, init)

  const contentType = response.headers.get('content-type') ?? ''
  const transferEncoding = response.headers.get('transfer-encoding') ?? ''
  console.log(
    '[apologist:upstream] <- status=',
    response.status,
    'content-type=',
    contentType,
    'transfer-encoding=',
    transferEncoding
  )

  const isStream =
    contentType.includes('text/event-stream') ||
    transferEncoding.includes('chunked')

  if (isStream) {
    console.log('[apologist:upstream] <- stream begin')
    try {
      const clone = response.clone()
      const reader = clone.body?.getReader()
      if (reader != null) {
        void (async () => {
          let total = 0
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              total += value?.byteLength ?? 0
            }
            console.log(
              '[apologist:upstream] <- stream end totalBytes=',
              total
            )
          } catch (err) {
            console.error(
              '[apologist:upstream] <- stream read error totalBytes=',
              total,
              'err=',
              err
            )
          }
        })()
      }
    } catch (err) {
      console.error('[apologist:upstream] <- stream clone error', err)
    }
  } else {
    try {
      const clone = response.clone()
      const text = await clone.text()
      console.log(
        '[apologist:upstream] <- body preview (first 1KB):',
        text.slice(0, 1024)
      )
    } catch (err) {
      console.error('[apologist:upstream] <- body read error', err)
    }
  }

  return response
}

function getChatModel(): {
  model: LanguageModel
  provider: ChatProvider
  modelId: string
  baseURL?: string
} {
  const provider = (process.env.CHAT_PROVIDER ?? 'apologist') as ChatProvider

  switch (provider) {
    case 'gemini':
      return {
        model: google('gemini-2.0-flash'),
        provider,
        modelId: 'gemini-2.0-flash'
      }
    case 'openai':
      return { model: openai('gpt-4o'), provider, modelId: 'gpt-4o' }
    case 'apologist':
    default: {
      const baseURL = process.env.APOLOGIST_API_URL ?? ''
      const apologist = createOpenAICompatible({
        name: 'apologist',
        baseURL,
        apiKey: process.env.APOLOGIST_API_KEY ?? '',
        fetch: loggingFetch
      })
      // Match the proven working curl (scripts/apologist-test.sh) which
      // uses openai/gpt/4o-mini. The earlier openai/gpt/4o is not the
      // model the upstream was smoke-tested against.
      const modelId = 'openai/gpt/4o-mini'
      return {
        model: apologist.chatModel(modelId),
        provider: 'apologist',
        modelId,
        baseURL
      }
    }
  }
}

interface ChatRequestBody {
  messages: UIMessage[]
  contextText?: string
  language?: string
  interactionType?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  console.log('[apologist:server] handler=chat method=', req.method)

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }

  const {
    messages,
    contextText,
    language,
    interactionType
  } = req.body as ChatRequestBody

  console.log(
    '[apologist:server] request payload messageCount=',
    messages?.length ?? 0,
    'contextText.length=',
    contextText?.length ?? 0,
    'language=',
    language,
    'interactionType=',
    interactionType
  )

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: 'messages are required' })
    return
  }

  const systemMessage = buildSystemMessage({
    contextText,
    language,
    interactionType
  })

  const modelMessages = await convertToModelMessages(messages)

  const { model, provider, modelId, baseURL } = getChatModel()
  console.log(
    '[apologist:server] model resolved provider=',
    provider,
    'modelId=',
    modelId,
    'baseURL=',
    baseURL ?? '(provider default)'
  )

  // Pragmatic fix: the upstream's SSE streaming response was not being
  // decoded by @ai-sdk/openai-compatible (first reproduction produced
  // finishReason=other + zero text + empty usage). The proven working
  // path against the same upstream is non-streaming chat/completions
  // (see scripts/apologist-test.sh). So we use generateText here and
  // then manually build a minimal UIMessageStream so the AI SDK v6
  // client (useChat) still receives a valid message stream.
  try {
    const {
      text,
      finishReason,
      usage,
      toolCalls
    } = await generateText({
      model,
      system: systemMessage,
      messages: modelMessages
    })

    console.log(
      '[apologist:server] generateText finishReason=',
      finishReason,
      'usage=',
      JSON.stringify(usage),
      'text.length=',
      text?.length ?? 0,
      'toolCalls=',
      toolCalls?.length ?? 0
    )

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const textId = `text-${Date.now()}`
        writer.write({ type: 'start' } as UIMessageChunk)
        writer.write({ type: 'start-step' } as UIMessageChunk)
        writer.write({
          type: 'text-start',
          id: textId
        } as UIMessageChunk)
        writer.write({
          type: 'text-delta',
          id: textId,
          delta: text ?? ''
        } as UIMessageChunk)
        writer.write({
          type: 'text-end',
          id: textId
        } as UIMessageChunk)
        writer.write({ type: 'finish-step' } as UIMessageChunk)
        writer.write({
          type: 'finish',
          finishReason
        } as UIMessageChunk)
      }
    })

    console.log(
      '[apologist:server] response protocol=createUIMessageStream + pipeUIMessageStreamToResponse (non-streaming upstream, synthesized UI stream)'
    )

    pipeUIMessageStreamToResponse({ response: res, stream })
  } catch (error) {
    const err = error as Error
    console.error(
      '[apologist:server] generateText error message=',
      err?.message,
      'stack=',
      err?.stack,
      'raw=',
      error
    )
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: err?.message ?? 'upstream generateText failed' })
    } else {
      res.end()
    }
  }
}

function buildSystemMessage({
  contextText,
  language,
  interactionType
}: {
  contextText?: string
  language?: string
  interactionType?: string
}): string {
  const parts: string[] = [
    'You are a helpful Christian apologist and spiritual guide.',
    'Be warm, empathetic, and conversational.',
    'Support your answers with relevant Bible passages when appropriate.',
    'Keep responses concise but thorough.'
  ]

  if (contextText != null && contextText.length > 0) {
    parts.push(
      `The user is currently viewing content with the following context: ${contextText}`
    )
  }

  if (language != null && language.length > 0) {
    parts.push(`Respond in the following language: ${language}`)
  }

  if (interactionType != null && interactionType.length > 0) {
    parts.push(`The user wants to: ${interactionType}`)
  }

  return parts.join('\n')
}
