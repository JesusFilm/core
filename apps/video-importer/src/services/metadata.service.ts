import { exec } from 'child_process'
import { promisify } from 'util'

import type { VideoMetadata } from '../types'

const execAsync = promisify(exec)

export async function getVideoMetadata(
  filePath: string
): Promise<VideoMetadata> {
  const { stdout } = await execAsync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -show_entries format=duration -of json "${filePath}"`
  )
  let metadata
  try {
    metadata = JSON.parse(stdout)
  } catch (error) {
    throw new Error(
      `Failed to parse ffprobe output: ${(error as Error).message}`
    )
  }

  if (!metadata.streams || metadata.streams.length === 0) {
    throw new Error('No video streams found in file')
  }

  const stream = metadata.streams[0]
  const format = metadata.format

  if (!format || !format.duration) {
    throw new Error('Could not determine video duration')
  }

  const durationSeconds = parseFloat(format.duration)
  if (isNaN(durationSeconds)) {
    throw new Error('Invalid duration value')
  }

  if (
    !stream.width ||
    !stream.height ||
    isNaN(stream.width) ||
    isNaN(stream.height)
  ) {
    throw new Error('Invalid or missing video dimensions')
  }

  return {
    durationMs: Math.round(durationSeconds * 1000),
    duration: Math.round(durationSeconds),
    width: stream.width,
    height: stream.height
  }
}
