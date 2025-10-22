import {
  BASE_SYSTEM_PROMPT,
  OUTPUT_FORMAT_INSTRUCTIONS,
  REFINEMENT_INSTRUCTIONS,
  RESPONSE_GUIDELINES,
  contextSystemPrompts
} from '../../config/new-page'
import type { ImageAnalysisResult } from '../../libs/storage'

export type ConversationHistoryItem = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type ConversationParams = {
  selectedContext: string
  imageAnalysisResults: ImageAnalysisResult[]
  textContent: string
  aiResponse: string
}

export const buildConversationHistory = ({
  selectedContext,
  imageAnalysisResults,
  textContent,
  aiResponse
}: ConversationParams): ConversationHistoryItem[] => {
  const messages: ConversationHistoryItem[] = []

  const contextPrompt =
    contextSystemPrompts[selectedContext] ?? contextSystemPrompts.default

  let systemPrompt = [
    BASE_SYSTEM_PROMPT,
    REFINEMENT_INSTRUCTIONS,
    `Context focus:\n${contextPrompt}`,
    OUTPUT_FORMAT_INSTRUCTIONS,
    RESPONSE_GUIDELINES
  ].join('\n\n')

  if (imageAnalysisResults.length > 0) {
    let imageContext = '\n\nCurrent session includes analyzed images:\n'
    imageAnalysisResults.forEach((analysis, imgIndex) => {
      imageContext += `\nImage ${imgIndex + 1} (${analysis.contentType}):\n`
      if (analysis.extractedText) {
        imageContext += `  Text: ${analysis.extractedText}\n`
      }
      if (analysis.contentIdeas && analysis.contentIdeas.length > 0) {
        imageContext += `  Content Ideas: ${analysis.contentIdeas.join(', ')}\n`
      }
      if (analysis.detailedDescription) {
        imageContext += `  Description: ${analysis.detailedDescription}\n`
      }
    })
    systemPrompt += imageContext
  }

  messages.push({ role: 'system', content: systemPrompt })

  if (textContent && aiResponse) {
    messages.push({ role: 'user', content: textContent })
    messages.push({ role: 'assistant', content: aiResponse })
  }

  return messages
}
