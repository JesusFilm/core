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

export async function ai(prompt?: string, system?: string): Promise<string> {
  const userInput = prompt == null ? await terminal.question('You: ') : prompt

  messages.push({ role: 'user', content: userInput })
  const systemPrompt =
    'You help people build journeys.' +
    'For language use 529.' +
    'Make sure all ids are UUIDs.' +
    'Give each card a background image. This must relate to the content of the card.' +
    'the images must not repeat more than twice' +
    'Get background images from unsplash.com.' +
    'Make sure the number of CardBlocks is equal to the number of StepBlocks.' +
    'Make sure the CardBlocks are children of StepBlocks.' +
    'Make sure that there is one child per StepBlock' +
    'You can add other blocks into the CardBlock, please makre sure there is at least 3-6 blocks that are children of the CardBlock.' +
    'Can you please make sure the content of the blocks that are children of the CardBlock are relevant to the journey the user wants to create'

  const result = streamObject({
    system: systemPrompt + system,
    model: openai('gpt-4o'),
    messages,
    output: 'object',
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
  return JSON.stringify(fullResponse)
}

ai().catch((e) => console.error(e))
