import {
  AUDIO_PREVIEW_FILENAME_REGEX,
  SUBTITLE_FILENAME_REGEX,
  VIDEO_FILENAME_REGEX
} from '../importerFilenamePatterns'

import { parseVideoFilename } from './videoFilename'

/** Fields for Slack tables / summaries (no display names — IDs only). */
export interface ImporterFilenameTableFields {
  /** Original filename */
  file: string
  /** Edition code from the name, uppercased for display, or "—" */
  production: string
  /** Video / component id, or "—" for language-only audio */
  mediaComponentId: string
  /** Language id from the filename (burned-in lang for burned-in videos) */
  languageId: string
  /** Video | Video (burned-in) | Subtitle | Audio preview | Unknown */
  kind: string
  /** Version segment when present (video), else "—" */
  version: string
  /** When a burned-in video file, the audio language id; otherwise undefined */
  audioLanguageId?: string
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, "'")
}

function editionProduction(edition: string): string {
  const t = edition.trim().toLowerCase()
  if (t.length === 0) {
    return '—'
  }

  return t.toUpperCase()
}

/**
 * Parse importer filename into stable columns for Slack tables.
 */
export function parseImporterFilenameForTable(
  file: string
): ImporterFilenameTableFields {
  const fallback: ImporterFilenameTableFields = {
    file,
    production: '—',
    mediaComponentId: '—',
    languageId: '—',
    kind: 'Unknown',
    version: '—'
  }

  const audioMatch = file.match(AUDIO_PREVIEW_FILENAME_REGEX)
  if (audioMatch) {
    const raw = audioMatch[1] ?? ''
    const languageId = raw.trim()

    return {
      file,
      production: '—',
      mediaComponentId: '—',
      languageId: languageId.length > 0 ? languageId : '—',
      kind: 'Audio preview',
      version: '—'
    }
  }

  if (file.toLowerCase().endsWith('.mp4')) {
    const parsed = parseVideoFilename(file)
    if (parsed) {
      return {
        file,
        production: editionProduction(parsed.editionDisplay),
        mediaComponentId: parsed.videoId,
        languageId: parsed.languageId.trim(),
        kind: parsed.burnedIn ? 'Video (burned-in)' : 'Video',
        version: parsed.version,
        audioLanguageId: parsed.burnedIn
          ? parsed.audioLanguageId?.trim()
          : undefined
      }
    }

    const stem = file.slice(0, -'.mp4'.length)
    const parts = stem.split('---').filter((p) => p.length > 0)

    if (parts.length === 3) {
      const [videoId, edition, rawLang] = parts

      return {
        file,
        production: editionProduction(edition),
        mediaComponentId: videoId,
        languageId: rawLang.trim(),
        kind: 'Video',
        version: '—'
      }
    }

    if (parts.length === 2) {
      const [videoId, edition] = parts

      return {
        file,
        production: editionProduction(edition),
        mediaComponentId: videoId,
        languageId: '—',
        kind: 'Video',
        version: '—'
      }
    }

    const m = file.match(VIDEO_FILENAME_REGEX)
    if (m) {
      const [, videoId, editionName, rawLanguageId, version] = m

      return {
        file,
        production: editionProduction(editionName),
        mediaComponentId: videoId,
        languageId: rawLanguageId.trim(),
        kind: 'Video',
        version
      }
    }

    return { ...fallback, kind: 'Video (unparsed)' }
  }

  const subMatch = file.match(SUBTITLE_FILENAME_REGEX)
  if (subMatch) {
    const [, videoId, editionName, rawLanguageId, extraField, fileExtension] =
      subMatch
    const ext = (fileExtension ?? '').toLowerCase()
    const extra =
      extraField != null && extraField.length > 0 ? extraField : '—'

    return {
      file,
      production: editionProduction(editionName),
      mediaComponentId: videoId,
      languageId: rawLanguageId.trim(),
      kind: ext.length > 0 ? `Subtitle (.${ext})` : 'Subtitle',
      version: extra
    }
  }

  return fallback
}

/**
 * Human-readable breakdown of importer filename conventions for Slack / logs.
 */
export function formatImporterFilenameParts(file: string): string {
  const r = parseImporterFilenameForTable(file)

  if (r.kind === 'Audio preview') {
    return [
      '*Type:* audio preview (`.aac`)',
      `*Language ID:* \`${esc(r.languageId)}\``
    ].join('\n')
  }

  if (r.kind.startsWith('Video')) {
    const editionDisplay =
      r.production === '—' ? '—' : r.production.toLowerCase()
    const lines = [
      `*Type:* ${esc(r.kind)} (\`.mp4\`)`,
      `*Video ID:* \`${esc(r.mediaComponentId)}\``,
      `*Edition:* \`${esc(editionDisplay)}\``,
      `*Language ID:* \`${esc(r.languageId)}\``,
      `*Version:* \`${esc(r.version)}\``
    ]

    if (r.audioLanguageId != null && r.audioLanguageId.length > 0) {
      lines.push(`*Audio Language ID:* \`${esc(r.audioLanguageId)}\``)
    }

    if (r.kind === 'Video (unparsed)') {
      lines.push(`*Filename:* \`${esc(file)}\``)
    }

    return lines.join('\n')
  }

  if (r.kind.startsWith('Subtitle')) {
    const editionDisplay =
      r.production === '—' ? '—' : r.production.toLowerCase()

    return [
      `*Type:* ${esc(r.kind)}`,
      `*Video ID:* \`${esc(r.mediaComponentId)}\``,
      `*Edition:* \`${esc(editionDisplay)}\``,
      `*Language ID:* \`${esc(r.languageId)}\``
    ].join('\n')
  }

  return ['*Type:* unrecognized pattern', `*Filename:* \`${esc(file)}\``].join('\n')
}
