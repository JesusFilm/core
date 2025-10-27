import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import type { ImageAnalysisResult } from '../libs/storage'

interface UseImageAnalysisOptions {
  setImageAnalysisResults: Dispatch<SetStateAction<ImageAnalysisResult[]>>
  extractTextFromResponse: (data: any) => string
  accumulateUsage: (usage: any) => void
  prompt: string
}

export const useImageAnalysis = ({
  setImageAnalysisResults,
  extractTextFromResponse,
  accumulateUsage,
  prompt
}: UseImageAnalysisOptions) => {
  const analyzeImageWithAI = useCallback(
    async (imageSrc: string, imageIndex: number) => {
      setImageAnalysisResults((prev) => {
        const updated = [...prev]
        if (!updated[imageIndex]) {
          updated[imageIndex] = {
            imageSrc,
            contentType: '',
            extractedText: '',
            detailedDescription: '',
            confidence: '',
            contentIdeas: [],
            isAnalyzing: true
          }
        } else {
          updated[imageIndex] = {
            ...updated[imageIndex],
            isAnalyzing: true
          }
        }
        return updated
      })

      try {
        const response = await fetch('/api/ai/respond', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // model: 'openai/gpt-4o-mini',
            messages: [
              { role: 'system', content: prompt },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Analyze this image:' },
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageSrc,
                      detail: 'high'
                    }
                  }
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.1
          })
        })

        if (!response.ok) {
          const errorMessage = await response.text()
          throw new Error(errorMessage || 'Failed to analyze image')
        }

        const data = await response.json()
        let analysisText = extractTextFromResponse(data) || '{}'
        accumulateUsage(data.usage)

        if (analysisText.includes('```json') || analysisText.includes('```')) {
          const jsonMatch = analysisText.match(/```\s*(?:json)?\s*([\s\S]*?)\s*```/)
          if (jsonMatch && jsonMatch[1]) {
            analysisText = jsonMatch[1].trim()
          }
        }

        let analysisResult: Partial<ImageAnalysisResult>
        try {
          const parsed = JSON.parse(analysisText)
          analysisResult = {
            imageSrc,
            contentType: parsed.contentType || 'other',
            extractedText: parsed.extractedText || '',
            detailedDescription: parsed.detailedDescription || '',
            confidence: parsed.confidence || 'low',
            contentIdeas: Array.isArray(parsed.contentIdeas) ? parsed.contentIdeas : []
          }
        } catch (parseError) {
          console.error('Failed to parse analysis response:', parseError)
          console.error('Raw response:', analysisText)
          analysisResult = {
            imageSrc,
            contentType: 'other',
            extractedText: '',
            detailedDescription: 'Failed to analyze image',
            confidence: 'low',
            contentIdeas: []
          }
        }

        setImageAnalysisResults((prev) => {
          const updated = [...prev]
          updated[imageIndex] = {
            ...(analysisResult as ImageAnalysisResult),
            isAnalyzing: false
          }
          return updated
        })
      } catch (error) {
        console.error('Error analyzing image:', error)
        setImageAnalysisResults((prev) => {
          const updated = [...prev]
          updated[imageIndex] = {
            imageSrc,
            contentType: 'error',
            extractedText: '',
            detailedDescription: 'Failed to analyze image. Please try again.',
            confidence: 'low',
            contentIdeas: [],
            isAnalyzing: false
          }
          return updated
        })
      }
    },
    [accumulateUsage, extractTextFromResponse, prompt, setImageAnalysisResults]
  )

  return { analyzeImageWithAI }
}

export type UseImageAnalysisReturn = ReturnType<typeof useImageAnalysis>
