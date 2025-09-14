import { LangfuseSpanProcessor } from '@langfuse/otel'
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor
} from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

export function register() {
  // Prevent double initialization
  if (!(globalThis as any).__journeysInstrumentationLoaded__) {
    ;(globalThis as any).__journeysInstrumentationLoaded__ = true

    const langfusePublicKey = process.env.LANGFUSE_PUBLIC_KEY
    const langfuseSecretKey = process.env.LANGFUSE_SECRET_KEY
    const langfuseBaseUrl = process.env.LANGFUSE_BASE_URL

    if (!langfusePublicKey || !langfuseSecretKey || !langfuseBaseUrl) {
      console.warn(
        'Langfuse tracing disabled: missing LANGFUSE_PUBLIC_KEY/SECRET_KEY/BASE_URL'
      )
    } else {
      const langfuseSpanProcessor = new LangfuseSpanProcessor({
        publicKey: langfusePublicKey,
        secretKey: langfuseSecretKey,
        baseUrl: langfuseBaseUrl
      })

      const spanProcessors = [
        langfuseSpanProcessor,
        // Show console spans in development for debugging
        ...(process.env.NODE_ENV !== 'production'
          ? [new SimpleSpanProcessor(new ConsoleSpanExporter())]
          : [])
      ]

      // Same approach as working reference
      const tracerProvider = new NodeTracerProvider({
        spanProcessors
      })

      tracerProvider.register()

      // Global flush function with error handling
      ;(globalThis as any).__langfuseFlush__ = async () => {
        try {
          await langfuseSpanProcessor.forceFlush()
        } catch (error) {
          console.warn('[journeys] Langfuse flush error:', error.message)
        }
      }

      // Store provider globally for debugging
      ;(globalThis as any).__tracerProvider__ = tracerProvider
    }
  }
}

// Keep the flush utility function with error handling
export const flush = async (): Promise<void> => {
  try {
    const globalFlush = (globalThis as any).__langfuseFlush__
    if (typeof globalFlush === 'function') {
      await globalFlush()
    }
  } catch (error) {
    console.warn('[journeys] Error during flush:', error.message)
  }
}
