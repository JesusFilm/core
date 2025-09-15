import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_AUDIO_PREVIEW, UPDATE_AUDIO_PREVIEW } from '../gql/mutations'
import { GET_AUDIO_PREVIEW } from '../gql/queries'
import { uploadFileToR2Direct } from '../services/r2'
import { type AudioPreviewInput, type ProcessingSummary } from '../types'
import { getAudioMetadata } from '../utils/fileMetadataHelpers'
import { markFileAsCompleted } from '../utils/fileUtils'

export const AUDIO_PREVIEW_FILENAME_REGEX = /^([^.]+)\.aac$/

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

      return 'updated'
    } catch (error) {
      console.error('[AudioPreview] Failed to update audio preview:', error)
      return 'failed'
    }
  }

  try {
    await client.request(CREATE_AUDIO_PREVIEW, { input })

    return 'created'
  } catch (error) {
    console.error('[AudioPreview] Failed to create audio preview:', error)
    return 'failed'
  }
}

export async function processAudioPreviewFile(
  file: string,
  filePath: string,
  contentLength: number,
  summary: ProcessingSummary
): Promise<void> {
  const match = file.match(AUDIO_PREVIEW_FILENAME_REGEX)
  if (!match) return

  const [, languageId] = match

  console.log(`Processing audio preview: Language=${languageId}`)

  const contentType = 'audio/aac'

  let audioMetadata
  try {
    audioMetadata = await getAudioMetadata(filePath)
  } catch (error) {
    console.error(`Failed to extract audio metadata from ${file}:`, error)
    summary.failed++
    return
  }

  let publicUrl: string

  try {
    publicUrl = await uploadFileToR2Direct({
      bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      key: `audiopreview/${languageId}.aac`,
      filePath,
      contentType
    })
  } catch (error) {
    console.error(`Failed to upload audio preview to R2:`, error)
    summary.failed++
    return
  }

  try {
    const result = await importOrUpdateAudioPreview({
      languageId,
      publicUrl,
      duration: audioMetadata.duration,
      size: contentLength,
      bitrate: audioMetadata.bitrate,
      codec: audioMetadata.codec
    })

    if (result === 'failed') {
      summary.failed++
    } else {
      await markFileAsCompleted(filePath)
      summary.successful++
      console.log(`Successfully processed audio preview ${file}`)
    }
  } catch (error) {
    console.error(`Failed to import/update audio preview:`, error)
    summary.failed++
  }
}
