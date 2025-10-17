import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

type GenerateImageSuccessResponse = {
  images: string[]
}

type GenerateImageErrorResponse = {
  error: string
}

const DEFAULT_MODEL = 'gpt-image-1'
const DEFAULT_SIZE = '1024x1024'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateImageSuccessResponse | GenerateImageErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' })
    return
  }

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : ''
  const size = typeof req.body?.size === 'string' ? req.body.size : DEFAULT_SIZE

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required to generate an image.' })
    return
  }

  try {
    const response = await client.images.generate({
      model: DEFAULT_MODEL,
      prompt,
      size
    })

    const images = (response.data ?? [])
      .map((item) => {
        if (typeof item?.b64_json === 'string' && item.b64_json.length > 0) {
          return `data:image/png;base64,${item.b64_json}`
        }

        if (typeof item?.url === 'string' && item.url.length > 0) {
          return item.url
        }

        return null
      })
      .filter((value): value is string => typeof value === 'string' && value.length > 0)

    if (images.length === 0) {
      res.status(502).json({ error: 'Image generation returned no results.' })
      return
    }

    res.status(200).json({ images })
  } catch (error) {
    console.error('OpenAI image generation error:', error)
    res.status(500).json({ error: 'Failed to generate image.' })
  }
}
