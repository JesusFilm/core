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

// Regex patterns are imported from the respective importers

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
  } catch (err) {
    console.error(`Failed to read folder: ${folderPath}`, err)
    process.exit(1)
  }

  const videoFiles = files.filter((file) => VIDEO_FILENAME_REGEX.test(file))
  const subtitleFiles = files.filter((file) =>
    SUBTITLE_FILENAME_REGEX.test(file)
  )
  const audioPreviewFiles = files.filter((file) =>
    AUDIO_PREVIEW_FILENAME_REGEX.test(file)
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

  if (audioPreviewFiles.length === 0) {
    console.log('No valid audio preview files found in the folder.')
  } else {
    console.log(`Found ${audioPreviewFiles.length} audio preview files.`)
  }

  const summary: ProcessingSummary = {
    total: videoFiles.length + subtitleFiles.length + audioPreviewFiles.length,
    successful: 0,
    failed: 0
  }

  for (const file of videoFiles) {
    console.log(`\nProcessing: ${file}`)

    if (options.dryRun) {
      console.log(`[DRY RUN] Would process file: ${file}`)
      continue
    }

    try {
      const filePath = path.join(folderPath, file)
      const { size: contentLength } = await promises.stat(filePath)
      await processVideoFile(file, filePath, contentLength, summary)
    } catch (err) {
      console.error(`Error processing ${file}:`, err)
      summary.failed++
    }
  }

  for (const file of subtitleFiles) {
    const match = file.match(SUBTITLE_FILENAME_REGEX)
    if (!match) continue
    console.log(`\nProcessing subtitle: ${file}`)

    if (options.dryRun) {
      console.log(`[DRY RUN] Would process subtitle file: ${file}`)
      continue
    }

    try {
      const filePath = path.join(folderPath, file)
      const { size: contentLength } = await promises.stat(filePath)
      await processSubtitleFile(file, filePath, contentLength, summary)
    } catch (err) {
      console.error(`Error processing subtitle ${file}:`, err)
      summary.failed++
    }
  }

  // === Audio Preview Processing ===
  for (const file of audioPreviewFiles) {
    const match = file.match(AUDIO_PREVIEW_FILENAME_REGEX)
    if (!match) continue

    console.log(`\nProcessing audio preview: ${file}`)

    if (options.dryRun) {
      console.log(`[DRY RUN] Would process audio preview file: ${file}`)
      continue
    }

    try {
      const filePath = path.join(folderPath, file)
      const { size: contentLength } = await promises.stat(filePath)
      await processAudioPreviewFile(file, filePath, contentLength, summary)
    } catch (err) {
      console.error(`Error processing audio preview ${file}:`, err)
      summary.failed++
    }
  }

  // Print summary
  console.log('\n=== Processing Summary ===')
  console.log(`Total files: ${summary.total}`)
  console.log(`Successfully processed: ${summary.successful}`)
  console.log(`Failed: ${summary.failed}`)

  // Errors are logged inline where they occur
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
