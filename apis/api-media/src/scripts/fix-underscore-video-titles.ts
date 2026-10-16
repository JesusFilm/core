import { prisma } from '@core/prisma/media/client'

import { videoCacheReset } from '../lib/videoCacheReset'

// FGE-2: raw internal text leaked into these VideoTitle.value fields.
// "La_Busqueda_La Recherche" is corrected to follow the same
// "La Búsqueda - {translated}" convention already used by this video's other
// ten language rows (Dutch, German, Filipino, Mongolian, Indonesian,
// Turkish, Kazakh, Vietnamese, Russian, English), not a generic
// underscore-to-space substitution — see
// docs/research/2026-08-31-fge2-slug-title-audit.md for the sibling-row
// comparison this was based on.
const RENAMES: ReadonlyArray<{
  videoId: string
  languageId: string
  oldValue: string
  newValue: string
}> = [
  {
    videoId: '2_0-Brand_Video',
    languageId: '529',
    oldValue: 'Brand_Video',
    newValue: 'Brand Video'
  },
  {
    videoId: '2_0-La_Busqueda_The_Search',
    languageId: '496',
    oldValue: 'La_Busqueda_La Recherche\n',
    newValue: 'La Búsqueda - La Recherche'
  }
]

export type FixUnderscoreVideoTitlesResult = {
  videoId: string
  languageId: string
  updated: boolean
  /** True when the title row didn't exist in this database at all (e.g. a
   *  staging snapshot that predates it) — distinct from a no-op where the
   *  row exists but was already fixed. */
  titleNotFound?: boolean
}[]

export async function fixUnderscoreVideoTitles(): Promise<FixUnderscoreVideoTitlesResult> {
  const results: FixUnderscoreVideoTitlesResult = []

  for (const { videoId, languageId, oldValue, newValue } of RENAMES) {
    const title = await prisma.videoTitle.findUnique({
      where: { videoId_languageId: { videoId, languageId } },
      select: { id: true, value: true }
    })

    if (title == null) {
      results.push({ videoId, languageId, updated: false, titleNotFound: true })
      continue
    }

    // Compared trimmed: fix-whitespace-video-titles.ts (same PR) strips
    // leading/trailing whitespace from every VideoTitle row, including this
    // one's trailing newline, so an exact match would silently stop working
    // if that script runs first on a future rerun.
    const updated = title.value.trim() === oldValue.trim()
    if (updated) {
      await prisma.videoTitle.update({
        where: { id: title.id },
        data: { value: newValue }
      })
      await videoCacheReset(videoId)
    }

    results.push({ videoId, languageId, updated })
  }

  return results
}
