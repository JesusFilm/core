import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  observe,
  updateActiveObservation,
  updateActiveTrace
} from '@langfuse/tracing'
import { generateText } from 'ai'
import { NextRequest, NextResponse, after } from 'next/server'

import { flush } from '../../../../instrumentation'
import { getPrompt } from '../../../../src/lib/ai/langfuse/promptHelper'

const traceName = "ai-context-generation"

export type BlockContextInput = {
  blockId: string
  contextText: string
}

// Wrap individual block context generation with Langfuse observation for granular tracing
const fetchBlockContext = observe(
  async (blockId: string, contextText: string): Promise<string> => {
    const startTime = Date.now()

    try {
      // Set input metadata for this specific block operation
      updateActiveObservation({
        input: {
          blockId,
          contextLength: contextText.length
        },
        metadata: {
          blockId,
          model: 'openai/gpt/4o'
        }
      })

      const prompt = await getPrompt('context-prompt', {
        blockId,
        contextText
      })

      const apologist = createOpenAICompatible({
        name: 'apologist',
        apiKey: process.env.APOLOGIST_API_KEY,
        baseURL: `${process.env.APOLOGIST_API_URL}`
      })

      const { text, usage } = await generateText({
        model: apologist('openai/gpt/4o'),
        prompt: prompt,
        experimental_telemetry: {
          isEnabled: true,
          metadata: {
            blockId,
            contextLength: contextText.length
          }
        }
      })

      // Remove markdown code block formatting if present
      const result = text.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      const duration = Date.now() - startTime

      // Set output metadata with timing and usage
      updateActiveObservation({
        output: {
          blockId,
          resultLength: result.length,
          success: true
        },
        metadata: {
          durationMs: duration,
          ...(usage && { usage })
        }
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // Set error output
      updateActiveObservation({
        output: {
          blockId,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        },
        metadata: {
          durationMs: duration
        }
      })

      console.error(`Failed to generate context for block ${blockId}:`, error)
      throw error
    }
  },
  {
    name: 'generate-block-context',
    captureInput: false, // We manually set input via updateActiveObservation
    captureOutput: false // We manually set output via updateActiveObservation
  }
)

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
  const startTime = Date.now()

  try {
    // Process each blockContext in parallel
    const { blockContexts } = await req.json()

    // Set trace input for Langfuse (name comes from observe() wrapper)
    updateActiveTrace({
      name: traceName,
      input: {
        totalBlocks: blockContexts.length,
        blockContexts: blockContexts.map((bc) => ({
          blockId: bc.blockId,
          contextLength: bc.contextText.length
        }))
      },
      metadata: {
        operationType: 'parallel-batch-processing',
        batchSize: blockContexts.length
      }
    })

    // Filter out block contexts with empty contextText
    const validBlockContexts = blockContexts.filter(
      (bc) => bc.contextText.trim() !== ''
    )

    // Each fetchBlockContext call is wrapped in observe() and will appear as a child span
    const promises = validBlockContexts.map((bc) =>
      fetchBlockContext(bc.blockId, bc.contextText)
    )
    const settledResults = await Promise.allSettled(promises)
    const processingTime = Date.now() - startTime

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

    const successCount = results.filter((r) => r.suggestions.length > 0).length
    const fallbackCount = results.length - successCount

    // Set trace output for Langfuse with detailed metrics
    updateActiveTrace({
      name: traceName,
      output: {
        summary: {
          totalBlocks: results.length,
          successCount,
          fallbackCount,
          processingTimeMs: processingTime
        }
      },
      metadata: {
        performance: {
          totalDurationMs: processingTime,
          parallelOperations: validBlockContexts.length,
          skippedEmptyContexts: blockContexts.length - validBlockContexts.length
        }
      }
    })

    // Important in serverless environments: schedule flush after request is finished
    after(async () => await flush())

    return NextResponse.json({
      blockContexts: results
    })
  } catch (error) {
    const duration = Date.now() - startTime

    updateActiveTrace({
      name: traceName,
      output: {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        durationMs: duration,
        failed: true
      }
    })

    console.error('Error analyzing blocks:', error)
    return NextResponse.json(
      { error: 'Failed to analyze blocks' },
      { status: 500 }
    )
  }
}

export const POST = observe(handler, {
  name: traceName,
  endOnExit: false
})
