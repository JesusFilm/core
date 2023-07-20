// version 2
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { PrismaClient, Prisma } from '.prisma/api-videos-client'
import omit from 'lodash/omit'
import { fetchMediaComponentsAndTransformToVideos } from '../src/libs/arclight'
import { fetchMediaLanguagesAndTransformToLanguages } from '../src/libs/arclight/arclight'

const prisma = new PrismaClient()

async function getVideoSlugs(): Promise<Record<string, string>> {
  const results = await prisma.video.findMany({
    select: { slug: true, id: true }
  })

  const slugs: Record<string, string> = {}
  for await (const video of results) {
    if (video.slug != null) slugs[video.slug] = video.id
  }
  return slugs
}
async function importMediaComponents(): Promise<void> {
  const usedVideoSlugs: Record<string, string> = await getVideoSlugs()
  const languages = await fetchMediaLanguagesAndTransformToLanguages()
  let videos: Array<
    Omit<Prisma.VideoUncheckedCreateInput, 'variants'> & {
      variants: Array<
        Omit<Prisma.VideoVariantUncheckedCreateInput, 'downloads'> & {
          downloads?: Prisma.VideoVariantDownloadUncheckedCreateInput[]
        }
      >
      childIds: string[]
    }
  >
  let page = 1
  const startTime = new Date().getTime()
  const videoChildIds: Record<string, string[]> = {}
  do {
    videos = await fetchMediaComponentsAndTransformToVideos(
      languages,
      usedVideoSlugs,
      page
    )
    for (const video of videos) {
      if (video.id == null) continue
      // way too slow/clumsy to handle upserts of video variants and downloads individually
      await prisma.video.deleteMany({ where: { id: video.id } })
      await prisma.video.create({
        data: omit(video, ['childIds', 'variants'])
      })

      // nested limit can be reached if too much variant data
      for (const variant of video.variants) {
        const variantData = omit(variant, ['downloads'])
        await prisma.videoVariant.create({
          data: {
            ...variantData,
            videoId: video.id,
            downloads: {
              create: variant.downloads
            }
          }
        })
      }
      videoChildIds[video.id] = video.childIds
    }
    const duration = new Date().getTime() - startTime
    console.log('importMediaComponents duration(s):', duration * 0.001)
    console.log('importMediaComponents page:', page)
    page++
  } while (videos.length > 0)
  for (const [key, value] of Object.entries(videoChildIds)) {
    await prisma.video.update({
      where: { id: key },
      data: {
        children: { connect: value.map((id) => ({ id })) }
      }
    })
  }
}

async function main(): Promise<void> {
  console.log('importing mediaComponents as videos...')
  await importMediaComponents()
  console.log('mediaComponents imported')
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
