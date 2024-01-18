import algoliasearch from 'algoliasearch'

import { PrismaClient } from '.prisma/api-videos-client'

import { Translation } from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID ?? '',
  process.env.ALGOLIA_API_KEY ?? ''
)

export async function syncVideosWithAlgolia(): Promise<void> {
  console.log('syncing videos to algolia...')

  let offset = 0
  let nextPage = true

  const startTime = new Date().getTime()

  while (nextPage) {
    const videos = await prisma.video.findMany({
      take: 11,
      skip: offset,
      include: { variants: { take: 5 }, title: true }
    })

    const transformedVideos = videos.map((video) => {
      return {
        objectID: video.id,
        titles: video.title.map((title) => title.value),
        description: (video.description as unknown as Translation)[0].value,
        label: video.label,
        image: video.image,
        imageAlt: (video.imageAlt as unknown as Translation)[0].value,
        childrenCount: video.childIds.length,
        snippet: (video.snippet as unknown as Translation)[0].value,
        slug: video.slug,
        duration: video.variants[0].duration,
        variants: video.variants.map((variant) => ({
          slug: variant.slug,
          languageId: variant.languageId
        }))
      }
    })

    const duration = new Date().getTime() - startTime
    console.log('syncVideosWithAlgolia duration(s):', duration * 0.001)
    console.log('syncVideosWithAlgolia page:', offset)

    const index = client.initIndex('videos')
    await index.saveObjects(transformedVideos).wait()

    if (videos.length === 11) offset += 10
    else nextPage = false
  }

  console.log('synced videos to algolia')
}
