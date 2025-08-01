import type { AudioPreviewInput } from '../types'

import { getGraphQLClient } from './gql/graphqlClient'
import { CREATE_AUDIO_PREVIEW, UPDATE_AUDIO_PREVIEW } from './gql/mutations'
import { GET_AUDIO_PREVIEW } from './gql/queries'

export async function importOrUpdateAudioPreview({
  languageId,
  publicUrl,
  duration,
  size,
  bitrate,
  codec
}: {
  languageId: string
  publicUrl: string
  duration: number
  size: number
  bitrate: number
  codec: string
}): Promise<'created' | 'updated' | 'failed'> {
  const client = await getGraphQLClient()
  let existingPreview: AudioPreviewInput | undefined
  try {
    const data: { language?: { audioPreview?: AudioPreviewInput } } =
      await client.request(GET_AUDIO_PREVIEW, { languageId })
    existingPreview = data.language?.audioPreview ?? undefined
  } catch (error) {
    console.error(
      '[AudioPreview] Failed to fetch existing audio preview:',
      error
    )
    return 'failed'
  }

  const input: AudioPreviewInput = {
    languageId,
    value: publicUrl,
    duration,
    size,
    bitrate,
    codec
  }

  if (existingPreview != null) {
    try {
      await client.request(UPDATE_AUDIO_PREVIEW, { input })
      console.log('[AudioPreview] Updated audio preview')
      return 'updated'
    } catch (error) {
      console.error('[AudioPreview] Failed to update audio preview:', error)
      return 'failed'
    }
  }

  try {
    await client.request(CREATE_AUDIO_PREVIEW, { input })
    console.log('[AudioPreview] Created audio preview')
    return 'created'
  } catch (error) {
    console.error('[AudioPreview] Failed to create audio preview:', error)
    return 'failed'
  }
}
