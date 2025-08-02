import { promises } from 'fs'
import path from 'path'
import 'dotenv/config'

import { Command } from 'commander'
import { v4 as uuidv4 } from 'uuid'

import { getAudioMetadata } from './services/audio-metadata.service'
import { importOrUpdateAudioPreview } from './services/audio-preview.service'
import { validateEnvironment } from './services/connection-test.service'
import { getVideoMetadata } from './services/metadata.service'
import { createAndWaitForMuxVideo } from './services/mux.service'
import {
  createR2Asset,
  uploadFileToR2Direct,
  uploadToR2
} from './services/r2.service'
import { importOrUpdateSubtitle } from './services/subtitle.service'
import { validateVideoAndEdition } from './services/validation.service'
import { createVideoVariant } from './services/video.service'
import type { ProcessingSummary } from './types'

const program = new Command()

program
  .option(
    '-f, --folder <path>',
    "Folder containing video files. Defaults to the executable's directory."
  )
  .option('--dry-run', 'Print actions without uploading', false)
  .option('--skip-retry', 'Skip retrying failed files', false)
  .parse(process.argv)

const options = program.opts()

// File renaming utilities
async function markFileAsCompleted(filePath: string): Promise<void> {
  const completedPath = `${filePath}.completed`
  await promises.rename(filePath, completedPath)
  console.log(`   ✅ Marked as completed: ${path.basename(completedPath)}`)
}

async function markFileAsFailed(filePath: string): Promise<void> {
  const failedPath = `${filePath}.failed`
  await promises.rename(filePath, failedPath)
  console.log(`   ❌ Marked as failed: ${path.basename(failedPath)}`)
}

async function restoreFailedFile(failedFilePath: string): Promise<string> {
  const originalPath = failedFilePath.replace(/\.failed$/, '')
  await promises.rename(failedFilePath, originalPath)
  console.log(`   🔄 Restored for retry: ${path.basename(originalPath)}`)
  return originalPath
}

export const VIDEO_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)(?:---([^-]+))*\.mp4$/

export const VIDEO_FAILED_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)(?:---([^-]+))*\.mp4\.failed$/

export const SUBTITLE_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)(?:---([^-]+))*\.(srt|vtt)$/

export const SUBTITLE_FAILED_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)(?:---([^-]+))*\.(srt|vtt)\.failed$/

export const AUDIO_PREVIEW_FILENAME_REGEX = /^([^.]+)\.aac$/

export const AUDIO_PREVIEW_FAILED_FILENAME_REGEX = /^([^.]+)\.aac\.failed$/

async function main() {
  // Check if running in a Single Executable Application
  const runningInSEA = require('node:sea').isSea()
  const defaultFolderPath = runningInSEA
    ? path.dirname(process.execPath)
    : process.cwd()

  const folderPath = options.folder
    ? path.resolve(options.folder)
    : defaultFolderPath

  // === Connection Tests ===
  console.log('Checking connections...')

  try {
    // Test 1: Validate environment variables
    await validateEnvironment()
  } catch (error) {
    console.error('\n❌ Pre-flight checks failed:', error)
    process.exit(1)
  }

  // === File Processing ===
  let files: string[]
  try {
    files = await promises.readdir(folderPath)
  } catch (err) {
    console.error(`Failed to read folder: ${folderPath}`, err)
    process.exit(1)
  }

  const videoFiles = files.filter((file) => VIDEO_FILENAME_REGEX.test(file))
  const videoFailedFiles = files.filter((file) =>
    VIDEO_FAILED_FILENAME_REGEX.test(file)
  )

  const subtitleFiles = files.filter((file) =>
    SUBTITLE_FILENAME_REGEX.test(file)
  )
  const subtitleFailedFiles = files.filter((file) =>
    SUBTITLE_FAILED_FILENAME_REGEX.test(file)
  )

  const audioPreviewFiles = files.filter((file) =>
    AUDIO_PREVIEW_FILENAME_REGEX.test(file)
  )
  const audioPreviewFailedFiles = files.filter((file) =>
    AUDIO_PREVIEW_FAILED_FILENAME_REGEX.test(file)
  )

  if (videoFiles.length === 0 && videoFailedFiles.length === 0) {
    console.log('No valid video files found in the folder.')
  } else {
    console.log(
      `Found ${videoFiles.length} video files${videoFailedFiles.length > 0 ? ` and ${videoFailedFiles.length} failed video files` : ''}.`
    )
  }

  if (subtitleFiles.length === 0 && subtitleFailedFiles.length === 0) {
    console.log('No valid subtitle files found in the folder.')
  } else {
    console.log(
      `Found ${subtitleFiles.length} subtitle files${subtitleFailedFiles.length > 0 ? ` and ${subtitleFailedFiles.length} failed subtitle files` : ''}.`
    )
  }

  if (audioPreviewFiles.length === 0 && audioPreviewFailedFiles.length === 0) {
    console.log('No valid audio preview files found in the folder.')
  } else {
    console.log(
      `Found ${audioPreviewFiles.length} audio preview files${audioPreviewFailedFiles.length > 0 ? ` and ${audioPreviewFailedFiles.length} failed audio preview files` : ''}.`
    )
  }

  const summary: ProcessingSummary = {
    total:
      videoFiles.length +
      videoFailedFiles.length +
      subtitleFiles.length +
      subtitleFailedFiles.length +
      audioPreviewFiles.length +
      audioPreviewFailedFiles.length,
    successful: 0,
    failed: 0,
    errors: []
  }

  // Restore failed files for retry (unless skipped)
  const restoredVideoFiles: string[] = []
  const restoredSubtitleFiles: string[] = []
  const restoredAudioPreviewFiles: string[] = []

  if (!options.skipRetry) {
    console.log('\n🔄 Restoring failed files for retry...')

    for (const failedFile of videoFailedFiles) {
      try {
        const restoredPath = await restoreFailedFile(
          path.join(folderPath, failedFile)
        )
        restoredVideoFiles.push(path.basename(restoredPath))
      } catch (err) {
        console.error(`Failed to restore ${failedFile}:`, err)
      }
    }

    for (const failedFile of subtitleFailedFiles) {
      try {
        const restoredPath = await restoreFailedFile(
          path.join(folderPath, failedFile)
        )
        restoredSubtitleFiles.push(path.basename(restoredPath))
      } catch (err) {
        console.error(`Failed to restore ${failedFile}:`, err)
      }
    }

    for (const failedFile of audioPreviewFailedFiles) {
      try {
        const restoredPath = await restoreFailedFile(
          path.join(folderPath, failedFile)
        )
        restoredAudioPreviewFiles.push(path.basename(restoredPath))
      } catch (err) {
        console.error(`Failed to restore ${failedFile}:`, err)
      }
    }

    const totalRestored =
      restoredVideoFiles.length +
      restoredSubtitleFiles.length +
      restoredAudioPreviewFiles.length
    if (totalRestored > 0) {
      console.log(`   Restored ${totalRestored} failed files for retry`)
    }
  } else {
    console.log('\n⏭️  Skipping retry of failed files (--skip-retry enabled)')
  }

  // Combine original and restored files
  const allVideoFiles = [...videoFiles, ...restoredVideoFiles]
  const allSubtitleFiles = [...subtitleFiles, ...restoredSubtitleFiles]
  const allAudioPreviewFiles = [
    ...audioPreviewFiles,
    ...restoredAudioPreviewFiles
  ]

  for (const file of allVideoFiles) {
    const match = file.match(VIDEO_FILENAME_REGEX)
    if (!match) continue
    const [, videoId, editionName, languageId, ...extraFields] = match

    const edition = editionName.toLowerCase()

    console.log(`\n🎬 Processing: ${file}`)
    console.log(
      `   └── IDs: Video=${videoId}, Edition=${edition}, Lang=${languageId}`
    )
    if (extraFields.length > 0) {
      console.log(
        `   └── Extra fields: ${extraFields.filter(Boolean).join(', ')}`
      )
    }

    if (options.dryRun) {
      console.log(`[DRY RUN] Would process file: ${file}`)
      continue
    }

    // Validate video and edition before processing
    console.log('   🔍 Validating video and edition...')
    const validationResult = await validateVideoAndEdition(videoId, edition)
    if (!validationResult.success) {
      console.error(
        `   ❌ Validation failed: ${validationResult.errors.join(', ')}`
      )
      summary.failed++
      summary.errors.push({
        file,
        error: `Validation failed: ${validationResult.errors.join(', ')}`
      })
      continue
    }

    const filePath = path.join(folderPath, file)

    try {
      const contentType = 'video/mp4'
      const originalFilename = file
      const { size: contentLength } = await promises.stat(filePath)

      console.log('   🔎 Reading video metadata...')
      let metadata
      try {
        metadata = await getVideoMetadata(filePath)
        console.log('      Video metadata:', metadata)
        // Validate metadata properties
        if (
          metadata.durationMs === undefined ||
          metadata.width === undefined ||
          metadata.height === undefined
        ) {
          throw new Error('Incomplete metadata: missing required properties')
        }
      } catch (error) {
        console.error(`   ❌ Failed to extract metadata from ${file}:`, error)
        summary.failed++
        summary.errors.push({
          file,
          error: error instanceof Error ? error.message : String(error)
        })
        continue
      }

      if (metadata.durationMs < 500) {
        console.warn(
          `   ⚠️  Skipping file ${file}: duration (${metadata.durationMs}ms) is less than Mux minimum (500ms).`
        )
        summary.failed++
        summary.errors.push({
          file,
          error: `Video duration (${metadata.durationMs}ms) is less than Mux minimum (500ms).`
        })
        continue
      }

      console.log('   ☁️  Preparing Cloudflare R2 asset...')

      const videoVariantId = `${languageId}_${videoId}`
      const fileName = `${videoId}/variants/${languageId}/videos/${uuidv4()}/${videoVariantId}.mp4`

      const r2Asset = await createR2Asset({
        fileName,
        contentType,
        originalFilename,
        videoId,
        contentLength
      })

      console.log('      R2 Public URL:', r2Asset.publicUrl)
      console.log('   📤 Uploading to R2...')
      await uploadToR2({
        uploadUrl: r2Asset.uploadUrl,
        bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        filePath,
        contentType,
        contentLength
      })

      console.log('   🎞️  Preparing Mux asset...')
      const muxVideo = await createAndWaitForMuxVideo(r2Asset.publicUrl)
      console.log(
        '      Mux Playback URL:',
        `https://stream.mux.com/${muxVideo.playbackId}.m3u8`
      )

      console.log('   ⚙️  Saving video variant details...')
      const result = await createVideoVariant({
        videoId,
        languageId,
        edition,
        muxId: muxVideo.id,
        playbackId: muxVideo.playbackId,
        r2PublicUrl: r2Asset.publicUrl,
        metadata
      })
      console.log(
        result === 'created'
          ? '      ✅ Successfully created video variant'
          : '      ♻️  Updated existing video variant'
      )
      summary.successful++

      // Mark file as completed
      await markFileAsCompleted(filePath)
    } catch (err) {
      console.error(`   ❌ Error processing ${file}:`, err)
      summary.failed++
      summary.errors.push({
        file,
        error: err instanceof Error ? err.message : String(err)
      })

      // Mark file as failed
      try {
        await markFileAsFailed(filePath)
      } catch (renameErr) {
        console.error(
          `Failed to mark file as failed: ${renameErr instanceof Error ? renameErr.message : String(renameErr)}`
        )
      }
    }
  }

  for (const file of allSubtitleFiles) {
    const match = file.match(SUBTITLE_FILENAME_REGEX)
    if (!match) continue
    const [, videoId, editionName, languageId, ...extraFields] = match

    console.log(`\n📜 Processing subtitle: ${file}`)
    console.log(
      `   └── IDs: Video=${videoId}, Edition=${editionName}, Lang=${languageId}`
    )
    if (extraFields.length > 0) {
      console.log(
        `   └── Extra fields: ${extraFields.filter(Boolean).join(', ')}`
      )
    }

    if (options.dryRun) {
      console.log(`[DRY RUN] Would process subtitle file: ${file}`)
      continue
    }

    // Validate video and edition before processing
    console.log('   🔍 Validating video and edition...')
    const validationResult = await validateVideoAndEdition(videoId, editionName)
    if (!validationResult.success) {
      console.error(
        `   ❌ Validation failed: ${validationResult.errors.join(', ')}`
      )
      summary.failed++
      summary.errors.push({
        file,
        error: `Validation failed: ${validationResult.errors.join(', ')}`
      })
      continue
    }

    console.log(
      `   ✅ Video "${videoId}" and edition "${editionName}" are valid`
    )

    const filePath = path.join(folderPath, file)

    try {
      const contentType = file.endsWith('.srt') ? 'text/srt' : 'text/vtt'
      const originalFilename = file
      const { size: contentLength } = await promises.stat(filePath)

      console.log('   ☁️  Preparing Cloudflare R2 asset for subtitle...')

      // Use the validated edition ID instead of calling getVideoEditionId again
      const editionId = validationResult.editionId!
      console.log('      Edition ID:', editionId)

      const subtitleVariantId = `${languageId}_${editionId}_${videoId}`
      const fileName = `${videoId}/editions/${editionId}/subtitles/${subtitleVariantId}.${contentType.split('/')[1]}`

      const r2Asset = await createR2Asset({
        fileName,
        contentType,
        originalFilename,
        videoId,
        contentLength
      })

      console.log('      R2 Public URL for subtitle:', r2Asset.publicUrl)
      console.log('   📤 Uploading subtitle to R2...')
      await uploadToR2({
        uploadUrl: r2Asset.uploadUrl,
        bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        filePath,
        contentType,
        contentLength
      })

      // After uploading to R2
      console.log('   🎞️  Importing or updating subtitle...')
      const fileType = file.endsWith('.vtt') ? 'vtt' : 'srt'
      const result = await importOrUpdateSubtitle({
        videoId,
        editionName,
        languageId,
        fileType,
        r2Asset
      })
      if (result === 'updated') {
        console.log('      ♻️  Updated existing video subtitle')
      } else {
        console.log('      ✅ Created new video subtitle')
      }
      summary.successful++

      // Mark file as completed
      await markFileAsCompleted(filePath)
    } catch (err) {
      console.error(`   ❌ Error processing subtitle ${file}:`, err)
      summary.failed++
      summary.errors.push({
        file,
        error: err instanceof Error ? err.message : String(err)
      })

      // Mark file as failed
      try {
        await markFileAsFailed(filePath)
      } catch (renameErr) {
        console.error(
          `Failed to mark subtitle file as failed: ${renameErr instanceof Error ? renameErr.message : String(renameErr)}`
        )
      }
    }
  }

  // === Audio Preview Processing ===
  for (const file of allAudioPreviewFiles) {
    const match = file.match(AUDIO_PREVIEW_FILENAME_REGEX)
    if (!match) continue
    const [, languageId] = match

    console.log(`\n🔊 Processing audio preview: ${file}`)
    console.log(`   └── Language ID: ${languageId}`)

    if (options.dryRun) {
      console.log(`[DRY RUN] Would process audio preview file: ${file}`)
      continue
    }

    const filePath = path.join(folderPath, file)

    try {
      const contentType = 'audio/aac'
      const { size: contentLength } = await promises.stat(filePath)

      // Extract audio metadata
      let audioMetadata
      try {
        audioMetadata = await getAudioMetadata(filePath)
        console.log('      Audio metadata:', audioMetadata)
      } catch (error) {
        console.error(
          `   ❌ Failed to extract audio metadata from ${file}:`,
          error
        )
        summary.failed++
        summary.errors.push({
          file,
          error: error instanceof Error ? error.message : String(error)
        })
        continue
      }

      console.log('   ☁️  Uploading audio preview to R2...')

      const bucket = process.env.CLOUDFLARE_R2_BUCKET!
      const key = `audiopreview/${languageId}.aac`

      await uploadFileToR2Direct({
        bucket,
        key,
        filePath,
        contentType
      })

      if (!process.env.CLOUDFLARE_R2_ENDPOINT) {
        throw new Error(
          'CLOUDFLARE_R2_ENDPOINT is required for audio preview processing'
        )
      }

      const publicBaseUrl =
        process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL ||
        `https://${bucket}.${new URL(process.env.CLOUDFLARE_R2_ENDPOINT).hostname}`
      const publicUrl = `${publicBaseUrl.replace(/\/$/, '')}/${key}`

      console.log('      Public URL:', publicUrl)

      console.log('   🎞️  Importing or updating audio preview record...')

      const result = await importOrUpdateAudioPreview({
        languageId,
        publicUrl,
        duration: audioMetadata.duration,
        size: contentLength,
        bitrate: audioMetadata.bitrate,
        codec: audioMetadata.codec
      })

      if (result === 'updated') {
        console.log('      ♻️  Updated existing audio preview')
      } else if (result === 'created') {
        console.log('      ✅ Created new audio preview')
      } else {
        console.log('      ❌ Failed to import audio preview')
      }

      if (result === 'failed') {
        summary.failed++
        summary.errors.push({
          file,
          error: 'Failed to create/update audio preview'
        })

        // Mark file as failed
        try {
          await markFileAsFailed(filePath)
        } catch (renameErr) {
          console.error(
            `Failed to mark audio preview file as failed: ${renameErr instanceof Error ? renameErr.message : String(renameErr)}`
          )
        }
      } else {
        summary.successful++

        // Mark file as completed
        await markFileAsCompleted(filePath)
      }
    } catch (err) {
      console.error(`   ❌ Error processing audio preview ${file}:`, err)
      summary.failed++
      summary.errors.push({
        file,
        error: err instanceof Error ? err.message : String(err)
      })

      // Mark file as failed
      try {
        await markFileAsFailed(filePath)
      } catch (renameErr) {
        console.error(
          `Failed to mark audio preview file as failed: ${renameErr instanceof Error ? renameErr.message : String(renameErr)}`
        )
      }
    }
  }

  // Print summary
  console.log('\n=== Processing Summary ===')
  console.log(`Total files: ${summary.total}`)
  console.log(`Successfully processed: ${summary.successful}`)
  console.log(`Failed: ${summary.failed}`)

  if (summary.errors.length > 0) {
    console.log('\nErrors:')
    summary.errors.forEach(({ file, error }) => {
      console.log(`\n${file}:`)
      console.log(`  ${error}`)
    })
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
