import { v4 as uuidv4 } from 'uuid'

import { triggerVideoUploadJob } from '../services/job-queue'
import { createMuxAsset } from '../services/mux'
import { createR2Asset, uploadToR2 } from '../services/r2'
import { ProcessingSummary } from '../types'
import { getVideoMetadata } from '../utils/fileMetadataHelpers'
import { markFileAsCompleted } from '../utils/fileUtils'
import { validateVideoAndEdition } from '../utils/videoEditionValidator'

export const VIDEO_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)---([^-]+)(?:---([^-]+))*\.mp4$/

export async function processVideoFile(
  file: string,
  filePath: string,
  contentLength: number,
  summary: ProcessingSummary
): Promise<void> {
  const match = file.match(VIDEO_FILENAME_REGEX)
  if (!match) return

  const [, videoId, editionName, languageId, version] = match
  const edition = editionName.toLowerCase()
  const parsedVersion = Number.parseInt(version, 10)
  if (Number.isNaN(parsedVersion)) {
    console.error(
      `Invalid version "${version}" for ${file}. Video=${videoId}, Edition=${edition}, Lang=${languageId}. Skipping.`
    )
    summary.failed++
    return
  }

  console.log(
    `Processing: Video=${videoId}, Edition=${edition}, Lang=${languageId}, Version=${parsedVersion}`
  )

  try {
    await validateVideoAndEdition(videoId, edition)
  } catch (error) {
    console.error(`Validation failed:`, error)
    summary.failed++
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
    summary.failed++
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
    summary.failed++
    return
  }

  if (!process.env.CLOUDFLARE_R2_BUCKET) {
    console.error('CLOUDFLARE_R2_BUCKET is not set')
    summary.failed++
    return
  }
  try {
    await uploadToR2({
      uploadUrl: r2Asset.uploadUrl,
      bucket: process.env.CLOUDFLARE_R2_BUCKET,
      filePath,
      contentType,
      contentLength
    })
  } catch (error) {
    console.error(`Failed to upload to R2:`, error)
    summary.failed++
    return
  }

  let muxVideo
  try {
    muxVideo = await createMuxAsset(r2Asset.publicUrl, contentLength)
  } catch (error) {
    console.error(`Failed to create Mux asset:`, error)
    summary.failed++
    return
  }

  try {
    await triggerVideoUploadJob({
      videoId,
      edition,
      languageId,
      version: parsedVersion,
      muxVideoId: muxVideo.id,
      metadata,
      originalFilename: fileName
    })
  } catch (error) {
    console.error(`Failed to queue job for ${fileName}:`, error)
    summary.failed++
    return
  }

  try {
    await markFileAsCompleted(filePath)
    summary.successful++
    console.log(`Successfully processed ${file}`)
  } catch (error) {
    console.error(`Failed to mark file as completed:`, error)
    summary.failed++
  }
}
