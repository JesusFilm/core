// Pure helpers for comparing a Video DB row against its Algolia record.
// Extracted from the inline body of `checkVideoInAlgolia` so the same logic
// can be reused for library-wide drift checks in `videoIssueChecks`.

export type AlgoliaVideoMismatch = {
  field: string
  expected: string | null
  actual: string | null
}

export type VideoForAlgoliaCompare = {
  id: string
  label: string
  restrictViewPlatforms: string[]
  keywords: Array<{ value: string }>
  variants: Array<{
    hls: string | null
    lengthInMilliseconds: number | null
    downloadable: boolean
  }>
}

export const PRIMARY_VARIANT_LANGUAGE_ID = '529'

export function buildExpectedAlgoliaVideo(
  video: VideoForAlgoliaCompare
): Record<string, unknown> {
  const primaryVariant = video.variants[0]
  const isVideoContent = primaryVariant?.hls != null
  const isDownloadable =
    video.label === 'collection' || video.label === 'series'
      ? false
      : (primaryVariant?.downloadable ?? false)

  return {
    objectID: video.id,
    mediaComponentId: video.id,
    subType: video.label,
    componentType: isVideoContent ? 'content' : 'container',
    contentType: isVideoContent ? 'video' : 'none',
    lengthInMilliseconds: primaryVariant?.lengthInMilliseconds ?? 0,
    isDownloadable,
    restrictViewArclight: video.restrictViewPlatforms.includes('arclight'),
    keywords: video.keywords.map((k) => k.value).sort()
  }
}

export function diffAlgoliaVideo(
  expected: Record<string, unknown>,
  record: Record<string, unknown>
): AlgoliaVideoMismatch[] {
  const actual = {
    objectID: record.objectID,
    mediaComponentId: record.mediaComponentId,
    subType: record.subType,
    componentType: record.componentType,
    contentType: record.contentType,
    lengthInMilliseconds: record.lengthInMilliseconds,
    isDownloadable: record.isDownloadable,
    restrictViewArclight: record.restrictViewArclight,
    keywords: Array.isArray(record.keywords)
      ? [...(record.keywords as string[])].sort()
      : []
  }

  return Object.entries(expected).flatMap(([key, value]) => {
    const actualValue = (actual as Record<string, unknown>)[key]
    if (JSON.stringify(actualValue) === JSON.stringify(value)) return []
    return [
      {
        field: key,
        expected: JSON.stringify(value),
        actual: JSON.stringify(actualValue)
      }
    ]
  })
}
