import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface AudioMetadata {
  duration: number
  bitrate: number
  codec: string
}

/**
 * Extracts duration (seconds), average bitrate (bits per second) and codec from an audio file using ffprobe.
 * Throws an error if any of the required fields are missing.
 */
export async function getAudioMetadata(
  filePath: string
): Promise<AudioMetadata> {
  const { stdout } = await execAsync(
    // eslint-disable-next-line max-len
    `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,bit_rate -show_entries format=duration -of json "${filePath}"`
  )

  let metadata: any
  try {
    metadata = JSON.parse(stdout)
  } catch (error) {
    throw new Error(
      `Failed to parse ffprobe output: ${(error as Error).message}`
    )
  }

  const stream = metadata.streams?.[0]
  const format = metadata.format

  if (format == null || format.duration == null) {
    throw new Error('Could not determine audio duration')
  }

  const durationSeconds = parseFloat(format.duration)
  if (Number.isNaN(durationSeconds)) {
    throw new Error('Invalid duration value')
  }

  const bitrate = parseInt(stream?.bit_rate ?? format.bit_rate ?? '0', 10)
  if (Number.isNaN(bitrate) || bitrate <= 0) {
    throw new Error('Invalid bitrate value')
  }

  const codec = stream?.codec_name
  if (codec == null) {
    throw new Error('Could not determine codec name')
  }

  return {
    duration: Math.round(durationSeconds),
    bitrate,
    codec: codec.toUpperCase()
  }
}
