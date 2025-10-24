import { useCallback } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type {
  GeneratedStepContent,
  ImageAnalysisResult
} from '../libs/storage'

import type { SaveSessionArgs } from './useNewPageSession'

const isNetworkError = (error: unknown): boolean => {
  if (error instanceof TypeError) {
    const message = error.message?.toLowerCase?.() ?? ''
    return (
      message.includes('networkerror') ||
      message.includes('failed to fetch') ||
      message.includes('load failed')
    )
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: string }).message === 'string'
  ) {
    const message = (error as { message: string }).message.toLowerCase()
    return (
      message.includes('networkerror') ||
      message.includes('failed to fetch') ||
      message.includes('load failed')
    )
  }

  return false
}

type ConversationMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type UseAiContentOptions = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  aiResponse: string
  editableSteps: GeneratedStepContent[]
  imageAttachments: string[]
  imageAnalysisResults: ImageAnalysisResult[]
  buildConversationHistory: () => ConversationMessage[]
  extractTextFromResponse: (data: any) => string
  parseGeneratedSteps: (content: string) => GeneratedStepContent[]
  setAiResponse: Dispatch<SetStateAction<string>>
  setEditableSteps: Dispatch<SetStateAction<GeneratedStepContent[]>>
  setIsProcessing: Dispatch<SetStateAction<boolean>>
  saveSession: (data: SaveSessionArgs) => string
  updateTokens: (sessionId: string | null, usage: { input: number; output: number }) => void
  onError?: (error: unknown, context: { isNetworkError: boolean }) => void
}

export const useAiContent = ({
  textareaRef,
  aiResponse,
  editableSteps,
  imageAttachments,
  imageAnalysisResults,
  buildConversationHistory,
  extractTextFromResponse,
  parseGeneratedSteps,
  setAiResponse,
  setEditableSteps,
  setIsProcessing,
  saveSession,
  updateTokens,
  onError
}: UseAiContentOptions) => {
  const processContentWithAI = useCallback(
    async (inputText?: string) => {
      const currentValue = inputText || textareaRef.current?.value || ''
      if (!currentValue.trim()) {
        console.warn('Please enter some content to process.')
        return
      }

      setIsProcessing(true)
      const previousResponse = aiResponse
      const previousSteps = editableSteps
      setAiResponse('')

      try {
        const messages = buildConversationHistory()
        const currentUserMessage = currentValue.trim()
        messages.push({
          role: 'user',
          content: currentUserMessage
        })

        const response = await fetch('/api/ai/respond', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // model: 'gpt-5-nano',
            messages
          })
        })

        if (!response.ok) {
          const errorMessage = await response.text()
          throw new Error(errorMessage || 'Failed to process content')
        }

        const isStreamingResponse =
          response.headers.get('x-vercel-ai-data-stream') === 'v1'

        let processedContent: string = ''
        let tokenUsage = { input: 0, output: 0 }

        if (isStreamingResponse && response.body != null) {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let aggregatedResponse = ''

          const updateUsageFromPayload = (usage: unknown) => {
            if (
              usage != null &&
              typeof usage === 'object' &&
              'promptTokens' in usage &&
              'completionTokens' in usage
            ) {
              const promptTokens = Number(
                (usage as { promptTokens: unknown }).promptTokens
              )
              const completionTokens = Number(
                (usage as { completionTokens: unknown }).completionTokens
              )

              tokenUsage = {
                input: Number.isFinite(promptTokens) ? promptTokens : 0,
                output: Number.isFinite(completionTokens)
                  ? completionTokens
                  : 0
              }
            }
          }

          const processLine = (rawLine: string) => {
            const line = rawLine.trim()
            if (line === '') return

            const separatorIndex = line.indexOf(':')
            if (separatorIndex === -1) return

            const code = line.slice(0, separatorIndex)
            const payloadText = line.slice(separatorIndex + 1)

            let payload: unknown
            try {
              payload = JSON.parse(payloadText)
            } catch (error) {
              console.warn('Failed to parse streaming payload chunk', {
                line,
                error
              })
              return
            }

            switch (code) {
              case '0': {
                if (typeof payload === 'string') {
                  aggregatedResponse += payload
                  setAiResponse((previous) => previous + payload)
                }
                break
              }
              case '2': {
                if (Array.isArray(payload)) {
                  payload.forEach((entry) => {
                    if (
                      entry != null &&
                      typeof entry === 'object' &&
                      'type' in entry &&
                      entry.type === 'usage'
                    ) {
                      updateUsageFromPayload(
                        (entry as { usage?: unknown }).usage
                      )
                    }
                  })
                }
                break
              }
              case '3': {
                const message =
                  typeof payload === 'string'
                    ? payload
                    : 'The streaming response returned an error.'
                throw new Error(message)
              }
              case 'd':
              case 'e': {
                if (
                  payload != null &&
                  typeof payload === 'object' &&
                  'usage' in payload
                ) {
                  updateUsageFromPayload(
                    (payload as { usage?: unknown }).usage
                  )
                }
                break
              }
              default:
                break
            }
          }

          const readStream = async () => {
            try {
              while (true) {
                const { value, done } = await reader.read()
                if (value) {
                  buffer += decoder.decode(value, { stream: !done })
                }

                let newlineIndex = buffer.indexOf('\n')
                while (newlineIndex !== -1) {
                  const line = buffer.slice(0, newlineIndex)
                  buffer = buffer.slice(newlineIndex + 1)
                  processLine(line)
                  newlineIndex = buffer.indexOf('\n')
                }

                if (done) {
                  const flushRemainder = decoder.decode()
                  if (flushRemainder) {
                    buffer += flushRemainder
                  }

                  const remaining = buffer.trim()
                  if (remaining) {
                    processLine(remaining)
                  }
                  break
                }
              }
            } catch (streamError) {
              await reader.cancel().catch(() => undefined)
              throw streamError
            }
          }

          await readStream()

          processedContent =
            aggregatedResponse.trim() !== ''
              ? aggregatedResponse
              : 'No response generated'
          setAiResponse(processedContent)
        } else {
          const data = await response.json()
          processedContent =
            extractTextFromResponse(data) || 'No response generated'
          setAiResponse(processedContent)
          tokenUsage = data.usage
            ? {
                input: data.usage.input_tokens ?? 0,
                output: data.usage.output_tokens ?? 0
              }
            : { input: 0, output: 0 }
        }

        const parsedSteps = parseGeneratedSteps(processedContent)
        setEditableSteps(parsedSteps)

        const sessionId = saveSession({
          textContent: currentValue,
          images: imageAttachments,
          aiResponse: processedContent,
          aiSteps: parsedSteps,
          imageAnalysisResults: imageAnalysisResults.map((result) => ({
            imageSrc: result.imageSrc,
            contentType: result.contentType,
            extractedText: result.extractedText,
            detailedDescription: result.detailedDescription,
            confidence: result.confidence,
            contentIdeas: result.contentIdeas
          })),
          tokensUsed: tokenUsage
        })

        updateTokens(sessionId, tokenUsage)
      } catch (error) {
        const networkError = isNetworkError(error)

        if (networkError) {
          console.warn('Network error while processing content. Ready for retry.', error)
        } else {
          console.error('Error processing content:', error)
        }

        setAiResponse(previousResponse)
        setEditableSteps(previousSteps)
        if (!networkError) {
          console.error('Failed to process content via the AI proxy. Please try again.')
        }

        onError?.(error, { isNetworkError: networkError })
      } finally {
        setIsProcessing(false)
      }
    },
    [
      aiResponse,
      buildConversationHistory,
      editableSteps,
      extractTextFromResponse,
      imageAnalysisResults,
      imageAttachments,
      parseGeneratedSteps,
      saveSession,
      setAiResponse,
      setEditableSteps,
      setIsProcessing,
      textareaRef,
      updateTokens,
      onError
    ]
  )

  return { processContentWithAI }
}

export type UseAiContentReturn = ReturnType<typeof useAiContent>
