import { promises } from 'fs'
import path from 'path'
import 'dotenv/config'

import { Command } from 'commander'

import {
  AUDIO_PREVIEW_FILENAME_REGEX,
  processAudioPreviewFile
} from './importers/audiopreview'
import {
  SUBTITLE_FILENAME_REGEX,
  processSubtitleFile
} from './importers/subtitle'
import { VIDEO_FILENAME_REGEX, processVideoFile } from './importers/video'
import { closeJobQueue, triggerVideoUploadJob } from './services/job-queue'
import { type PendingMuxVideo } from './services/mux'
import type { ProcessingSummary, VideoProcessingData } from './types'
import { checkEnvironmentVariables } from './utils/envVarTest'

const program = new Command()

program
  .option(
    '-f, --folder <path>',
    "Folder containing video files. Defaults to the executable's directory."
  )
  .parse(process.argv)

const options = program.opts()

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

  let files: string[]
  try {
    files = await promises.readdir(folderPath)
  } catch (err) {
    console.error(`Failed to read folder: ${folderPath}`, err)
    process.exit(1)
  }

  const summary: ProcessingSummary = {
    total: files.length,
    successful: 0,
    failed: 0
  }

  const pendingMuxVideos: PendingMuxVideo[] = []
  const videoProcessingData: VideoProcessingData[] = []

  console.log('\n=== PHASE 1: Upload and Initialize ===')
  console.log('Uploading files to R2 and initializing Mux videos...')

  const filesToProcess = files.filter((file) => {
    return !file.endsWith('.completed')
  })

  for (const file of filesToProcess) {
    console.log(`\nProcessing: ${file}`)

    const filePath = path.join(folderPath, file)
    const { size: contentLength } = await promises.stat(filePath)

    if (VIDEO_FILENAME_REGEX.test(file)) {
      await processVideoFile(
        file,
        filePath,
        contentLength,
        pendingMuxVideos,
        videoProcessingData,
        summary
      )
    } else if (SUBTITLE_FILENAME_REGEX.test(file)) {
      await processSubtitleFile(file, filePath, contentLength, summary)
    } else if (AUDIO_PREVIEW_FILENAME_REGEX.test(file)) {
      await processAudioPreviewFile(file, filePath, contentLength, summary)
    } else {
      console.log(`   Skipping unsupported file type: ${file}`)
    }
  }

  console.log('\n=== PHASE 2: Queue Video Processing Jobs ===')
  console.log(`Queuing ${videoProcessingData.length} video processing jobs...`)

  if (videoProcessingData.length > 0) {
    try {
      for (const processingData of videoProcessingData) {
        console.log(`   Queuing job for ${processingData.fileName}...`)
        try {
          await triggerVideoUploadJob({
            videoId: processingData.videoId,
            edition: processingData.edition,
            languageId: processingData.languageId,
            version: processingData.version,
            muxVideoId: processingData.muxVideoId,
            metadata: processingData.metadata,
            originalFilename: processingData.fileName
          })
          summary.successful++
          console.log(`      ✅ Job queued successfully`)
        } catch (error) {
          console.error(`   Failed to queue job:`, error)
          summary.failed++
        }
      }

      // Close job queue connection
      await closeJobQueue()
    } catch (error) {
      console.error('Failed to queue video processing jobs:', error)
      summary.failed += videoProcessingData.length
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
