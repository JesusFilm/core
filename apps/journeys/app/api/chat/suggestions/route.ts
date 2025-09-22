import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

import { getPrompt } from '../../../../src/lib/ai/langfuse/promptHelper'

export async function POST(req: NextRequest) {
  const apologist = createOpenAICompatible({
    name: 'apologist',
    apiKey: process.env.APOLOGIST_API_KEY,
    baseURL: `${process.env.APOLOGIST_API_URL}`
  })

  try {
    const { contextText, language } = await req.json()

    if (!contextText || typeof contextText !== 'string') {
      return NextResponse.json(
        { error: 'contextText is required and must be a string' },
        { status: 400 }
      )
    }

    const prompt = await getPrompt('Suggestions-Prompt', {
      contextText: contextText,
      language: language || 'english'
    })

    const { text } = await generateText({
      model: apologist('openai/gpt/4o'),
      prompt: prompt
    })

    // Parse the response to extract suggestions
    const suggestionsText = text.trim()
    const suggestions = suggestionsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('Suggestions:'))

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
