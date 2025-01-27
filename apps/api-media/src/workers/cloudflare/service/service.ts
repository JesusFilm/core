import 'cloudflare/shims/node'

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import Mux from '@mux/mux-node'
import Cloudflare from 'cloudflare'
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
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-media',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

export const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

export const UPDATE_VIDEO_BLOCK = graphql(`
  mutation VideoBlockCloudflareToMux($id: ID!) {
    videoBlockCloudflareToMux(id: $id)
  }
`)

export const CLOUDFLARE_VIDEO_BLOCK_IDS = graphql(`
  query VideoBlockCloudflareIds {
    cloudflareVideoBlockIds
  }
`)

export async function service(logger?: Logger): Promise<void> {
  await fixMissingCloudflareVideos(logger)
  await createCloudflareDownloads(logger)
  await migrateCloudflareVideosToMux(logger)
}

async function getCloudflareVideo(
  cloudflare: Cloudflare,
  videoId: string
): Promise<any> {
  try {
    return await cloudflare.stream.get(videoId, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string
    })
  } catch {
    return undefined
  }
}

async function getCloudflareVideoDownloadUrl(
  cloudflare: Cloudflare,
  videoId: string
): Promise<string | undefined> {
  try {
    const cfVideo = (await cloudflare.stream.downloads.get(videoId, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string
    })) as { default?: { url: string } }

    return cfVideo?.default?.url
  } catch {
    return undefined
  }
}

export async function createCloudflareDownloads(
  logger?: Logger
): Promise<void> {
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
        readyToStream: true,
        downloadable: false
      },
      take: 100,
      skip
    })
    page++
    done = videos.length < 100
    for (const video of videos) {
      const existing = await getCloudflareVideo(cloudflare, video.id)
      if (existing == null) continue

      const cfDownloadUrl = await getCloudflareVideoDownloadUrl(
        cloudflare,
        video.id
      )

      if (cfDownloadUrl == null || cfDownloadUrl == '') {
        await cloudflare.stream.downloads.create(video.id, {
          account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string,
          body: {}
        })
      }
      let processing = true
      let count = 0
      while (processing && count < 90) {
        // only try for 15 minutes {
        count++
        await new Promise((f) => setTimeout(f, 10000)) // wait 10 seconds
        const cfDownloadUrl = await getCloudflareVideoDownloadUrl(
          cloudflare,
          video.id
        )
        if (cfDownloadUrl != null && cfDownloadUrl !== '') {
          await prisma.cloudflareVideo.update({
            where: {
              id: video.id
            },
            data: {
              downloadable: true
            }
          })
          processing = false
        }
      }
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
      logger?.info(`Processing cloudflare video ${video.id}`)
      const existing = await prisma.muxVideo.findUnique({
        select: { id: true, assetId: true, readyToStream: true },
        where: {
          id: video.id
        }
      })

      let muxVideoAssetId = existing?.assetId

      if (existing == null) {
        const cfDownloadUrl = await getCloudflareVideoDownloadUrl(
          cloudflare,
          video.id
        )
        if (cfDownloadUrl == null) continue

        const muxVideo = await mux.video.assets.create({
          input: [
            {
              url: cfDownloadUrl
            }
          ],
          encoding_tier: 'smart',
          playback_policy: ['public'],
          max_resolution_tier: '1080p'
        })
        muxVideoAssetId = muxVideo.id

        const data = {
          id: video.id,
          assetId: muxVideo.id,
          createdAt: video.createdAt,
          updatedAt: new Date(),
          readyToStream: false,
          userId: video.userId
        }
        await prisma.muxVideo.upsert({
          where: { id: video.id },
          create: data,
          update: data
        })
      }

      if (muxVideoAssetId == null || existing?.readyToStream) continue

      let processing = true
      let count = 0
      while (processing && count < 90) {
        // only try for 15 minutes {
        count++
        await new Promise((f) => setTimeout(f, 10000)) // wait 10 seconds
        const asset = await mux.video.assets.retrieve(muxVideoAssetId)
        if (asset.status === 'ready' && asset.playback_ids?.[0].id != null) {
          try {
            await prisma.muxVideo.update({
              where: {
                id: video.id
              },
              data: {
                playbackId: asset.playback_ids[0].id,
                readyToStream: true
              }
            })
            await apollo.mutate({
              mutation: UPDATE_VIDEO_BLOCK,
              variables: {
                id: video.id
              }
            })
          } catch (error) {
            logger?.error(
              error,
              `unable to migrate cloudflare video ${video.id}`
            )
          }
          processing = false
        }
      }
    }
  }
}

async function fixMissingCloudflareVideos(logger?: Logger): Promise<void> {
  logger?.info('Fixing missing cloudflare videos')
  const data = await apollo.query({
    query: CLOUDFLARE_VIDEO_BLOCK_IDS
  })

  const existingCfVideos = await prisma.cloudflareVideo.findMany({
    select: { id: true }
  })

  const existingCfVideoIds = existingCfVideos.map(({ id }) => id)

  const missingCfVideoIds = data.data.cloudflareVideoBlockIds.filter(
    (id) => !existingCfVideoIds.includes(id)
  )
  logger?.info(`Found ${missingCfVideoIds.length} missing cloudflare videos`)

  for (const id of missingCfVideoIds) {
    await prisma.cloudflareVideo.upsert({
      where: { id },
      update: {},
      create: {
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        readyToStream: true,
        userId: 'system'
      }
    })
  }
  logger?.info('Missing cloudflare videos fixed')
}
