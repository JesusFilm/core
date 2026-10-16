import { prisma } from '@core/prisma/media/client'

import { videoCacheReset, videoVariantCacheReset } from '../lib/videoCacheReset'

// FGE-2: these videos were imported with internal-style, underscore-joined
// slugs instead of the public-style slug used elsewhere (same bug class as
// FGE-97/98's "Know God" fix, which this script does not repeat). New slugs
// are convertToSlug() of the video's own English title (or, where no title
// exists, of the old slug text) — see docs/research/2026-08-31-fge2-slug-title-audit.md
// for the full-catalog audit this was sourced from.
const RENAMES: ReadonlyArray<{
  videoId: string
  oldSlug: string
  newSlug: string
}> = [
  {
    videoId: '7_KnowGod0401',
    oldSlug: 'Know_God_1_Created',
    newSlug: 'know-god-episode-1-created'
  },
  {
    videoId: '7_KnowGod0402',
    oldSlug: 'Know_God_2_Sin',
    newSlug: 'know-god-episode-2-sin'
  },
  {
    videoId: '7_KnowGod0403',
    oldSlug: 'Know_God_3_Jesus',
    newSlug: 'know-god-episode-3-jesus'
  },
  {
    videoId: '7_KnowGod0404',
    oldSlug: 'Know_God_4_Invited',
    newSlug: 'know-god-episode-4-invited'
  },
  {
    videoId: '16_ShineFilmColl',
    oldSlug: 'shine_films_collection',
    newSlug: 'shine-films-collection'
  },
  {
    videoId: '2_2026AppUpdate',
    oldSlug: 'April2026_app_update',
    newSlug: 'april-2026-app-update'
  },
  {
    videoId: '2_DamtewStormsofLifeVert',
    oldSlug: 'Damtew_StormsofLife_Vert',
    newSlug: 'damtew-storms-of-life-devo'
  },
  {
    videoId: '2_harsh_vibe_explanation',
    oldSlug: '2_Rescue_Explanation',
    newSlug: 'explanation-of-harsh-vibe'
  },
  { videoId: 'Rescue', oldSlug: '2_Rescue', newSlug: 'rescue' },
  {
    videoId: '2_PrayingHandsVert',
    oldSlug: 'praying_hands_vert',
    newSlug: 'praying-hands-vertical'
  },
  {
    videoId: 'global_soccer_event_collection',
    oldSlug: 'soccer_event_collection',
    newSlug: 'global-football-soccer-event'
  }
]

export type FixUnderscoreVideoSlugsResult = {
  videoId: string
  videoUpdated: boolean
  variantIdsUpdated: string[]
  /** True when the video didn't exist in this database at all (e.g. a
   *  staging snapshot that predates it) — distinct from a no-op where the
   *  video exists but was already fixed. */
  videoNotFound?: boolean
}[]

export async function fixUnderscoreVideoSlugs(): Promise<FixUnderscoreVideoSlugsResult> {
  const results: FixUnderscoreVideoSlugsResult = []

  for (const { videoId, oldSlug, newSlug } of RENAMES) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        slug: true,
        variants: { select: { id: true, slug: true } }
      }
    })

    if (video == null) {
      results.push({
        videoId,
        videoUpdated: false,
        variantIdsUpdated: [],
        videoNotFound: true
      })
      continue
    }

    const videoUpdated = video.slug === oldSlug
    if (videoUpdated) {
      await prisma.video.update({
        where: { id: videoId },
        data: { slug: newSlug }
      })
      await videoCacheReset(videoId)
    }

    const variantIdsUpdated: string[] = []
    for (const variant of video.variants) {
      if (!variant.slug.startsWith(`${oldSlug}/`)) continue

      await prisma.videoVariant.update({
        where: { id: variant.id },
        data: { slug: variant.slug.replace(`${oldSlug}/`, `${newSlug}/`) }
      })
      await videoVariantCacheReset(variant.id)
      variantIdsUpdated.push(variant.id)
    }

    results.push({ videoId, videoUpdated, variantIdsUpdated })
  }

  return results
}
