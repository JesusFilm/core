import { kMaxLength } from 'buffer'

import algoliasearch from 'algoliasearch'
import { LiteralLikeNode } from 'ts-morph'

import { PrismaClient } from '.prisma/api-videos-client'

import { Translation } from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

// hello_algolia.js

// Connect and authenticate with your Algolia app
const client = algoliasearch('FJYYBFHBHS', '')

// TODO: rename seed file
export async function algolia(): Promise<void> {
  console.log('starting algolia seed file')

  // this is grabbing data from postgres through prisma (ORM)
  const videos = await prisma.video.findMany()

  // get videotitle

  const videoTitles = await prisma.videoTitle.findMany()
  // console.log(videoTitles)

  // logic that transforms the video to the shape that we want
  const transformedVideo = videos.map((video) => {
    return {
      title: videoTitles.find((videoTitle) => videoTitle.videoId === video.id)
        ?.value,
      description: (video.description as unknown as Translation)[0].value
      // label,
      // image,
      // imageAlt,
      // duration,
      // childrenCount,
      // snippet,
      // slug
    }
  })

  console.log(transformedVideo)

  // const index = client.initIndex('watch_videos')
  // await index.saveObject(transformedVideo).wait()
  // await index.search('watch_videos').then(({ hits }) => console.log(hits[0]))
  // console.log('seeding finished')
}
