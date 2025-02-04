import { createInterface } from 'node:readline/promises'

import { createOpenAI } from '@ai-sdk/openai'
import { CoreMessage, streamObject, streamText, tool } from 'ai'

import { IconBlockSchema } from '../schema/blocks/icon/icon.zod'

const terminal = createInterface({
  input: process.stdin,
  output: process.stdout
})

const messages: CoreMessage[] = []

const openai = createOpenAI({
  compatibility: 'strict', // strict mode, enable when using the OpenAI API,
  apiKey: process.env.OPEN_AI_API_KEY
})

async function ai() {
  while (true) {
    const userInput = await terminal.question('You: ')

    messages.push({ role: 'user', content: userInput })

    const result = streamObject({
      model: openai('gpt-4o'),
      messages,
      schema: IconBlockSchema
    })

    let fullResponse = ''
    process.stdout.write('\nAssistant: ')
    for await (const delta of result.textStream) {
      fullResponse += delta
      process.stdout.write(delta)
    }
    process.stdout.write('\n\n')

    messages.push({ role: 'assistant', content: fullResponse })
  }
}

ai().catch((e) => console.error(e))
