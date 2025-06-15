import { promises } from 'fs'
import path from 'path'

import 'dotenv/config'

import { Command } from 'commander'
import { v4 as uuidv4 } from 'uuid'

import { getVideoMetadata } from './services/metadata.service'
import { createAndWaitForMuxVideo } from './services/mux.service'
import { createR2Asset, uploadToR2 } from './services/r2.service'
import { importOrUpdateSubtitle } from './services/subtitle.service'
import { getVideoEditionId } from './services/video-edition.service'
import { createVideoVariant } from './services/video.service'
import type { ProcessingSummary } from './types'

const program = new Command()

program
  .option(
    '-f, --folder <path>',
    "Folder containing video files. Defaults to the executable's directory."
  )
  .option('--dry-run', 'Print actions without uploading', false)
  .parse(process.argv)

const options = program.opts()

export const VIDEO_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)(?:---([^-]+))*\.mp4$/

export const SUBTITLE_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)(?:---([^-]+))*\.(srt|vtt)$/

async function main() {
  // Check if running in a Single Executable Application
  const runningInSEA = require('node:sea').isSea()
  const defaultFolderPath = runningInSEA
    ? path.dirname(process.execPath)
    : process.cwd()

  const folderPath = options.folder
    ? path.resolve(options.folder)
    : defaultFolderPath
  let files: string[]
  try {
    files = await promises.readdir(folderPath)
  } catch {
    console.error(`Failed to read folder: ${folderPath}`)
    process.exit(1)
  }

  const videoFiles = files.filter((file) => VIDEO_FILENAME_REGEX.test(file))
  const subtitleFiles = files.filter((file) =>
    SUBTITLE_FILENAME_REGEX.test(file)
  )

  if (videoFiles.length === 0) {
    console.log('No valid video files found in the folder.')
  } else {
    console.log(`Found ${videoFiles.length} video files.`)
  }

  if (subtitleFiles.length === 0) {
    console.log('No valid subtitle files found in the folder.')
  } else {
    console.log(`Found ${subtitleFiles.length} subtitle files.`)
  }

  const summary: ProcessingSummary = {
    total: videoFiles.length,
    successful: 0,
    failed: 0,
    errors: []
  }

  // for (const file of videoFiles) {
  //   const match = file.match(VIDEO_FILENAME_REGEX)
  //   if (!match) continue
  //   const [, videoId, edition, languageId, ...extraFields] = match

  //   console.log(`\n🎬 Processing: ${file}`)
  //   console.log(
  //     `   └── IDs: Video=${videoId}, Edition=${edition}, Lang=${languageId}`
  //   )
  //   if (extraFields.length > 0) {
  //     console.log(
  //       `   └── Extra fields: ${extraFields.filter(Boolean).join(', ')}`
  //     )
  //   }

  //   if (options.dryRun) {
  //     console.log(`[DRY RUN] Would process file: ${file}`)
  //     continue
  //   }

  //   try {
  //     const filePath = path.join(folderPath, file)
  //     const contentType = 'video/mp4'
  //     const originalFilename = file
  //     const { size: contentLength } = await promises.stat(filePath)

  //     console.log('   🔎 Reading video metadata...')
  //     let metadata
  //     try {
  //       metadata = await getVideoMetadata(filePath)
  //       console.log('      Video metadata:', metadata)
  //       // Validate metadata properties
  //       if (
  //         metadata.durationMs === undefined ||
  //         metadata.width === undefined ||
  //         metadata.height === undefined
  //       ) {
  //         throw new Error('Incomplete metadata: missing required properties')
  //       }
  //     } catch (error) {
  //       console.error(`   ❌ Failed to extract metadata from ${file}:`, error)
  //       summary.failed++
  //       summary.errors.push({
  //         file,
  //         error: error instanceof Error ? error.message : String(error)
  //       })
  //       continue
  //     }

  //     if (metadata.durationMs < 500) {
  //       console.warn(
  //         `   ⚠️  Skipping file ${file}: duration (${metadata.durationMs}ms) is less than Mux minimum (500ms).`
  //       )
  //       summary.failed++
  //       summary.errors.push({
  //         file,
  //         error: `Video duration (${metadata.durationMs}ms) is less than Mux minimum (500ms).`
  //       })
  //       continue
  //     }

  //     console.log('   ☁️  Preparing Cloudflare R2 asset...')

  //     const videoVariantId = `${languageId}_${videoId}`
  //     const fileName = `${videoId}/variants/${languageId}/videos/${uuidv4()}/${videoVariantId}.mp4`

  //     const r2Asset = await createR2Asset({
  //       fileName,
  //       contentType,
  //       originalFilename,
  //       videoId,
  //       contentLength
  //     })

  //     console.log('      R2 Public URL:', r2Asset.publicUrl)
  //     console.log('   📤 Uploading to R2...')
  //     await uploadToR2({
  //       uploadUrl: r2Asset.uploadUrl,
  //       bucket: process.env.CLOUDFLARE_R2_BUCKET!,
  //       filePath,
  //       contentType,
  //       contentLength
  //     })

  //     console.log('   🎞️  Preparing Mux asset...')
  //     const muxVideo = await createAndWaitForMuxVideo(r2Asset.publicUrl)
  //     console.log(
  //       '      Mux Playback URL:',
  //       `https://stream.mux.com/${muxVideo.playbackId}.m3u8`
  //     )

  //     console.log('   ⚙️  Saving video variant details...')
  //     const result = await createVideoVariant({
  //       videoId,
  //       languageId,
  //       edition,
  //       muxId: muxVideo.id,
  //       playbackId: muxVideo.playbackId,
  //       r2PublicUrl: r2Asset.publicUrl,
  //       metadata
  //     })
  //     console.log(
  //       result === 'created'
  //         ? '      ✅ Successfully created video variant'
  //         : '      ♻️  Updated existing video variant'
  //     )
  //     summary.successful++
  //   } catch (err) {
  //     console.error(`   ❌ Error processing ${file}:`, err)
  //     summary.failed++
  //     summary.errors.push({
  //       file,
  //       error: err instanceof Error ? err.message : String(err)
  //     })
  //   }
  // }

  for (const file of subtitleFiles) {
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

    try {
      const filePath = path.join(folderPath, file)
      const contentType = file.endsWith('.srt') ? 'text/srt' : 'text/vtt'
      const originalFilename = file
      const { size: contentLength } = await promises.stat(filePath)

      console.log('   ☁️  Preparing Cloudflare R2 asset for subtitle...')

      const editionId = await getVideoEditionId(videoId, editionName)

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
    } catch (err) {
      console.error(`   ❌ Error processing subtitle ${file}:`, err)
      summary.failed++
      summary.errors.push({
        file,
        error: err instanceof Error ? err.message : String(err)
      })
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
