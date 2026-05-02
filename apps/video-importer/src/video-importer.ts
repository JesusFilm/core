import { promises } from 'fs'
import path from 'path'

import { Command } from 'commander'

import {
  AUDIO_PREVIEW_FILENAME_REGEX,
  SUBTITLE_FILENAME_REGEX,
  VIDEO_FILENAME_REGEX
} from './importerFilenamePatterns'
import { processAudioPreviewFile } from './importers/audiopreview'
import { processSubtitleFile } from './importers/subtitle'
import { processVideoFile } from './importers/video'
import {
  type ProcessingSummary,
  createProcessingSummary,
  recordProcessingFailure
} from './types'
import { toErrorMessage } from './utils/errorMessage'

const program = new Command()

program
  .option(
    '-f, --folder <path>',
    "Folder containing video files. Defaults to the executable's directory."
  )
  .option('--dry-run', 'Print actions without uploading', false)
  .option('--no-slack', 'Do not post a Slack summary after the run')
  .parse(process.argv)

const options = program.opts()

// Regex patterns are imported from the respective importers

function getDefaultFolderPath(): string {
  const runningAsStandaloneExecutable =
    typeof Bun !== 'undefined' && Bun.embeddedFiles.length > 0

  if (!runningAsStandaloneExecutable) return process.cwd()

  // In Bun standalone executable mode, `process.execPath` is the path to the compiled binary.
  return path.dirname(process.execPath)
}

async function main() {
  const defaultFolderPath = getDefaultFolderPath()

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

  const summary: ProcessingSummary = createProcessingSummary(
    videoFiles.length + subtitleFiles.length + audioPreviewFiles.length
  )

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
      recordProcessingFailure(
        summary,
        file,
        `Unhandled error: ${toErrorMessage(err)}`
      )
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
      recordProcessingFailure(
        summary,
        file,
        `Unhandled error: ${toErrorMessage(err)}`
      )
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
      recordProcessingFailure(
        summary,
        file,
        `Unhandled error: ${toErrorMessage(err)}`
      )
    }
  }

  // Print summary
  console.log('\n=== Processing Summary ===')
  console.log(`Total files: ${summary.total}`)
  console.log(`Successfully processed: ${summary.successful}`)
  console.log(`Failed: ${summary.failed}`)

  const slackTokenConfigured =
    typeof process.env.SLACK_BOT_TOKEN === 'string' &&
    process.env.SLACK_BOT_TOKEN.trim().length > 0
  const slackChannelConfigured =
    typeof process.env.SLACK_CHANNEL_ID === 'string' &&
    process.env.SLACK_CHANNEL_ID.trim().length > 0

  if (
    !options.dryRun &&
    !options.noSlack &&
    slackTokenConfigured !== slackChannelConfigured
  ) {
    console.warn(
      '[video-importer] Slack is partially configured: set both SLACK_BOT_TOKEN and SLACK_CHANNEL_ID to enable notifications.'
    )
  }

  if (
    !options.dryRun &&
    !options.noSlack &&
    slackTokenConfigured &&
    slackChannelConfigured
  ) {
    const { postVideoImporterSlackSummary } = await import(
      /* webpackChunkName: "video-importer-slack" */ './services/slack'
    )
    await postVideoImporterSlackSummary({ folderPath, summary })
  }

  // Errors are logged inline where they occur
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
