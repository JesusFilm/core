import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo,
  getUpload,
  getVideo
} from './service'

builder.prismaObject('MuxVideo', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    assetId: t.exposeString('assetId'),
    duration: t.exposeInt('duration'),
    uploadId: t.withAuth({ isAuthenticated: true }).exposeString('uploadId'),
    playbackId: t.exposeString('playbackId'),
    uploadUrl: t.withAuth({ isAuthenticated: true }).exposeString('uploadUrl'),
    userId: t
      .withAuth({ isAuthenticated: true })
      .exposeID('userId', { nullable: false }),
    createdAt: t.withAuth({ isAuthenticated: true }).expose('createdAt', {
      type: 'Date',
      nullable: false
    }),
    readyToStream: t.exposeBoolean('readyToStream', { nullable: false })
  })
})

builder.queryFields((t) => ({
  getMyMuxVideos: t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['MuxVideo'],
    nullable: false,
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _root, { offset, limit }, { user }) => {
      if (user == null) throw new Error('User not found')

      return await prisma.muxVideo.findMany({
        ...query,
        where: { userId: user.id },
        take: limit ?? undefined,
        skip: offset ?? undefined
      })
    }
  }),
  getMyMuxVideo: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'MuxVideo',
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _root, { id }, { user }) => {
      if (user == null) throw new Error('User not found')

      let video = await prisma.muxVideo.findFirstOrThrow({
        ...query,
        where: { id, userId: user.id }
      })

      if (video.assetId == null && video.uploadId != null) {
        const muxUpload = await getUpload(video.uploadId)
        if (muxUpload.asset_id != null) {
          video = await prisma.muxVideo.update({
            ...query,
            where: { id },
            data: {
              assetId: muxUpload.asset_id
            }
          })
        }
      }
      if (
        video.assetId != null &&
        (!video.readyToStream || video.playbackId == null)
      ) {
        const muxVideo = await getVideo(video.assetId)
        console.log('status', muxVideo.status)

        if (
          muxVideo.status === 'ready' &&
          muxVideo.playback_ids?.[0].id != null
        ) {
          video = await prisma.muxVideo.update({
            ...query,
            where: { id },
            data: {
              readyToStream: muxVideo.status === 'ready',
              playbackId: muxVideo.playback_ids?.[0].id,
              duration: Math.ceil(muxVideo.duration ?? 0)
            }
          })
        }
      }
      return video
    }
  }),
  getMuxVideo: t.prismaField({
    type: 'MuxVideo',
    nullable: true,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, { id }) => {
      let video = await prisma.muxVideo.findFirstOrThrow({
        ...query,
        where: { id }
      })

      if (video.assetId == null && video.uploadId != null) {
        const muxUpload = await getUpload(video.uploadId)
        if (muxUpload.asset_id != null) {
          video = await prisma.muxVideo.update({
            ...query,
            where: { id },
            data: {
              assetId: muxUpload.asset_id
            }
          })
        }
      }
      if (
        video.assetId != null &&
        (!video.readyToStream || video.playbackId == null)
      ) {
        const muxVideo = await getVideo(video.assetId)

        if (
          muxVideo.status === 'ready' &&
          muxVideo.playback_ids?.[0].id != null
        ) {
          video = await prisma.muxVideo.update({
            ...query,
            where: { id },
            data: {
              readyToStream: muxVideo.status === 'ready',
              playbackId: muxVideo.playback_ids?.[0].id,
              duration: Math.ceil(muxVideo.duration ?? 0)
            }
          })
        }
      }
      return video
    }
  })
}))

builder.mutationFields((t) => ({
  createMuxVideoUploadByFile: t
    .withAuth({ isAuthenticated: true })
    .prismaField({
      type: 'MuxVideo',
      nullable: false,
      args: {
        name: t.arg({ type: 'String', required: true })
      },
      resolve: async (query, _root, { name }, { user }) => {
        if (user == null) throw new Error('User not found')

        const { id, uploadUrl } = await createVideoByDirectUpload()

        return await prisma.muxVideo.create({
          ...query,
          data: {
            uploadId: id,
            uploadUrl,
            userId: user.id,
            name
          }
        })
      }
    }),
  createMuxVideoUploadByUrl: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'MuxVideo',
    nullable: false,
    args: {
      url: t.arg({ type: 'String', required: true })
    },
    resolve: async (query, _root, { url }, { user }) => {
      if (user == null) throw new Error('User not found')

      const { id } = await createVideoFromUrl(url)

      return await prisma.muxVideo.create({
        ...query,
        data: {
          assetId: id,
          userId: user.id
        }
      })
    }
  }),
  deleteMuxVideo: t.withAuth({ isAuthenticated: true }).boolean({
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_root, { id }, { user, currentRoles }) => {
      if (user == null) throw new Error('User not found')

      const where: Prisma.MuxVideoWhereUniqueInput = { id }
      if (!currentRoles.includes('publisher')) {
        where.userId = user.id
      }
      await prisma.muxVideo.findUniqueOrThrow({
        where
      })

      await deleteVideo(id)

      await prisma.muxVideo.delete({ where: { id } })

      return true
    }
  })
}))

enum VideoBlockSource {
  internal = 'internal',
  youTube = 'youTube',
  cloudflare = 'cloudflare',
  mux = 'mux'
}

builder.enumType(VideoBlockSource, { name: 'VideoBlockSource' })

builder
  .externalRef(
    'VideoBlock',
    builder.selection<{
      videoId: string
      source: VideoBlockSource
    }>('videoId source'),
    async (entity) => {
      if (entity.source === VideoBlockSource.mux) {
        const video = await prisma.muxVideo.findUnique({
          where: { id: entity.videoId },
          select: { assetId: true, playbackId: true }
        })
        return {
          ...entity,
          assetId: video?.assetId,
          playbackId: video?.playbackId
        }
      }

      return {
        ...entity,
        assetId: null,
        playbackId: null
      }
    }
  )
  .implement({
    externalFields: (t) => ({
      source: t.field({ type: VideoBlockSource, nullable: false }),
      videoId: t.id({ nullable: false })
    }),
    fields: (t) => ({
      playbackId: t.exposeID('playbackId', { nullable: true }),
      assetId: t.exposeID('assetId', { nullable: true })
    })
  })
