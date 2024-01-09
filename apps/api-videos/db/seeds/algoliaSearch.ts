import algoliasearch from 'algoliasearch'

import { PrismaClient } from '.prisma/api-videos-client'

import { Translation } from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

// update env key to be using actual JFP key
const client = algoliasearch(
  'FJYYBFHBHS',
  process.env.ALGOLIA_API_KEY_GERONIMO ?? ''
)

export async function algoliaSearch(): Promise<void> {
  console.log('starting algolia seed file')

  const videos = await prisma.video.findMany()
  const videoTitles = await prisma.videoTitle.findMany()
  const videoVariants = await prisma.videoVariant.findMany()

  const transformedVideo = videos.map((video) => {
    return {
      title: videoTitles.find((videoTitle) => videoTitle.videoId === video.id)
        ?.value,
      description: (video.description as unknown as Translation)[0].value,
      label: video.label,
      image: video.image,
      imageAlt: (video.imageAlt as unknown as Translation)[0].value,
      duration: videoVariants.find(
        (videoVariant) => videoVariant.videoId === video.id
      )?.duration,
      childrenCount: video.childIds.length,
      snippet: (video.snippet as unknown as Translation)[0].value,
      slug: video.slug,
      objectID: video.id
    }
  })

  const index = client.initIndex('watch_videos')
  await index.saveObjects(transformedVideo).wait()
  console.log('finished algolia seeding')
}
