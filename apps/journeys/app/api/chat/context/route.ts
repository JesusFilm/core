import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  observe,
  updateActiveObservation,
  updateActiveTrace
} from '@langfuse/tracing'
import { trace } from '@opentelemetry/api'
import { generateText } from 'ai'
import { NextRequest, NextResponse, after } from 'next/server'

import { langfuseSpanProcessor } from '../../../../instrumentation'
import { getPrompt } from '../../../../src/lib/ai/langfuse/promptHelper'

export type BlockContextInput = {
  blockId: string
  contextText: string
}

async function fetchBlockContext(
  blockId: string,
  contextText: string
): Promise<string> {
  const otelTracer = trace.getTracer('journey-context-generator')
  const startTime = Date.now()

  return otelTracer.startActiveSpan(
    `ai-context-generation-${blockId}`,
    async (span) => {
      try {
        span.setAttributes({
          'block.id': blockId,
          'block.context_length': contextText.length,
          'ai.model': 'openai/gpt/4o',
          'operation.type': 'ai-context-generation',
          'operation.category': 'block-processing'
        })

        const prompt = await getPrompt('context-prompt', {
          blockId,
          contextText
        })

        // Set input for this observation
        updateActiveObservation({
          input: {
            blockId,
            contextText,
            prompt
          }
        })

        const apologist = createOpenAICompatible({
          name: 'apologist',
          apiKey: process.env.APOLOGIST_API_KEY,
          baseURL: `${process.env.APOLOGIST_API_URL}`
        })

        const { text } = await generateText({
          model: apologist('openai/gpt/4o'),
          prompt: prompt
        })

        // Remove markdown code block formatting if present
        const result = text.replace(/^```json\s*/, '').replace(/\s*```$/, '')

        const duration = Date.now() - startTime

        span.setAttributes({
          'ai.response_length': result.length,
          'ai.success': true
        })

        // Set output for this observation
        updateActiveObservation({
          output: {
            blockId,
            result,
            duration,
            success: true
          }
        })

        return result
      } catch (error) {
        const duration = Date.now() - startTime

        span.setAttributes({
          'ai.success': false,
          'ai.error': error instanceof Error ? error.message : 'Unknown error'
        })

        // Set output for failed observation
        updateActiveObservation({
          output: {
            blockId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration,
            success: false
          }
        })

        throw error
      } finally {
        span.end()
      }
    }
  )
}

/**
 * Creates a fallback block context when AI processing fails.
 *
 * Returns a partial object with:
 * - blockId: Preserved from original request
 * - contextText: Preserved from original request
 * - language: Defaults to "english"
 * - suggestions: Empty array (no AI-generated suggestions available)
 *
 * This ensures the API always returns usable data even when individual
 * blocks fail to process, providing graceful degradation.
 */
function createFallbackBlockContext(
  blockId: string,
  contextText: string
): {
  blockId: string
  contextText: string
  language: string
  suggestions: string[]
} {
  return {
    blockId,
    contextText,
    language: 'english',
    suggestions: []
  }
}

/**
 * Processes a successful AI response by parsing the JSON result.
 * Falls back to default values if JSON parsing fails.
 */
function processSuccessfulResult(
  result: string,
  blockId: string,
  contextText: string
): {
  blockId: string
  contextText: string
  language: string
  suggestions: string[]
} {
  try {
    return JSON.parse(result)
  } catch (parseError) {
    console.error(`Failed to parse result for block ${blockId}:`, parseError)
    return createFallbackBlockContext(blockId, contextText)
  }
}

/**
 * Processes a failed AI response by creating fallback data.
 */
function processFailedResult(
  reason: unknown,
  blockId: string,
  contextText: string
): {
  blockId: string
  contextText: string
  language: string
  suggestions: string[]
} {
  console.error(`Failed to process block ${blockId}:`, reason)
  return createFallbackBlockContext(blockId, contextText)
}

const handler = async (req: NextRequest) => {
  const tracer = trace.getTracer('journey-context-api')

  return tracer.startActiveSpan('parallel-context-processing', async (span) => {
    try {
      // Process each blockContext in parallel
      const { blockContexts } = await req.json()

      // Set trace name and input
      updateActiveTrace({
        name: 'ai-context-generation',
        input: {
          blockContexts: blockContexts.map((bc) => ({
            blockId: bc.blockId,
            contextText: bc.contextText,
            contextLength: bc.contextText.length
          }))
        }
      })

      span.setAttributes({
        'request.block_count': blockContexts.length,
        'request.total_context_length': blockContexts.reduce(
          (sum, bc) => sum + bc.contextText.length,
          0
        ),
        'operation.type': 'parallel-context-processing',
        'operation.category': 'orchestration'
      })

      const startTime = Date.now()

      // Filter out block contexts with empty contextText
      const validBlockContexts = blockContexts.filter(
        (bc) => bc.contextText.trim() !== ''
      )
      const emptyContextBlocks = blockContexts.filter(
        (bc) => bc.contextText.trim() === ''
      )

      const promises = validBlockContexts.map((bc) =>
        fetchBlockContext(bc.blockId, bc.contextText)
      )
      const settledResults = await Promise.allSettled(promises)
      const processingTime = Date.now() - startTime

      span.setAttributes({
        'processing.duration_ms': processingTime,
        'processing.parallel_operations': validBlockContexts.length,
        'processing.skipped_empty_contexts': emptyContextBlocks.length
      })

      // Process results with graceful fallback handling
      const processedResults = settledResults.map((result, index) => {
        const { blockId, contextText } = validBlockContexts[index]

        return result.status === 'fulfilled'
          ? processSuccessfulResult(result.value, blockId, contextText)
          : processFailedResult(result.reason, blockId, contextText)
      })

      // Combine results in the original order
      const results = blockContexts.map((bc) => {
        if (bc.contextText.trim() === '') {
          // Return fallback for empty context blocks
          return createFallbackBlockContext(bc.blockId, bc.contextText)
        } else {
          // Find the corresponding processed result
          const validIndex = validBlockContexts.findIndex(
            (validBc) => validBc.blockId === bc.blockId
          )
          return processedResults[validIndex]
        }
      })

      const successCount = results.filter(
        (r) => r.suggestions.length > 0
      ).length
      const fallbackCount = results.length - successCount

      span.setAttributes({
        'response.success_count': successCount,
        'response.fallback_count': fallbackCount,
        'response.total_results': results.length
      })

      // Set trace output
      updateActiveTrace({
        output: {
          blockContexts: results,
          summary: {
            totalBlocks: results.length,
            successCount,
            fallbackCount,
            processingTimeMs: processingTime
          }
        }
      })

      // Important in serverless environments: schedule flush after request is finished
      after(async () => await langfuseSpanProcessor.forceFlush())

      return NextResponse.json({
        blockContexts: results
      })
    } catch (error) {
      span.setAttributes({
        'error.occurred': true,
        'error.message':
          error instanceof Error ? error.message : 'Unknown error'
      })
      console.error('Error analyzing blocks:', error)
      return NextResponse.json(
        { error: 'Failed to analyze blocks' },
        { status: 500 }
      )
    } finally {
      span.end()
    }
  })
}

export const POST = observe(handler, {
  name: 'ai-context-generation',
  endOnExit: false
})
