import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

import {
  langfuseClient,
  langfuseEnvironment
} from '../../../../src/lib/ai/langfuse/server'
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

    const prompt = await langfuseClient.prompt.get('Suggestion-Prompt', {
      label: langfuseEnvironment
    })

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: prompt.compile({ contextText: contextText })
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
