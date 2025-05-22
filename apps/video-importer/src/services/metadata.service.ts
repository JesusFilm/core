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
  const metadata = JSON.parse(stdout)
  const stream = metadata.streams[0]
  const format = metadata.format
  const durationSeconds = parseFloat(format.duration)

  return {
    durationMs: Math.round(durationSeconds * 1000),
    duration: Math.round(durationSeconds),
    width: stream.width,
    height: stream.height
  }
}
