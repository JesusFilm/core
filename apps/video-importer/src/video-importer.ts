import { promises } from 'fs'
import path from 'path'
import 'dotenv/config'

import { Command } from 'commander'
import { v4 as uuidv4 } from 'uuid'

import { importOrUpdateAudioPreview } from './services/audiopreview'
import { createAndWaitForMuxVideo } from './services/mux'
import {
  createR2Asset,
  r2ConnectionTest,
  uploadFileToR2Direct,
  uploadToR2
} from './services/r2'
import { importOrUpdateSubtitle } from './services/subtitle'
import { importOrUpdateVideoVariant } from './services/video'
import type { ProcessingSummary } from './types'
import { checkEnvironmentVariables } from './utils/envVarTest'
import {
  diagnoseFile,
  printDiagnostics,
  testFileRead
} from './utils/fileDiagnostics'
import { getAudioMetadata, getVideoMetadata } from './utils/fileMetadataHelpers'
import { validateVideoAndEdition } from './utils/videoEditionValidator'

const program = new Command()

program
  .option(
    '-f, --folder <path>',
    "Folder containing video files. Defaults to the executable's directory."
  )
  .parse(process.argv)

const options = program.opts()

async function markFileAsCompleted(filePath: string): Promise<void> {
  const completedPath = `${filePath}.completed`
  await promises.rename(filePath, completedPath)
  console.log(`   Marked as completed: ${path.basename(completedPath)}`)
}

export const VIDEO_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)---([^-]+)(?:---([^-]+))*\.mp4$/

export const SUBTITLE_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)(?:---([^-]+))*\.(srt|vtt)$/

export const AUDIO_PREVIEW_FILENAME_REGEX = /^([^.]+)\.aac$/

async function main() {
  const runningInSEA = require('node:sea').isSea()
  const defaultFolderPath = runningInSEA
    ? path.dirname(process.execPath)
    : process.cwd()

  const folderPath = options.folder
    ? path.resolve(options.folder)
    : defaultFolderPath

  try {
    await checkEnvironmentVariables()
  } catch (error) {
    console.error('Environment variables check failed:', error)
    process.exit(1)
  }

  try {
    await r2ConnectionTest()
  } catch (error) {
    console.error('\nR2 connection test failed:', error)
    process.exit(1)
  }

  let files: string[]
  try {
    files = await promises.readdir(folderPath)
  } catch (err) {
    console.error(`Failed to read folder: ${folderPath}`, err)
    process.exit(1)
  }

  const FILE_TYPES = [
    {
      name: 'video',
      regex: VIDEO_FILENAME_REGEX
    },
    {
      name: 'subtitle',
      regex: SUBTITLE_FILENAME_REGEX
    },
    {
      name: 'audio preview',
      regex: AUDIO_PREVIEW_FILENAME_REGEX
    }
  ] as const

  const filesByType = FILE_TYPES.map(({ name, regex }) => {
    const validFiles = files.filter((file) => regex.test(file))

    if (validFiles.length === 0) {
      console.log(`No valid ${name} files found in the folder.`)
    } else {
      console.log(`Found ${validFiles.length} ${name} files.`)
    }

    return { name, validFiles, restoredFiles: [] as string[] }
  })

  const summary: ProcessingSummary = {
    total: filesByType.reduce(
      (sum, { validFiles }) => sum + validFiles.length,
      0
    ),
    successful: 0,
    failed: 0
  }

  const [videoType, subtitleType, audioPreviewType] = filesByType

  const allVideoFiles = videoType.validFiles
  const allSubtitleFiles = subtitleType.validFiles
  const allAudioPreviewFiles = audioPreviewType.validFiles

  for (const file of allVideoFiles) {
    const match = file.match(VIDEO_FILENAME_REGEX)
    if (!match) continue

    const [, videoId, editionName, languageId, version, ...extraFields] = match
    const edition = editionName.toLowerCase()

    console.log(`\nProcessing: ${file}`)
    console.log(
      `   - IDs: Video=${videoId}, Edition=${edition}, Lang=${languageId}, Version=${version}`
    )
    if (extraFields.length > 0) {
      console.log(
        `   - Extra fields: ${extraFields.filter(Boolean).join(', ')}`
      )
    }

    try {
      await validateVideoAndEdition(videoId, edition)
    } catch (error) {
      console.error(`   Validation failed:`, error)
      summary.failed++
      continue
    }

    const filePath = path.join(folderPath, file)

    console.log('   Validating file accessibility...')
    try {
      await testFileRead(filePath)
    } catch (validationError) {
      console.error('   File validation failed:', validationError)
      const diagnostics = await diagnoseFile(filePath)
      printDiagnostics(diagnostics)
      summary.failed++
      continue
    }

    const contentType = 'video/mp4'
    const originalFilename = file
    const { size: contentLength } = await promises.stat(filePath)

    console.log('   Reading video metadata...')
    let metadata
    try {
      metadata = await getVideoMetadata(filePath)
      console.log('      Video metadata:', metadata)
      if (
        metadata.durationMs === undefined ||
        metadata.width === undefined ||
        metadata.height === undefined
      ) {
        throw new Error('Incomplete metadata: missing required properties')
      }
    } catch (error) {
      console.error(`   Failed to extract metadata from ${file}:`, error)
      summary.failed++
      continue
    }

    console.log('   Preparing Cloudflare R2 asset...')

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
      console.error(`   Failed to create R2 asset:`, error)
      summary.failed++
      continue
    }

    console.log('   R2 Public URL:', r2Asset.publicUrl)
    console.log('   Uploading to R2...')
    try {
      await uploadToR2({
        uploadUrl: r2Asset.uploadUrl,
        bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        filePath,
        contentType,
        contentLength
      })
    } catch (error) {
      console.error(`   Failed to upload to R2:`, error)
      summary.failed++
      continue
    }

    console.log('   Preparing Mux asset...')
    let muxVideo
    try {
      muxVideo = await createAndWaitForMuxVideo(
        r2Asset.publicUrl,
        contentLength
      )
      console.log(
        `      Mux Playback URL: https://stream.mux.com/${muxVideo.playbackId}.m3u8`
      )
    } catch (error) {
      console.error(`   Failed to create Mux video:`, error)
      summary.failed++
      continue
    }

    console.log('   Saving video variant details...')
    try {
      await importOrUpdateVideoVariant({
        videoId,
        languageId,
        edition,
        muxId: muxVideo.id,
        playbackId: muxVideo.playbackId,
        metadata,
        version: parseInt(version)
      })
      summary.successful++
      await markFileAsCompleted(filePath)
    } catch (error) {
      console.error(`   Failed to save video variant:`, error)
      summary.failed++
      continue
    }
  }

  for (const file of allSubtitleFiles) {
    const match = file.match(SUBTITLE_FILENAME_REGEX)
    if (!match) continue
    const [, videoId, editionName, languageId, ...extraFields] = match
    const edition = editionName.toLowerCase()

    console.log(`\nProcessing subtitle: ${file}`)
    console.log(
      `   - IDs: Video=${videoId}, Edition=${edition}, Lang=${languageId}`
    )
    if (extraFields.length > 0) {
      console.log(
        `     - Extra fields: ${extraFields.filter(Boolean).join(', ')}`
      )
    }

    const filePath = path.join(folderPath, file)

    console.log('   Validating file accessibility...')
    try {
      await testFileRead(filePath)
    } catch (validationError) {
      console.error('   File validation failed:', validationError)
      summary.failed++
      continue
    }

    console.log('   Validating video and edition...')
    try {
      await validateVideoAndEdition(videoId, edition)
    } catch (error) {
      console.error(`   Validation failed:`, error)
      summary.failed++
      continue
    }

    const contentType = file.endsWith('.srt') ? 'text/srt' : 'text/vtt'
    const originalFilename = file
    const { size: contentLength } = await promises.stat(filePath)

    console.log('   Preparing Cloudflare R2 asset for subtitle...')
    const subtitleVariantId = `${languageId}_${edition}_${videoId}`
    const fileName = `${videoId}/editions/${edition}/subtitles/${subtitleVariantId}.${contentType.split('/')[1]}`

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
      console.error(`   Failed to create R2 asset for subtitle:`, error)
      summary.failed++
      continue
    }

    console.log('   R2 Public URL:', r2Asset.publicUrl)
    console.log('   Uploading subtitle to R2...')
    try {
      await uploadToR2({
        uploadUrl: r2Asset.uploadUrl,
        bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        filePath,
        contentType,
        contentLength
      })
    } catch (error) {
      console.error(`   Failed to upload subtitle to R2:`, error)
      summary.failed++
      continue
    }

    console.log('   Importing or updating subtitle...')
    try {
      await importOrUpdateSubtitle({
        videoId,
        editionName,
        languageId,
        fileType: contentType,
        r2Asset
      })
      summary.successful++
      await markFileAsCompleted(filePath)
    } catch (error) {
      console.error(`   Failed to import/update subtitle:`, error)
      summary.failed++
      continue
    }
  }

  for (const file of allAudioPreviewFiles) {
    const match = file.match(AUDIO_PREVIEW_FILENAME_REGEX)
    if (!match) continue
    const [, languageId] = match

    console.log(`\nProcessing audio preview: ${file}`)
    console.log(`   Language ID: ${languageId}`)

    const filePath = path.join(folderPath, file)

    console.log('   Validating file accessibility...')
    try {
      await testFileRead(filePath)
    } catch (validationError) {
      console.error('   File validation failed:', validationError)
      summary.failed++
      continue
    }

    const contentType = 'audio/aac'
    const { size: contentLength } = await promises.stat(filePath)

    // Extract audio metadata
    let audioMetadata
    try {
      audioMetadata = await getAudioMetadata(filePath)
      console.log('      Audio metadata:', audioMetadata)
    } catch (error) {
      console.error(`   Failed to extract audio metadata from ${file}:`, error)
      summary.failed++
      continue
    }

    console.log('   Uploading audio preview to R2...')

    const bucket = process.env.CLOUDFLARE_R2_BUCKET!
    const key = `audiopreview/${languageId}.aac`

    let publicUrl
    try {
      publicUrl = await uploadFileToR2Direct({
        bucket,
        key,
        filePath,
        contentType
      })
    } catch (error) {
      console.error(`   Failed to upload audio preview to R2:`, error)
      summary.failed++
      continue
    }

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
      continue
    }
  }

  console.log('\n=== Processing Summary ===')
  console.log(`Total files: ${summary.total}`)
  console.log(`Successfully processed: ${summary.successful}`)
  console.log(`Failed: ${summary.failed}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
