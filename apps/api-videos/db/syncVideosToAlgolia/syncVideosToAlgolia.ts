import algoliasearch from 'algoliasearch'

import { PrismaClient } from '.prisma/api-videos-client'

import { Translation } from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID ?? '',
  process.env.ALGOLIA_API_KEY ?? ''
)

export async function syncVideosToAlgolia(): Promise<void> {
  console.log('syncing videos to algolia...')

  let offset = 0
  let nextPage = true
  const totalRecords = await prisma.videoVariant.count()

  while (nextPage) {
    const videoVariants = await prisma.videoVariant.findMany({
      take: 15001,
      skip: offset,
      include: {
        video: { include: { title: true } },
        subtitle: true
      }
    })

    const transformedVideos = videoVariants.map((videoVariant) => {
      return {
        objectID: videoVariant.id,
        videoId: videoVariant.videoId,
        titles: videoVariant.video?.title.map((title) => title.value),
        description: (
          videoVariant.video?.description as unknown as Translation[]
        ).map((description) => description?.value),
        duration: videoVariant.duration,
        languageId: videoVariant.languageId,
        subtitles: videoVariant.subtitle.map((subtitle) => subtitle.languageId),
        slug: videoVariant.slug,
        label: videoVariant.video?.label,
        image: videoVariant.video?.image,
        imageAlt: (videoVariant.video?.imageAlt as unknown as Translation)[0]
          .value,
        childrenCount: videoVariant.video?.childIds.length
      }
    })

    const progress = Math.round(((offset + 1) / totalRecords) * 100)
    console.log('syncVideosWithAlgolia page:', offset)
    console.log(`algolia videos synced: ${progress}%`)

    const index = client.initIndex('video-variants')
    await index.saveObjects(transformedVideos).wait()

    if (videoVariants.length === 15001) offset += 15000
    else nextPage = false
  }

  console.log('synced videos to algolia')
}
