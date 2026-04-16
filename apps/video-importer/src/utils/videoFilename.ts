/**
 * Video importer filename parser.
 *
 * Two shapes are supported:
 *
 *   1. Classic (4 segments):
 *        <videoId>---<edition>---<languageId>---<version>.mp4
 *
 *      The video variant's `languageId` / `version` come straight from the
 *      filename. Backwards-compatible with every file the importer accepted
 *      before burned-in support.
 *
 *   2. Burned-in-aware (6 segments):
 *        <videoId>---<edition>---<audioLanguageId>---<audioVersion>---<burnedLanguageId>---<burnedVersion>.mp4
 *
 *      * When `burnedLanguageId` and `burnedVersion` are both non-zero, the
 *        file represents a *burned-in* variant. The video variant's
 *        `languageId` / `version` are the burned-in pair (what the viewer
 *        actually sees on screen), and the audio pair is kept for logging.
 *      * When both trailing segments are "0" (or blank), the file has no
 *        burned-in subtitles; the audio pair is used as the variant's
 *        language/version.
 */

export interface ParsedVideoFilename {
  videoId: string
  /** Edition lowercased for GraphQL (matches prior importer behaviour). */
  edition: string
  /** Edition as it appeared in the filename (upper- or lower-case). */
  editionDisplay: string
  /**
   * Language id the video variant represents. For a burned-in file this is
   * the burned-in subtitle language; otherwise it matches `audioLanguageId`.
   */
  languageId: string
  /** Version associated with {@link languageId} (raw string, not yet parsed). */
  version: string
  /** Present when the filename uses the 6-segment shape. */
  audioLanguageId?: string
  /** Present when the filename uses the 6-segment shape. */
  audioVersion?: string
  /** True when {@link languageId}/{@link version} come from the burned-in pair. */
  burnedIn: boolean
  /** Raw segments after `<videoId>---<edition>---`. */
  variantSegments: string[]
}

const MP4_EXT = '.mp4'

function isZeroPlaceholder(value: string | undefined): boolean {
  if (value == null) {
    return true
  }

  const trimmed = value.trim()
  return trimmed.length === 0 || trimmed === '0'
}

export function parseVideoFilename(file: string): ParsedVideoFilename | null {
  if (!file.toLowerCase().endsWith(MP4_EXT)) {
    return null
  }

  const stem = file.slice(0, -MP4_EXT.length)
  const parts = stem.split('---')
  if (parts.length !== 4 && parts.length !== 6) {
    return null
  }

  const [videoId, editionDisplay, ...variantSegments] = parts
  if (
    videoId.trim().length === 0 ||
    editionDisplay.trim().length === 0
  ) {
    return null
  }

  const edition = editionDisplay.toLowerCase()

  if (variantSegments.length === 2) {
    const [languageId, version] = variantSegments
    return {
      videoId,
      edition,
      editionDisplay,
      languageId,
      version,
      burnedIn: false,
      variantSegments
    }
  }

  const [audioLanguageId, audioVersion, burnedLanguageId, burnedVersion] =
    variantSegments
  const burnedIn =
    !isZeroPlaceholder(burnedLanguageId) && !isZeroPlaceholder(burnedVersion)

  return {
    videoId,
    edition,
    editionDisplay,
    languageId: burnedIn ? burnedLanguageId : audioLanguageId,
    version: burnedIn ? burnedVersion : audioVersion,
    audioLanguageId,
    audioVersion,
    burnedIn,
    variantSegments
  }
}
