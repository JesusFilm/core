import { Cue } from './types'

const TIMESTAMP_PATTERN =
  /^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/

export function formatTimestamp(seconds: number): string {
  const clamped = Math.max(0, seconds)
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const secs = Math.floor(clamped % 60)
  const millis = Math.round((clamped - Math.floor(clamped)) * 1000)

  const pad = (value: number, length = 2) =>
    value.toString().padStart(length, '0')

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(millis, 3)}`
}

export function parseTimestamp(value: string): number | null {
  const match = value.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/)
  if (match == null) return null
  const [, hh, mm, ss, ms] = match
  return (
    Number(hh) * 3600 +
    Number(mm) * 60 +
    Number(ss) +
    Number(ms) / 1000
  )
}

export function parseWebVtt(text: string): Cue[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const lines = normalized.split('\n')

  if (lines.length === 0 || lines[0].trim() !== 'WEBVTT') {
    throw new Error('Missing WEBVTT header')
  }

  const body = lines.slice(1).join('\n').trim()
  if (body.length === 0) return []

  const blocks = body.split(/\n\n+/)
  const cues: Cue[] = []

  for (const block of blocks) {
    const blockLines = block.split('\n').filter((line) => line.length > 0)
    if (blockLines.length === 0) continue

    let timestampLineIndex = 0
    if (!blockLines[0].includes('-->')) {
      timestampLineIndex = 1
    }

    const timestampLine = blockLines[timestampLineIndex]
    const match = timestampLine?.match(TIMESTAMP_PATTERN)
    if (match == null) {
      throw new Error('Invalid timestamp line')
    }

    const start = parseTimestamp(`${match[1]}:${match[2]}:${match[3]}.${match[4]}`)
    const end = parseTimestamp(`${match[5]}:${match[6]}:${match[7]}.${match[8]}`)

    if (start == null || end == null) {
      throw new Error('Invalid timestamps')
    }

    const textLines = blockLines.slice(timestampLineIndex + 1)
    cues.push({ start, end, text: textLines.join('\n') })
  }

  return cues
}

export function serializeWebVtt(cues: Cue[]): string {
  const lines = ['WEBVTT', '']
  cues.forEach((cue) => {
    lines.push(
      `${formatTimestamp(cue.start)} --> ${formatTimestamp(cue.end)}`,
      cue.text,
      ''
    )
  })
  return lines.join('\n').trimEnd() + '\n'
}

export function hasRequiredBlankLines(text: string): boolean {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const body = normalized.split('\n').slice(1).join('\n').trim()
  if (body.length === 0) return true
  return body.includes('\n\n')
}
