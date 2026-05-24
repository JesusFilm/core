import { env } from '../env'
import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_AUDIO_PREVIEW, UPDATE_AUDIO_PREVIEW } from '../gql/mutations'
import { GET_AUDIO_PREVIEW } from '../gql/queries'
import { AUDIO_PREVIEW_FILENAME_REGEX } from '../importerFilenamePatterns'
import {
  type AudioPreviewInput,
  type ProcessingSummary,
  recordProcessingFailure,
  recordProcessingSuccess
} from '../types'
import { toErrorMessage } from '../utils/errorMessage'
import { getAudioMetadata } from '../utils/fileMetadataHelpers'
import { markFileAsCompleted } from '../utils/fileUtils'
import { validateLanguage } from '../utils/videoEditionValidator'

export { AUDIO_PREVIEW_FILENAME_REGEX }

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

  const [, rawLanguageId] = match
  const languageId = rawLanguageId.trim()

  console.log(`Processing audio preview: Language=${languageId}`)

  if (languageId.length === 0) {
    console.error(
      `Validation failed for ${file}: missing languageId in filename`
    )
    recordProcessingFailure(summary, file, 'Missing languageId in filename')
    return
  }

  try {
    await validateLanguage(languageId)
  } catch (error) {
    console.error(`Validation failed for ${file}: ${(error as Error).message}`)
    recordProcessingFailure(summary, file, toErrorMessage(error))
    return
  }

  const contentType = 'audio/aac'

  let audioMetadata
  try {
    audioMetadata = await getAudioMetadata(filePath)
  } catch (error) {
    console.error(`Failed to extract audio metadata from ${file}:`, error)
    recordProcessingFailure(
      summary,
      file,
      `Audio metadata / ffprobe: ${toErrorMessage(error)}`
    )
    return
  }

  let publicUrl: string

  try {
    const { uploadFileToR2Direct } = await import(
      /* webpackChunkName: "video-importer-r2" */ '../services/r2'
    )
    publicUrl = await uploadFileToR2Direct({
      bucket: env.CLOUDFLARE_R2_BUCKET,
      key: `audiopreview/${languageId}.aac`,
      filePath,
      contentType
    })
  } catch (error) {
    console.error(`Failed to upload audio preview to R2:`, error)
    recordProcessingFailure(
      summary,
      file,
      `R2 upload: ${toErrorMessage(error)}`
    )
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
      recordProcessingFailure(
        summary,
        file,
        'GraphQL audio preview create/update returned failure'
      )
    } else {
      await markFileAsCompleted(filePath)
      recordProcessingSuccess(summary, file)
      console.log(`Successfully processed audio preview ${file}`)
    }
  } catch (error) {
    console.error(`Failed to import/update audio preview:`, error)
    recordProcessingFailure(
      summary,
      file,
      `GraphQL audio preview: ${toErrorMessage(error)}`
    )
  }
}
