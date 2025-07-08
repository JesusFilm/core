import { AssetOptions } from '@mux/mux-node/resources/video/assets'
import { GraphQLError } from 'graphql'

import { Prisma, VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { VideoSource, VideoSourceShape } from '../../videoSource/videoSource'

import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo,
  downloadsReadyToStore,
  enableDownload,
  getHighestResolutionDownload,
  getUpload,
  getVideo,
  mapStaticResolutionTierToDownloadQuality
} from './service'

const MuxVideo = builder.prismaObject('MuxVideo', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name'),
    source: t.field({
      type: VideoSource,
      shareable: true,
      resolve: () => VideoSourceShape.mux
    }),
    primaryLanguageId: t.id({
      nullable: true,
      shareable: true,
      resolve: () => null
    }),
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
    readyToStream: t.exposeBoolean('readyToStream', { nullable: false }),
    downloadable: t.exposeBoolean('downloadable', { nullable: false }),
    videoVariants: t.relation('videoVariants', { nullable: false })
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
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })

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
      id: t.arg({ type: 'ID', required: true }),
      userGenerated: t.arg({ type: 'Boolean', required: false })
    },
    resolve: async (
      query,
      _root,
      { id, userGenerated },
      { user, currentRoles }
    ) => {
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const isUserGenerated = !currentRoles.includes('publisher')
        ? true
        : (userGenerated ?? true)
      let video = await prisma.muxVideo.findFirstOrThrow({
        ...query,
        where: { id, userId: user.id }
      })

      if (video.assetId == null && video.uploadId != null) {
        const muxUpload = await getUpload(video.uploadId, isUserGenerated)
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
        const muxVideo = await getVideo(video.assetId, isUserGenerated)

        if (
          muxVideo.status === 'ready' &&
          muxVideo.playback_ids?.[0].id != null &&
          downloadsReadyToStore(muxVideo)
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
          // Auto add downloads for all available resolutions (size will be updated later)
          if (muxVideo.static_renditions?.files != null) {
            const validDownloads: Prisma.VideoVariantDownloadCreateManyInput[] =
              muxVideo.static_renditions.files
                .filter(
                  (file) =>
                    file != null &&
                    file.resolution_tier != null &&
                    file.status !== 'skipped' &&
                    file.status !== 'errored' &&
                    mapStaticResolutionTierToDownloadQuality(
                      file.resolution_tier
                    ) != null
                )
                .map((file) => ({
                  muxVideoId: video.id,
                  quality: mapStaticResolutionTierToDownloadQuality(
                    file.resolution_tier as AssetOptions.StaticRendition['resolution']
                  ) as VideoVariantDownloadQuality,
                  url: `https://stream.mux.com/${muxVideo.playback_ids?.[0].id}/${file.resolution_tier}.mp4`,
                  version: 1,
                  size: file.filesize ? parseInt(file.filesize) : 0,
                  height: file.height ?? 0,
                  width: file.width ?? 0,
                  bitrate: file.bitrate ?? 0
                }))
            if (validDownloads.length > 0) {
              // find the highest quality by enum up to uhd since mux doesn't generate highest enum
              const highest = getHighestResolutionDownload(validDownloads)
              const data = [...validDownloads, highest]
              await prisma.videoVariantDownload.createMany({
                data: data
              })
            }
          }
        }
      }
      return video
    }
  }),
  getMuxVideo: t.prismaField({
    type: 'MuxVideo',
    nullable: true,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      userGenerated: t.arg({ type: 'Boolean', required: false })
    },
    resolve: async (query, _parent, { id, userGenerated }) => {
      let video = await prisma.muxVideo.findFirstOrThrow({
        ...query,
        where: { id }
      })
      const isUserGenerated = userGenerated ?? true

      if (video.assetId == null && video.uploadId != null) {
        const muxUpload = await getUpload(video.uploadId, isUserGenerated)
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
        const muxVideo = await getVideo(video.assetId, isUserGenerated)

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
        name: t.arg({ type: 'String', required: true }),
        userGenerated: t.arg({ type: 'Boolean', required: false }),
        downloadable: t.arg({
          type: 'Boolean',
          required: false,
          defaultValue: false
        })
      },
      resolve: async (
        query,
        _root,
        { name, userGenerated, downloadable },
        { user, currentRoles }
      ) => {
        if (user == null)
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        const isUserGenerated = !currentRoles.includes('publisher')
          ? true
          : (userGenerated ?? true)
        const { id, uploadUrl } = await createVideoByDirectUpload(
          isUserGenerated,
          undefined,
          downloadable ?? false
        )

        return await prisma.muxVideo.create({
          ...query,
          data: {
            uploadId: id,
            uploadUrl,
            userId: user.id,
            name,
            downloadable: downloadable ?? false
          }
        })
      }
    }),
  createMuxVideoUploadByUrl: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'MuxVideo',
    nullable: false,
    args: {
      url: t.arg({ type: 'String', required: true }),
      userGenerated: t.arg({ type: 'Boolean', required: false }),
      downloadable: t.arg({
        type: 'Boolean',
        required: false,
        defaultValue: false
      })
    },
    resolve: async (
      query,
      _root,
      { url, userGenerated, downloadable },
      { user, currentRoles }
    ) => {
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const isUserGenerated = !currentRoles.includes('publisher')
        ? true
        : (userGenerated ?? true)

      const { id } = await createVideoFromUrl(
        url,
        isUserGenerated,
        undefined,
        downloadable ?? false
      )

      return await prisma.muxVideo.create({
        ...query,
        data: {
          assetId: id,
          userId: user.id,
          downloadable: downloadable ?? false
        }
      })
    }
  }),
  enableMuxDownload: t.withAuth({ isPublisher: true }).prismaField({
    type: 'MuxVideo',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      resolution: t.arg({ type: 'String', required: false })
    },
    resolve: async (query, _root, { id, resolution }, { user }) => {
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      const res = resolution ?? '1080p'
      if (!['1080p', '720p', '360p', '270p'].includes(res)) {
        throw new GraphQLError('Invalid resolution', {
          extensions: { code: 'BAD_REQUEST' }
        })
      }
      const video = await prisma.muxVideo.findUniqueOrThrow({
        where: { id }
      })
      if (video.assetId == null) {
        throw new GraphQLError('Asset not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      await enableDownload(video.assetId, false, res)
      return await prisma.muxVideo.update({
        ...query,
        where: { id },
        data: {
          downloadable: true
        }
      })
    }
  }),
  deleteMuxVideo: t.withAuth({ isAuthenticated: true }).boolean({
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      userGenerated: t.arg({ type: 'Boolean', required: false })
    },
    resolve: async (_root, { id, userGenerated }, { user, currentRoles }) => {
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const where: Prisma.MuxVideoWhereUniqueInput = { id }
      const isUserGenerated = !currentRoles.includes('publisher')
        ? true
        : (userGenerated ?? true)
      if (!currentRoles.includes('publisher')) {
        where.userId = user.id
      }
      await prisma.muxVideo.findUniqueOrThrow({
        where
      })

      await deleteVideo(id, isUserGenerated)

      await prisma.muxVideo.delete({ where: { id } })

      return true
    }
  })
}))

builder.asEntity(MuxVideo, {
  key: builder.selection<{ id: string; primaryLanguageId: string }>(
    'id primaryLanguageId'
  ),
  resolveReference: async ({ id }) =>
    await prisma.muxVideo.findUniqueOrThrow({ where: { id } })
})
