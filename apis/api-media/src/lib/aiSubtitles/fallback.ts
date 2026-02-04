import { countChars, normalizeCueText } from './normalize'
import { LanguageClass, LanguageProfile, SubtitleSegment } from './types'
import { serializeWebVtt } from './webvtt'

export const fallbackVersion = 'v1' as const

interface MergedSegment {
  start: number
  end: number
  text: string
}

export function buildFallbackVtt(
  segments: SubtitleSegment[],
  languageClass: LanguageClass,
  profile: LanguageProfile
): string {
  const merged = mergeSegments(segments)
  const cues = merged.flatMap((segment) =>
    splitMergedSegment(segment, languageClass, profile)
  )

  const adjusted = enforceTimingConstraints(cues, profile)

  return serializeWebVtt(adjusted)
}

function mergeSegments(segments: SubtitleSegment[]): MergedSegment[] {
  const sorted = [...segments].sort((a, b) => a.start - b.start)
  const merged: MergedSegment[] = []

  for (const segment of sorted) {
    const last = merged[merged.length - 1]
    if (last == null) {
      merged.push({ start: segment.start, end: segment.end, text: segment.text })
      continue
    }

    const gap = segment.start - last.end
    if (gap <= 0.3) {
      last.end = Math.max(last.end, segment.end)
      last.text = `${last.text.trim()} ${segment.text.trim()}`.trim()
    } else {
      merged.push({ start: segment.start, end: segment.end, text: segment.text })
    }
  }

  return merged
}

function splitMergedSegment(
  segment: MergedSegment,
  languageClass: LanguageClass,
  profile: LanguageProfile
) {
  const normalizedText = normalizeCueText(segment.text)
  const totalChars = countChars(normalizedText)
  const duration = Math.max(segment.end - segment.start, profile.minDuration)
  const estimatedCps = totalChars / duration
  const maxCharsPerCue = profile.maxCPL * profile.maxLines

  const cpsChunks = Math.ceil(estimatedCps / profile.maxCPS)
  const lengthChunks = Math.ceil(totalChars / maxCharsPerCue)
  const chunkCount = Math.max(1, cpsChunks, lengthChunks)

  const chunks = splitTextIntoChunks(normalizedText, languageClass, chunkCount)
  const adjustedStart = Math.max(0, segment.start - profile.startOffsetMs / 1000)

  let cursor = adjustedStart
  return chunks.map((chunk, index) => {
    const chunkChars = countChars(chunk)
    const targetDuration = Math.max(
      profile.minDuration,
      Math.min(profile.maxDuration, chunkChars / profile.targetCPS)
    )

    const cue = {
      start: cursor,
      end: cursor + targetDuration,
      text: formatLines(chunk, languageClass, profile)
    }

    cursor = cue.end + profile.minGapMs / 1000

    if (index === chunks.length - 1) {
      cue.end = Math.max(
        cue.end,
        segment.end + profile.endOffsetMs / 1000
      )
    }

    return cue
  })
}

function splitTextIntoChunks(
  text: string,
  languageClass: LanguageClass,
  chunkCount: number
): string[] {
  if (chunkCount <= 1) return [text]

  const units =
    languageClass === 'CJK'
      ? Array.from(text.replace(/\s+/g, ''))
      : text.split(/\s+/)

  const perChunk = Math.ceil(units.length / chunkCount)
  const chunks: string[] = []

  for (let i = 0; i < units.length; i += perChunk) {
    const slice = units.slice(i, i + perChunk)
    chunks.push(languageClass === 'CJK' ? slice.join('') : slice.join(' '))
  }

  return chunks
}

function formatLines(
  text: string,
  languageClass: LanguageClass,
  profile: LanguageProfile
): string {
  if (languageClass === 'CJK') {
    return wrapCjk(text, profile.maxCPL)
  }

  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current: string[] = []

  const flush = () => {
    if (current.length > 0) {
      lines.push(current.join(' '))
      current = []
    }
  }

  for (const word of words) {
    const candidate = [...current, word].join(' ')
    if (countChars(candidate) > profile.maxCPL && current.length > 0) {
      flush()
      current.push(word)
    } else {
      current.push(word)
    }
  }
  flush()

  if (lines.length <= profile.maxLines) {
    return lines.join('\n')
  }

  return hardWrap(text, profile.maxCPL)
}

function wrapCjk(text: string, maxCpl: number): string {
  const graphemes = Array.from(text)
  const lines: string[] = []
  let line: string[] = []

  for (const char of graphemes) {
    if (countChars([...line, char].join('')) > maxCpl) {
      lines.push(line.join(''))
      line = [char]
    } else {
      line.push(char)
    }
  }

  if (line.length > 0) lines.push(line.join(''))

  return lines[0] ?? ''
}

function hardWrap(text: string, maxCpl: number): string {
  const graphemes = Array.from(text.replace(/\s+/g, ' '))
  const lines: string[] = []
  let line: string[] = []

  for (const char of graphemes) {
    if (countChars([...line, char].join('')) > maxCpl) {
      lines.push(line.join('').trim())
      line = [char]
    } else {
      line.push(char)
    }
  }
  if (line.length > 0) lines.push(line.join('').trim())

  return lines.join('\n')
}

function enforceTimingConstraints(
  cues: { start: number; end: number; text: string }[],
  profile: LanguageProfile
) {
  const minGap = profile.minGapMs / 1000
  const adjusted = cues.map((cue) => ({ ...cue }))

  for (let i = 0; i < adjusted.length; i += 1) {
    const cue = adjusted[i]
    if (cue.end - cue.start < profile.minDuration) {
      cue.end = cue.start + profile.minDuration
    }
    if (cue.end - cue.start > profile.maxDuration) {
      cue.end = cue.start + profile.maxDuration
    }

    if (i > 0) {
      const prev = adjusted[i - 1]
      if (cue.start < prev.end + minGap) {
        cue.start = prev.end + minGap
        if (cue.end < cue.start + profile.minDuration) {
          cue.end = cue.start + profile.minDuration
        }
      }
    }
  }

  return adjusted
}
