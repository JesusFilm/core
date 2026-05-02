import { v4 as uuidv4 } from 'uuid'

import { env } from '../env'
import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_MUX_VIDEO_AND_QUEUE_UPLOAD } from '../gql/mutations'
import { VIDEO_FILENAME_REGEX } from '../importerFilenamePatterns'
import { createR2Asset, uploadToR2 } from '../services/r2'
import {
  type ProcessingSummary,
  recordProcessingFailure,
  recordProcessingSuccess
} from '../types'
import { toErrorMessage } from '../utils/errorMessage'
import { getVideoMetadata } from '../utils/fileMetadataHelpers'
import { markFileAsCompleted } from '../utils/fileUtils'
import { validateVideoAndEdition } from '../utils/videoEditionValidator'
import { parseVideoFilename } from '../utils/videoFilename'

export { VIDEO_FILENAME_REGEX }

export async function processVideoFile(
  file: string,
  filePath: string,
  contentLength: number,
  summary: ProcessingSummary
): Promise<void> {
  if (!VIDEO_FILENAME_REGEX.test(file)) {
    return
  }

  const parsed = parseVideoFilename(file)
  if (parsed == null) {
    console.error(
      `Validation failed for ${file}: unsupported filename shape. Expected <videoId>---<edition>---<lang>---<version>.mp4 or <videoId>---<edition>---<audioLang>---<audioVersion>---<burnedLang>---<burnedVersion>.mp4`
    )
    recordProcessingFailure(
      summary,
      file,
      'Unsupported filename shape (expected 4 or 6 `---` segments before .mp4)'
    )
    return
  }

  const { videoId, edition, version, audioLanguageId, audioVersion, burnedIn } =
    parsed
  const languageId = parsed.languageId.trim()
  const parsedVersion = Number.parseInt(version, 10)

  if (languageId.length === 0) {
    console.error(
      `Validation failed for ${file}: missing languageId in filename`
    )
    recordProcessingFailure(summary, file, 'Missing languageId in filename')
    return
  }

  if (Number.isNaN(parsedVersion)) {
    console.error(
      `Invalid version "${version}" for ${file}. Video=${videoId}, Edition=${edition}, Lang=${languageId}. Skipping.`
    )
    recordProcessingFailure(
      summary,
      file,
      `Invalid version "${version}" for video=${videoId}, edition=${edition}, languageId=${languageId}`
    )
    return
  }

  if (burnedIn) {
    console.log(
      `Processing: Video=${videoId}, Edition=${edition}, AudioLang=${audioLanguageId} (v${audioVersion}), BurnedInLang=${languageId} (v${parsedVersion}) — using burned-in pair as variant language/version`
    )
  } else {
    console.log(
      `Processing: Video=${videoId}, Edition=${edition}, Lang=${languageId}, Version=${parsedVersion}`
    )
  }

  try {
    await validateVideoAndEdition(videoId, edition, languageId)
  } catch (error) {
    console.error(`Validation failed for ${file}: ${(error as Error).message}`)
    recordProcessingFailure(summary, file, toErrorMessage(error))
    return
  }

  const contentType = 'video/mp4'
  const originalFilename = file

  let metadata
  try {
    metadata = await getVideoMetadata(filePath)
    if (
      metadata.durationMs === undefined ||
      metadata.width === undefined ||
      metadata.height === undefined
    ) {
      throw new Error('Incomplete metadata: missing required properties')
    }
  } catch (error) {
    console.error(`Failed to extract metadata from ${file}:`, error)
    recordProcessingFailure(
      summary,
      file,
      `Metadata / ffprobe: ${toErrorMessage(error)}`
    )
    return
  }

  const videoVariantId = `${languageId}_${videoId}`
  const fileName = `${videoId}/variants/${languageId}/videos/${uuidv4()}/${videoVariantId}.mp4`

  let r2Asset
  try {
    r2Asset = await createR2Asset({
      fileName,
      contentType,
      originalFilename,
      videoId,
      contentLength
    })
  } catch (error) {
    console.error(`Failed to create R2 asset:`, error)
    recordProcessingFailure(
      summary,
      file,
      `R2 create asset: ${toErrorMessage(error)}`
    )
    return
  }

  try {
    await uploadToR2({
      uploadUrl: r2Asset.uploadUrl,
      bucket: env.CLOUDFLARE_R2_BUCKET,
      filePath,
      contentType,
      contentLength
    })
  } catch (error) {
    console.error(`Failed to upload to R2:`, error)
    recordProcessingFailure(
      summary,
      file,
      `R2 upload: ${toErrorMessage(error)}`
    )
    return
  }

  try {
    const client = await getGraphQLClient()
    await client.request(CREATE_MUX_VIDEO_AND_QUEUE_UPLOAD, {
      videoId,
      edition,
      languageId,
      version: parsedVersion,
      r2PublicUrl: r2Asset.publicUrl,
      originalFilename,
      durationMs: metadata.durationMs,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height
    })
  } catch (error) {
    console.error(`Failed to create Mux video and queue upload:`, error)
    recordProcessingFailure(
      summary,
      file,
      `GraphQL / Mux enqueue: ${toErrorMessage(error)}`
    )
    return
  }

  try {
    await markFileAsCompleted(filePath)
    recordProcessingSuccess(summary, file)
    console.log(`Successfully processed ${file}`)
  } catch (error) {
    console.error(`Failed to mark file as completed:`, error)
    recordProcessingFailure(
      summary,
      file,
      `Rename to .completed: ${toErrorMessage(error)}`
    )
  }
}
