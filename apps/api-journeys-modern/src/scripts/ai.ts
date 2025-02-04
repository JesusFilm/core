import { createInterface } from 'node:readline/promises'

import { createOpenAI } from '@ai-sdk/openai'
import { CoreMessage, streamObject } from 'ai'

import { JourneySchema } from '../schema/journey/journey.zod'

const terminal = createInterface({
  input: process.stdin,
  output: process.stdout
})

const messages: CoreMessage[] = []

const openai = createOpenAI({
  compatibility: 'strict', // strict mode, enable when using the OpenAI API,
  apiKey: process.env.OPEN_AI_API_KEY
})

export async function ai(prompt?: string): Promise<string> {
  while (true) {
    const userInput = prompt == null ? await terminal.question('You: ') : prompt

    if (!userInput.trim()) {
      console.log('\nPlease enter a valid message.')
      continue
    }

    messages.push({ role: 'user', content: userInput })

    const result = streamObject({
      system:
        'You help people build journeys.' +
        'For language use 529.' +
        'Make sure all ids are UUIDs.' +
        'Give each card a background image.' +
        'Get background images from unsplash.com.',
      model: openai('gpt-4o'),
      messages,
      schema: JourneySchema
    })

    let fullResponse = ''
    process.stdout.write('\nAssistant: ')
    for await (const delta of result.textStream) {
      fullResponse += delta
      process.stdout.write(delta)
    }
    process.stdout.write('\n\n')

    messages.push({ role: 'assistant', content: fullResponse })
    return fullResponse
  }
}

ai().catch((e) => console.error(e))
