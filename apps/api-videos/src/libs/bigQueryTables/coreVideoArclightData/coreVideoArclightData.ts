import { VideoLabel } from '../../../app/__generated__/graphql'
import { PrismaService } from '../../../app/lib/prisma.service'
import { slugify } from '../../slugify'

interface Row {
  id: string
  label: string
  primaryLanguageId: number
  image: string
  videoStill: string
  thumbnail: string
  mobile_cinematic_high: string
  mobile_cinematic_low: string
  mobile_cinematic_very_low: string
}

export async function coreVideoArclightData(
  row: Row,
  prismaService: PrismaService
): Promise<void> {
  let usedSlugs: Record<string, string> | undefined
  const ids: string[] = []
  if (usedSlugs == null) {
    usedSlugs = {}
    const results = await prismaService.video.findMany({
      select: { slug: true, id: true }
    })
    for await (const video of results) {
      ids.push(video.id)
      if (video.slug != null) usedSlugs[video.slug] = video.id
    }
  }
  const { id, label, primaryLanguageId, image } = row
  const title = await prismaService.videoTitle.findUnique({
    where: {
      videoId_languageId: {
        videoId: id,
        languageId: primaryLanguageId.toString()
      }
    }
  })
  let slug
  if (title != null) slug = slugify(id, title?.value, usedSlugs)

  const video = {
    id,
    label: VideoLabel[label],
    primaryLanguageId: primaryLanguageId.toString(),
    image,
    slug,
    noIndex: false
  }

  await prismaService.video.upsert({
    where: { id },
    update: { ...video, title: { connect: { id: title?.id } } },
    create: { ...video, title: { connect: { id: title?.id } } }
  })
}
