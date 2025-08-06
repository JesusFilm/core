import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_AUDIO_PREVIEW, UPDATE_AUDIO_PREVIEW } from '../gql/mutations'
import { GET_AUDIO_PREVIEW } from '../gql/queries'
import { createR2Asset, uploadToR2 } from '../services/r2'
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

export async function processAudioPreviewFile(
  file: string,
  filePath: string,
  contentLength: number,
  summary: ProcessingSummary
): Promise<void> {
  const match = file.match(AUDIO_PREVIEW_FILENAME_REGEX)
  if (!match) return

  const [, languageId] = match

  console.log(`   Language ID: ${languageId}`)

  const contentType = 'audio/aac'

  // Extract audio metadata
  let audioMetadata
  try {
    audioMetadata = await getAudioMetadata(filePath)
    console.log('      Audio metadata:', audioMetadata)
  } catch (error) {
    console.error(`   Failed to extract audio metadata from ${file}:`, error)
    summary.failed++
    return
  }

  console.log('   Preparing Cloudflare R2 asset for audio preview...')
  const fileName = `audiopreview/${languageId}.aac`

  let r2Asset
  try {
    r2Asset = await createR2Asset({
      fileName,
      contentType,
      originalFilename: file,
      videoId: 'audiopreview',
      contentLength
    })
  } catch (error) {
    console.error(`   Failed to create R2 asset for audio preview:`, error)
    summary.failed++
    return
  }

  console.log('   R2 Public URL:', r2Asset.publicUrl)
  console.log('   Uploading audio preview to R2...')
  try {
    await uploadToR2({
      uploadUrl: r2Asset.uploadUrl,
      bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      filePath,
      contentType,
      contentLength
    })
  } catch (error) {
    console.error(`   Failed to upload audio preview to R2:`, error)
    summary.failed++
    return
  }

  const publicUrl = r2Asset.publicUrl

  console.log('   Importing or updating audio preview record...')

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
      summary.successful++
      await markFileAsCompleted(filePath)
    }
  } catch (error) {
    console.error(`   Failed to import/update audio preview:`, error)
    summary.failed++
  }
}
