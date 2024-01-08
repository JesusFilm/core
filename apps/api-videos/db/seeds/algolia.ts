import algoliasearch from 'algoliasearch'

import { PrismaClient } from '.prisma/api-videos-client'

const prisma = new PrismaClient()

// hello_algolia.js

// Connect and authenticate with your Algolia app
const client = algoliasearch('FJYYBFHBHS', '')

// TODO: rename seed file
export async function algolia(): Promise<void> {
  console.log('starting algolia seed file')

  // this is grabbing data from postgres through prisma (ORM)
  const videos = await prisma.video.findMany()
  const videoTitles = await prisma.videoTitle.findMany()

  // logic that transforms the video to
  const transformedVideo = videos.map((video) => {
    return {
      title,
      description,
      label,
      image,
      imageAlt,
      duration,
      childrenCount,
      snippet,
      slug
    }
  })

  const index = client.initIndex('watch_videos')
  await index.saveObject(transformedVideo).wait()
  await index.search('watch_videos').then(({ hits }) => console.log(hits[0]))
  console.log('seeding finished')
}
