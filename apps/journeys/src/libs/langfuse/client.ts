import { LangfuseClient } from '@langfuse/client'
import { LangfuseSpanProcessor } from '@langfuse/otel'
import {
  LangfuseGeneration,
  type LangfuseGenerationAttributes,
  LangfuseSpan
} from '@langfuse/tracing'
import { ROOT_CONTEXT, trace } from '@opentelemetry/api'
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base'

let cached: LangfuseClient | null | undefined
let provider: BasicTracerProvider | undefined
let warned = false

export const APOLOGIST_PROMPT_NAME = 'apologist-world-cup-chat'

export function getLangfuse(): LangfuseClient | null {
  if (cached !== undefined) return cached

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY
  const secretKey = process.env.LANGFUSE_SECRET_KEY
  const baseUrl = process.env.LANGFUSE_BASE_URL

  if (
    publicKey == null ||
    publicKey === '' ||
    secretKey == null ||
    secretKey === '' ||
    baseUrl == null ||
    baseUrl === ''
  ) {
    if (!warned) {
      console.warn(
        '[langfuse] missing LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY / LANGFUSE_BASE_URL — tracing + prompt fetch disabled'
      )
      warned = true
    }
    cached = null
    return cached
  }

  // Keep Langfuse export isolated from Next.js/Datadog's global provider.
  provider = new BasicTracerProvider({
    spanProcessors: [
      new LangfuseSpanProcessor({
        publicKey,
        secretKey,
        baseUrl,
        environment: resolveTracingEnvironment(),
        exportMode: 'batched',
        additionalHeaders: { 'x-langfuse-ingestion-version': '4' }
      })
    ]
  })
  cached = new LangfuseClient({ publicKey, secretKey, baseUrl })
  return cached
}

export function startChatGeneration({
  sessionId,
  metadata,
  ...attributes
}: LangfuseGenerationAttributes & {
  sessionId?: string
  metadata: Record<string, unknown>
}): { end: (attributes: LangfuseGenerationAttributes) => void } | null {
  if (getLangfuse() == null || provider == null) return null
  const tracer = provider.getTracer('langfuse-sdk')
  const contextAttributes = {
    'langfuse.trace.name': 'apologist-chat',
    ...(sessionId != null && { 'session.id': sessionId })
  }
  const root = new LangfuseSpan({
    otelSpan: tracer.startSpan(
      'apologist-chat',
      { attributes: contextAttributes },
      ROOT_CONTEXT
    ),
    attributes: { input: attributes.input, metadata }
  })
  const generation = new LangfuseGeneration({
    otelSpan: tracer.startSpan(
      'apologist-generation',
      { attributes: contextAttributes },
      trace.setSpan(ROOT_CONTEXT, root.otelSpan)
    ),
    attributes: { ...attributes, metadata }
  })
  let ended = false
  return {
    end(finalAttributes) {
      if (ended) return
      ended = true
      generation.update(finalAttributes)
      root.update({
        output: finalAttributes.output,
        level: finalAttributes.level,
        statusMessage: finalAttributes.statusMessage
      })
      generation.end()
      root.end()
    }
  }
}

export async function flushLangfuse(): Promise<void> {
  try {
    await provider?.forceFlush()
  } catch {
    // Telemetry delivery must not turn a completed chat into an HTTP error.
    console.warn('[langfuse] trace export failed')
  }
}

export function getActivePromptLabel(): string {
  return process.env.VERCEL_ENV === 'production' ? 'production' : 'development'
}

// Without this, every trace ships as `environment: undefined` and Langfuse
// buckets prod, stage, preview, and local-dev together as "default".
function resolveTracingEnvironment(): string {
  const override = process.env.LANGFUSE_TRACING_ENVIRONMENT
  if (override != null && override !== '') return override
  if (process.env.VERCEL_ENV === 'production') return 'production'
  if (process.env.VERCEL_ENV === 'preview') {
    return process.env.VERCEL_GIT_COMMIT_REF === 'stage' ? 'stage' : 'preview'
  }
  return 'development'
}
