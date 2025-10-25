import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/media/client'

import { queue as processVideoDownloadsQueue } from '../../../workers/processVideoDownloads/queue'
import { jobName as processVideoUploadsJobName } from '../../../workers/processVideoUploads/config'
import { queue as processVideoUploadsQueue } from '../../../workers/processVideoUploads/queue'
import { builder } from '../../builder'
import { VideoSource, VideoSourceShape } from '../../videoSource/videoSource'
import { getVideo } from '../services'

import { MaxResolutionTier } from './enums'
import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo,
  enableDownload,
  getMaxResolutionValue,
  getUpload
} from './service'

const FIVE_DAYS = 5 * 24 * 60 * 60

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

          // Queue download processing if the video is downloadable
          if (video.downloadable) {
            try {
              await processVideoDownloadsQueue.add(
                'process-video-downloads',
                {
                  videoId: video.id,
                  assetId: video.assetId,
                  isUserGenerated
                },
                {
                  jobId: `download:${video.id}`,
                  attempts: 3,
                  backoff: { type: 'exponential', delay: 1000 },
                  removeOnComplete: true,
                  removeOnFail: { age: FIVE_DAYS, count: 50 }
                }
              )
            } catch (error) {
              // Log error but don't fail the request - downloads can be processed later
              console.error(
                'Failed to queue video downloads processing:',
                error
              )
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
  createMuxVideoAndQueueUpload: t.withAuth({ isPublisher: true }).prismaField({
    type: 'MuxVideo',
    nullable: false,
    args: {
      videoId: t.arg({ type: 'ID', required: true }),
      edition: t.arg({ type: 'String', required: true }),
      languageId: t.arg({ type: 'ID', required: true }),
      version: t.arg({ type: 'Int', required: true }),
      r2PublicUrl: t.arg({ type: 'String', required: true }),
      originalFilename: t.arg({ type: 'String', required: true }),
      durationMs: t.arg({ type: 'Int', required: true }),
      duration: t.arg({ type: 'Int', required: true }),
      width: t.arg({ type: 'Int', required: true }),
      height: t.arg({ type: 'Int', required: true }),
      downloadable: t.arg({
        type: 'Boolean',
        required: false,
        defaultValue: true
      }),
      maxResolution: t.arg({
        type: MaxResolutionTier,
        required: false,
        defaultValue: 'fhd'
      })
    },
    resolve: async (
      query,
      _root,
      {
        videoId,
        edition,
        languageId,
        version,
        r2PublicUrl,
        originalFilename,
        durationMs,
        duration,
        width,
        height,
        downloadable
      },
      { user }
    ) => {
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const muxAsset = await createVideoFromUrl(
        r2PublicUrl,
        false,
        '2160p',
        downloadable ?? true
      )

      const muxVideo = await prisma.muxVideo.create({
        ...query,
        data: {
          assetId: muxAsset.id,
          userId: user.id,
          downloadable: downloadable ?? true
        }
      })

      try {
        await processVideoUploadsQueue.add(
          processVideoUploadsJobName,
          {
            videoId,
            edition,
            languageId,
            version,
            muxVideoId: muxVideo.id,
            metadata: {
              durationMs,
              duration,
              width,
              height
            },
            originalFilename
          },
          {
            jobId: `mux:${muxVideo.id}`,
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: { age: FIVE_DAYS, count: 50 }
          }
        )
      } catch (error) {
        console.error('Failed to queue video uploads processing:', error)
        try {
          await prisma.muxVideo.delete({
            where: { id: muxVideo.id }
          })
        } catch (cleanupError) {
          console.error('Failed to cleanup orphaned mux video:', cleanupError)
        }
      }

      return muxVideo
    }
  }),
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
        }),
        maxResolution: t.arg({
          type: MaxResolutionTier,
          required: false,
          defaultValue: 'fhd'
        })
      },
      resolve: async (
        query,
        _root,
        { name, userGenerated, downloadable, maxResolution },
        { user, currentRoles }
      ) => {
        if (user == null)
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        const isUserGenerated = !currentRoles.includes('publisher')
          ? true
          : (userGenerated ?? true)
        const maxResolutionValue = getMaxResolutionValue(maxResolution)
        const { id, uploadUrl } = await createVideoByDirectUpload(
          isUserGenerated,
          maxResolutionValue,
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
      }),
      maxResolution: t.arg({
        type: MaxResolutionTier,
        required: false,
        defaultValue: 'fhd'
      })
    },
    resolve: async (
      query,
      _root,
      { url, userGenerated, downloadable, maxResolution },
      { user, currentRoles }
    ) => {
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const isUserGenerated = !currentRoles.includes('publisher')
        ? true
        : (userGenerated ?? true)
      const maxResolutionValue = getMaxResolutionValue(maxResolution)

      const { id } = await createVideoFromUrl(
        url,
        isUserGenerated,
        maxResolutionValue,
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
