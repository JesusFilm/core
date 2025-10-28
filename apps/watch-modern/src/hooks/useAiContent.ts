import { useCallback } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { GeneratedStepContent, ImageAnalysisResult } from '../libs/storage'

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
  updateTokens: (
    sessionId: string | null,
    usage: { input: number; output: number }
  ) => void
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
          const errorMessage = await response.text()
          throw new Error(errorMessage || 'Failed to process content')
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
        const networkError = isNetworkError(error)

        if (networkError) {
          console.warn(
            'Network error while processing content. Ready for retry.',
            error
          )
        } else {
          console.error('Error processing content:', error)
        }

        setAiResponse(previousResponse)
        setEditableSteps(previousSteps)
        if (!networkError) {
          console.error(
            'Failed to process content via the AI proxy. Please try again.'
          )
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
