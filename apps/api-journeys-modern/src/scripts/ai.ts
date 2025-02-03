import { createInterface } from 'node:readline/promises'

import { openai } from '@ai-sdk/openai'
import { CoreMessage, streamText } from 'ai'
import dotenv from 'dotenv'

const terminal = createInterface({
  input: process.stdin,
  output: process.stdout
})

dotenv.config()

const messages: CoreMessage[] = []

async function ai() {
  while (true) {
    const userInput = await terminal.question('You: ')

    messages.push({ role: 'user', content: userInput })

    const result = streamText({
      model: openai('gpt-4o'),
      messages
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
