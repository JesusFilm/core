import { prisma } from '@core/prisma/media/client'

// FGE-97/98: the "Know God" video was imported with an internal-style slug
// (Nua_Know_God) instead of the public-style slug used by other videos.
const VIDEO_ID = '7_KnowGod'
const OLD_SLUG = 'Nua_Know_God'
const NEW_SLUG = 'know-god'

export type FixKnowGodSlugResult = {
  videoUpdated: boolean
  variantIdsUpdated: string[]
}

export async function fixKnowGodSlug(): Promise<FixKnowGodSlugResult> {
  const video = await prisma.video.findUniqueOrThrow({
    where: { id: VIDEO_ID },
    select: {
      slug: true,
      variants: { select: { id: true, slug: true } }
    }
  })

  const videoUpdated = video.slug === OLD_SLUG
  if (videoUpdated) {
    await prisma.video.update({
      where: { id: VIDEO_ID },
      data: { slug: NEW_SLUG }
    })
  }

  const variantIdsUpdated: string[] = []
  for (const variant of video.variants) {
    if (!variant.slug.startsWith(`${OLD_SLUG}/`)) continue

    await prisma.videoVariant.update({
      where: { id: variant.id },
      data: { slug: variant.slug.replace(`${OLD_SLUG}/`, `${NEW_SLUG}/`) }
    })
    variantIdsUpdated.push(variant.id)
  }

  return { videoUpdated, variantIdsUpdated }
}
