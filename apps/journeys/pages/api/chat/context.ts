import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'

const apologist = createOpenAICompatible({
  name: 'apologist',
  baseURL: process.env.APOLOGIST_API_URL ?? '',
  apiKey: process.env.APOLOGIST_API_KEY ?? ''
})

interface BlockContext {
  blockId: string
  contextText: string
}

interface ContextRequestBody {
  blocks: BlockContext[]
  language?: string
}

interface ContextResponseItem {
  blockId: string
  originalText: string
  enrichedContext: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }

  const { blocks, language } = req.body as ContextRequestBody

  if (!blocks || blocks.length === 0) {
    res.status(400).json({ error: 'blocks are required' })
    return
  }

  const results: ContextResponseItem[] = []

  for (const block of blocks) {
    if (block.contextText.trim().length === 0) continue

    try {
      const { text } = await generateText({
        model: apologist.chatModel('openai/gpt/4o-mini'),
        prompt: buildContextPrompt(block.contextText, language)
      })

      results.push({
        blockId: block.blockId,
        originalText: block.contextText,
        enrichedContext: text
      })
    } catch {
      results.push({
        blockId: block.blockId,
        originalText: block.contextText,
        enrichedContext: block.contextText
      })
    }
  }

  res.status(200).json({ contexts: results })
}

function buildContextPrompt(text: string, language?: string): string {
  const langInstruction =
    language != null && language.length > 0
      ? ` Respond in ${language}.`
      : ''

  return [
    'Analyze the following content and provide a brief contextual summary',
    'that would help a Christian apologist understand the key themes,',
    'questions, and spiritual topics present.',
    'Focus on identifying discussion points and potential questions a viewer might have.',
    `Keep the summary concise (2-3 sentences).${langInstruction}`,
    '',
    `Content: ${text}`
  ].join(' ')
}
