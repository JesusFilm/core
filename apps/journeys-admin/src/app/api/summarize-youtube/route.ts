import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!
})

export async function POST(req: Request) {
  const { youtubeUrl } = await req.json()

  const { text } = await generateText({
    model: gemini('models/gemini-1.5-pro-latest'),
    system: 'You are a helpful assistant that summarizes YouTube videos.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'file_data',
            fileData: {
              mimeType: 'video/*',
              fileUri: youtubeUrl
            }
          },
          {
            type: 'text',
            text: 'Please give me the full transcript with timestamps.'
          }
        ]
      }
    ]
  })

  return NextResponse.json({ result: text })
}
