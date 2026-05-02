/**
 * Filename patterns only — safe to import from Slack / CLI helpers without
 * loading Bun (R2) or other importer side effects.
 */

export const VIDEO_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)---([^-]+)(?:---([^-]+))*\.mp4$/

export const SUBTITLE_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)(?:---([^-]+))*\.(srt|vtt)$/

export const AUDIO_PREVIEW_FILENAME_REGEX = /^([^.]+)\.aac$/
