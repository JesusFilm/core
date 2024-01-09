import algoliasearch from 'algoliasearch'

import { PrismaClient } from '.prisma/api-videos-client'

import { Translation } from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

const client = algoliasearch('FJYYBFHBHS', '')

export async function algolia(): Promise<void> {
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
      duration: videoVariants.find((videoVariant)=> videoVariant.videoId === video.id)
      ?.duration,
      childrenCount: video.childIds.length,  
      snippet: (video.snippet as unknown as Translation)[0].value,
      slug: video.slug,
    }
  })

  const index = client.initIndex('watch_videos')
  await index.saveObject(transformedVideo).wait()
  await index.search('watch_videos').then(({ hits }) => console.log(hits[0]))
  console.log('finished algolia seeding')
}
