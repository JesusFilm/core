import { prisma } from '@core/prisma/media/client'

import { videoCacheReset } from '../lib/videoCacheReset'

// FGE-2: 523 VideoTitle rows across 271 videos carry leading/trailing
// whitespace (likely a Crowdin export/import artifact), never on a slug, so
// never URL-breaking. Unlike the other FGE-2 fixes this one is fully
// mechanical and safe to apply catalog-wide: trimming can never change what
// a title says. See docs/research/2026-08-31-fge2-slug-title-audit.md.
const WHITESPACE_RE = /^\s|\s$/

export type FixWhitespaceVideoTitlesResult = {
  scanned: number
  updated: number
  videoIdsInvalidated: string[]
}

export async function fixWhitespaceVideoTitles(): Promise<FixWhitespaceVideoTitlesResult> {
  const titles = await prisma.videoTitle.findMany({
    select: { id: true, videoId: true, value: true }
  })

  const touchedVideoIds = new Set<string>()
  let updated = 0

  for (const title of titles) {
    if (!WHITESPACE_RE.test(title.value)) continue

    await prisma.videoTitle.update({
      where: { id: title.id },
      data: { value: title.value.trim() }
    })
    touchedVideoIds.add(title.videoId)
    updated++
  }

  for (const videoId of touchedVideoIds) {
    await videoCacheReset(videoId)
  }

  return {
    scanned: titles.length,
    updated,
    videoIdsInvalidated: [...touchedVideoIds]
  }
}
