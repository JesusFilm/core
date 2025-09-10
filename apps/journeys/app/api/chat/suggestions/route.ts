import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

import { getPrompt } from '../../../../src/lib/ai/langfuse/promptHelper'
import { SuggestionsRequest } from '../../../../src/types/suggestions'

export async function POST(req: NextRequest) {
  try {
    const { contextText }: SuggestionsRequest = await req.json()

    if (!contextText || typeof contextText !== 'string') {
      return NextResponse.json(
        { error: 'contextText is required and must be a string' },
        { status: 400 }
      )
    }

    const prompt = await getPrompt('Suggestions-Prompt', {
      contextText: contextText
    })

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
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
