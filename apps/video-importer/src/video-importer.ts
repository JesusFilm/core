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
  console.log('Video Importer Starting...')

  const runningInSEA = require('node:sea').isSea()
  const defaultFolderPath = runningInSEA
    ? path.dirname(process.execPath)
    : process.cwd()

  const folderPath = options.folder
    ? path.resolve(options.folder)
    : defaultFolderPath

  console.log(`Processing folder: ${folderPath}`)

  try {
    await checkEnvironmentVariables()
  } catch (error) {
    console.error('Environment check failed:', error)
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

  const filesToProcess = files.filter((file) => {
    return !file.endsWith('.completed')
  })

  console.log(
    `Found ${filesToProcess.length} files to process (${files.length - filesToProcess.length} already completed)`
  )

  for (const file of filesToProcess) {
    console.log(`\nProcessing: ${file}`)

    const filePath = path.join(folderPath, file)
    const { size: contentLength } = await promises.stat(filePath)

    if (VIDEO_FILENAME_REGEX.test(file)) {
      await processVideoFile(file, filePath, contentLength, summary)
    } else if (SUBTITLE_FILENAME_REGEX.test(file)) {
      await processSubtitleFile(file, filePath, contentLength, summary)
    } else if (AUDIO_PREVIEW_FILENAME_REGEX.test(file)) {
      await processAudioPreviewFile(file, filePath, contentLength, summary)
    } else {
      console.log(`Skipping unsupported file: ${file}`)
    }
  }

  console.log('\n=== SUMMARY ===')
  console.log(`Total files: ${summary.total}`)
  console.log(`Successfully processed: ${summary.successful}`)
  console.log(`Failed: ${summary.failed}`)
  console.log(`Already completed: ${files.length - filesToProcess.length}`)

  if (summary.successful > 0) {
    console.log(`\n${summary.successful} job(s) queued successfully`)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
