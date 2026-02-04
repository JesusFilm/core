import { countChars, normalizeCueText, stripVttTags } from './normalize'
import { LanguageProfile, ValidationResult } from './types'
import { hasRequiredBlankLines, parseTimestamp, parseWebVtt } from './webvtt'

export const validatorVersion = 'v1' as const

export function validateWebVtt(
  vtt: string,
  profile: LanguageProfile
): ValidationResult {
  const errors: ValidationResult['errors'] = []

  if (!vtt.trim().startsWith('WEBVTT')) {
    errors.push({
      cueIndex: -1,
      rule: 'INVALID_WEBVTT',
      message: 'Missing WEBVTT header'
    })
    return { valid: false, cues: [], errors }
  }

  if (!hasRequiredBlankLines(vtt)) {
    errors.push({
      cueIndex: -1,
      rule: 'INVALID_WEBVTT',
      message: 'Missing blank lines between cues'
    })
  }

  let cues = []
  try {
    cues = parseWebVtt(vtt)
  } catch (error) {
    errors.push({
      cueIndex: -1,
      rule: 'INVALID_WEBVTT',
      message:
        error instanceof Error ? error.message : 'Invalid WebVTT structure'
    })
    return { valid: false, cues: [], errors }
  }

  const minGap = profile.minGapMs / 1000

  cues.forEach((cue, index) => {
    if (cue.text.trim().length === 0) {
      errors.push({
        cueIndex: index,
        rule: 'EMPTY_CUE',
        message: 'Cue text is empty'
      })
    }

    if (cue.start < 0 || cue.end < 0 || cue.end <= cue.start) {
      errors.push({
        cueIndex: index,
        rule: 'INVALID_TIMESTAMP',
        message: 'Cue timestamps are invalid'
      })
    }

    const normalized = normalizeCueText(stripVttTags(cue.text))
    if (/<[^>]+>/.test(cue.text)) {
      errors.push({
        cueIndex: index,
        rule: 'DISALLOWED_MARKUP',
        message: 'Cue contains disallowed markup'
      })
    }

    const lines = normalized.split('\n')
    const lineCount = lines.length
    if (lineCount > profile.maxLines) {
      errors.push({
        cueIndex: index,
        rule: 'MAX_LINES',
        message: 'Cue exceeds max lines',
        measured: lineCount,
        limit: profile.maxLines
      })
    }

    const maxLineLength = Math.max(
      ...lines.map((line) => countChars(normalizeCueText(line)))
    )
    if (maxLineLength > profile.maxCPL) {
      errors.push({
        cueIndex: index,
        rule: 'MAX_CPL',
        message: 'Cue exceeds max CPL',
        measured: maxLineLength,
        limit: profile.maxCPL
      })
    }

    const duration = cue.end - cue.start
    if (duration < profile.minDuration) {
      errors.push({
        cueIndex: index,
        rule: 'MIN_DURATION',
        message: 'Cue duration below minimum',
        measured: duration,
        limit: profile.minDuration
      })
    }

    if (duration > profile.maxDuration) {
      errors.push({
        cueIndex: index,
        rule: 'MAX_DURATION',
        message: 'Cue duration above maximum',
        measured: duration,
        limit: profile.maxDuration
      })
    }

    const cps = countChars(normalized) / duration
    if (cps > profile.maxCPS) {
      errors.push({
        cueIndex: index,
        rule: 'MAX_CPS',
        message: 'Cue exceeds max CPS',
        measured: cps,
        limit: profile.maxCPS
      })
    }
  })

  for (let i = 1; i < cues.length; i += 1) {
    const prev = cues[i - 1]
    const current = cues[i]

    if (current.start < prev.start || current.end < prev.end) {
      errors.push({
        cueIndex: i,
        rule: 'NON_MONOTONIC',
        message: 'Cue timestamps are not monotonic'
      })
    }

    if (current.start < prev.end) {
      errors.push({
        cueIndex: i,
        rule: 'OVERLAP',
        message: 'Cue overlaps previous cue'
      })
    }

    if (current.start - prev.end < minGap) {
      errors.push({
        cueIndex: i,
        rule: 'MIN_GAP',
        message: 'Cue gap below minimum',
        measured: current.start - prev.end,
        limit: minGap
      })
    }
  }

  for (const cue of cues) {
    const startText = formatTimestampForValidation(cue.start)
    const endText = formatTimestampForValidation(cue.end)
    if (parseTimestamp(startText) == null || parseTimestamp(endText) == null) {
      errors.push({
        cueIndex: -1,
        rule: 'INVALID_TIMESTAMP',
        message: 'Timestamp format invalid'
      })
      break
    }
  }

  return { valid: errors.length === 0, cues, errors }
}

function formatTimestampForValidation(seconds: number): string {
  const clamped = Math.max(0, seconds)
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const secs = Math.floor(clamped % 60)
  const millis = Math.round((clamped - Math.floor(clamped)) * 1000)
  const pad = (value: number, length = 2) =>
    value.toString().padStart(length, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(millis, 3)}`
}
