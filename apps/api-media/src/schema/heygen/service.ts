import axios, { isAxiosError } from 'axios'
import { z } from 'zod'

import { logger } from '../../logger'

const languagesResponseSchema = z.object({
  error: z.nullable(
    z.object({
      code: z.string(),
      message: z.string()
    })
  ),
  data: z.object({
    languages: z.array(z.string())
  })
})

export async function listSupportedLanguages(): Promise<string[]> {
  if (!process.env.HEYGEN_API_KEY) {
    throw new Error('Missing HEYGEN_API_KEY environment variable')
  }

  try {
    const response = await axios.get('/video_translate/target_languages', {
      baseURL: 'https://api.heygen.com/v2',
      headers: {
        'x-api-key': process.env.HEYGEN_API_KEY,
        'content-type': 'application/json'
      }
    })

    const parsed = languagesResponseSchema.safeParse(response.data)
    if (!parsed.success) {
      logger.error({ response: response.data }, 'Invalid HeyGen API response')
      throw new Error('Invalid response from HeyGen API')
    }

    if (parsed.data.error) {
      logger.error({ error: parsed.data.error }, 'HeyGen API returned an error')
      throw new Error(parsed.data.error.message)
    }

    const languages = parsed.data.data.languages

    logger.info({ count: languages.length }, 'Fetched HeyGen languages')
    return languages
  } catch (error) {
    if (isAxiosError(error)) {
      const apiError = error.response?.data?.error
      logger.error(
        {
          status: error.response?.status,
          error: apiError
        },
        'HeyGen API request failed'
      )

      throw new Error(apiError?.message ?? 'HeyGen API request failed')
    }

    logger.error({ error }, 'Unexpected error in HeyGen service')
    throw error
  }
}
