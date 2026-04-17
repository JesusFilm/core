import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'

const APOLOGIST_BASE_URL = process.env.APOLOGIST_API_URL ?? ''
const APOLOGIST_MODEL_ID = 'openai/gpt/4o-mini'

const apologist = createOpenAICompatible({
  name: 'apologist',
  baseURL: APOLOGIST_BASE_URL,
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
  console.log('[apologist:server] handler=chat/context method=', req.method)

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }

  const { blocks, language } = req.body as ContextRequestBody

  console.log(
    '[apologist:server] chat/context payload blockCount=',
    blocks?.length ?? 0,
    'language=',
    language
  )

  if (!blocks || blocks.length === 0) {
    res.status(400).json({ error: 'blocks are required' })
    return
  }

  console.log(
    '[apologist:server] chat/context model modelId=',
    APOLOGIST_MODEL_ID,
    'baseURL=',
    APOLOGIST_BASE_URL
  )

  const results: ContextResponseItem[] = []

  for (const block of blocks) {
    if (block.contextText.trim().length === 0) continue

    try {
      const { text, finishReason, usage } = await generateText({
        model: apologist.chatModel(APOLOGIST_MODEL_ID),
        prompt: buildContextPrompt(block.contextText, language)
      })

      console.log(
        '[apologist:server] chat/context block complete blockId=',
        block.blockId,
        'finishReason=',
        finishReason,
        'usage=',
        JSON.stringify(usage),
        'text.length=',
        text?.length ?? 0
      )

      results.push({
        blockId: block.blockId,
        originalText: block.contextText,
        enrichedContext: text
      })
    } catch (error) {
      const err = error as Error
      console.error(
        '[apologist:server] chat/context block error blockId=',
        block.blockId,
        'message=',
        err?.message,
        'stack=',
        err?.stack,
        'raw=',
        error
      )
      results.push({
        blockId: block.blockId,
        originalText: block.contextText,
        enrichedContext: block.contextText
      })
    }
  }

  console.log(
    '[apologist:server] chat/context response protocol=JSON (res.status(200).json)',
    'resultCount=',
    results.length
  )
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
