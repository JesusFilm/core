import { useCallback } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type {
  GeneratedStepContent,
  ImageAnalysisResult
} from '../libs/storage'

import type { SaveSessionArgs } from './useNewPageSession'

type HttpError = Error & {
  status?: number
  details?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === 'object'

const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const collectErrorMessages = (
  value: unknown,
  messages: string[] = [],
  visited = new Set<unknown>()
): string[] => {
  if (value == null) {
    return messages
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length === 0) return messages

    const nestedJson = tryParseJson(trimmed)
    if (nestedJson != null) {
      return collectErrorMessages(nestedJson, messages, visited)
    }

    if (!messages.includes(trimmed)) {
      messages.push(trimmed)
    }

    return messages
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    const stringified = String(value)
    if (!messages.includes(stringified)) {
      messages.push(stringified)
    }
    return messages
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectErrorMessages(item, messages, visited)
    }
    return messages
  }

  if (!isRecord(value) || visited.has(value)) {
    return messages
  }

  visited.add(value)

  const prioritizedKeys = ['detail', 'details', 'message', 'error', 'description']

  for (const key of prioritizedKeys) {
    if (key in value) {
      collectErrorMessages(value[key], messages, visited)
    }
  }

  for (const [key, fieldValue] of Object.entries(value)) {
    if (prioritizedKeys.includes(key)) continue
    collectErrorMessages(fieldValue, messages, visited)
  }

  return messages
}

const selectMeaningfulMessage = (messages: string[]): string | null => {
  if (messages.length === 0) return null

  const genericPatterns = [
    /^unexpected error/i,
    /^openrouter request failed/i,
    /^apologist request failed/i,
    /^invalid payload$/i,
    /^error$/i
  ]

  for (const message of messages) {
    if (genericPatterns.some((pattern) => pattern.test(message))) {
      continue
    }

    return message
  }

  return messages[0] ?? null
}

const parseErrorResponse = (rawBody: string, status: number): HttpError => {
  const trimmedBody = rawBody?.trim?.() ?? ''
  let parsedBody: unknown = null

  if (trimmedBody.length > 0) {
    parsedBody = tryParseJson(trimmedBody)

    if (parsedBody == null) {
      const jsonStart = trimmedBody.indexOf('{')
      if (jsonStart !== -1) {
        const potentialJson = trimmedBody.slice(jsonStart)
        parsedBody = tryParseJson(potentialJson)
      }
    }
  }

  const errorDetails = parsedBody ?? trimmedBody
  const collectedMessages = collectErrorMessages(errorDetails)
  const primaryMessage =
    selectMeaningfulMessage(collectedMessages) ||
    (status ? `Request failed with status ${status}` : 'Failed to process content')

  const error: HttpError = new Error(primaryMessage)
  if (status) {
    error.status = status
  }
  error.details = errorDetails

  return error
}

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

      const handleFailure = (error: unknown) => {
        const networkError = isNetworkError(error)

        if (networkError) {
          console.warn(
            'Network error while processing content. Ready for retry.',
            error
          )
        } else {
          console.error('Error processing content:', error)

          if (isRecord(error) && 'status' in error && typeof error.status === 'number') {
            const httpError = error as HttpError
            const details = httpError.details

            if (details !== undefined) {
              console.error(
                `AI proxy request failed with status ${httpError.status}. Details:`,
                details
              )
            }
          }
        }

        setAiResponse(previousResponse)
        setEditableSteps(previousSteps)

        if (!networkError) {
          console.error(
            'Failed to process content via the AI proxy. Please try again.'
          )
        }

        onError?.(error, { isNetworkError: networkError })
      }

      try {
        const messages = buildConversationHistory()
        const currentUserMessage = currentValue.trim()
        messages.push({
          role: 'user',
          content: currentUserMessage
        })

        const response = await fetch('/studio/api/ai/respond', {
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
          const errorText = await response.text()
          const error = parseErrorResponse(errorText, response.status)
          handleFailure(error)
          return
        }

        const data = await response.json()
        const processedContent =
          extractTextFromResponse(data) || 'No response generated'
        setAiResponse(processedContent)
        const parsedSteps = parseGeneratedSteps(processedContent)
        setEditableSteps(parsedSteps)

        const tokenUsage = data.usage
          ? {
              input: data.usage.input_tokens ?? 0,
              output: data.usage.output_tokens ?? 0
            }
          : { input: 0, output: 0 }

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
        handleFailure(error)
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
