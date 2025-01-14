import 'cloudflare/shims/node'

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import Cloudflare from 'cloudflare'
import Mux from '@mux/mux-node'
import fetch from 'node-fetch'
import { Logger } from 'pino'
import { graphql } from '../../../lib/graphql/gatewayGraphql'

import { prisma } from '../../../lib/prisma'

export function getClient(): Cloudflare {
  if (process.env.CLOUDFLARE_STREAM_TOKEN == null)
    throw new Error('Missing CLOUDFLARE_STREAM_TOKEN')

  return new Cloudflare({
    apiToken: process.env.CLOUDFLARE_STREAM_TOKEN,
    fetch
  })
}

function getMuxClient(): Mux {
  if (process.env.MUX_UGC_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_UGC_ACCESS_TOKEN_ID')

  if (process.env.MUX_UGC_SECRET_KEY == null)
    throw new Error('Missing MUX_UGC_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_UGC_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_UGC_SECRET_KEY
  })
}

const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'x-graphql-client-name': 'api-media',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

export const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

export const UPDATE_VIDEO_BLOCK = graphql(`
  mutation UpdateVideoBlock($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
    }
  }
`)

export async function service(logger?: Logger): Promise<void> {
  await createCloudflareDownloads(logger)
  await migrateCloudflareVideosToMux(logger)
}

async function createCloudflareDownloads(logger?: Logger): Promise<void> {
  let done = false
  let page = 0
  const cloudflare = getClient()
  logger?.info('Starting Cloudflare download creator')
  while (!done) {
    logger?.info(`Processing cloudflare page ${page}`)
    const skip = page * 100
    const videos = await prisma.cloudflareVideo.findMany({
      select: { id: true },
      where: {
        downloadable: false
      },
      take: 100,
      skip
    })
    page++
    done = videos.length < 100
    for (const video of videos) {
      await cloudflare.stream.downloads.create(video.id, {
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string,
        body: {}
      })
      await prisma.cloudflareVideo.update({
        where: {
          id: video.id
        },
        data: {
          downloadable: true
        }
      })
    }
  }
  logger?.info('Cloudflare download creator complete')
}

async function migrateCloudflareVideosToMux(logger?: Logger): Promise<void> {
  const cloudflare = getClient()
  const mux = getMuxClient()
  logger?.info('Starting Cloudflare upload to Mux')
  let done = false
  let page = 0
  while (!done) {
    const skip = page * 100
    const videos = await prisma.cloudflareVideo.findMany({
      where: {
        downloadable: true
      },
      take: 100,
      skip
    })
    page++
    done = videos.length < 100
    for (const video of videos) {
      const cfVideo = await cloudflare.stream.downloads.get(video.id, {
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string
      })
      if (cfVideo == null) continue
      logger?.info(`Processing cloudflare video ${video.id}`)
      const muxVideo = await mux.video.assets.create({
        input: [
          {
            url: cfVideo as string
          }
        ],
        encoding_tier: 'smart',
        playback_policy: ['public'],
        max_resolution_tier: '1080p'
      })
      await prisma.muxVideo.create({
        data: {
          id: muxVideo.id,
          createdAt: video.createdAt,
          updatedAt: new Date(),
          readyToStream: false,
          userId: video.userId
        }
      })
      let processing = false
      while (processing) {
        await new Promise(f => setTimeout(f, 10000)) // wait 10 seconds
        const asset = await mux.video.assets.retrieve(muxVideo.id)
        if (asset.status === 'ready' && asset.playback_ids?.[0].id != null) {
          try {
            await prisma.muxVideo.update({
              where: {
                id: muxVideo.id
              },
              data: {
                playbackId: asset.playback_ids[0].id,
                readyToStream: true
              }
            })
            await apollo.mutate({
              mutation: UPDATE_VIDEO_BLOCK,
              variables: {
                input: {
                  id: video.id,
                  videoId: muxVideo.id,
                  source: 'mux'
                }
              }
            })
            await prisma.cloudflareVideo.delete({
              where: { id: video.id }
            })
          } catch (error) {
            logger?.error(error, `unable to migrate cloudflare video ${video.id}`)
          }
          processing = false
        }
      }
    }
  }
}