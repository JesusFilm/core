import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { VideoSource, VideoSourceShape } from '../../videoSource/videoSource'

import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo,
  getVideo
} from './service'

const CloudflareVideo = builder.prismaObject('CloudflareVideo', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    source: t.field({
      type: VideoSource,
      shareable: true,
      resolve: () => VideoSourceShape.cloudflare
    }),
    primaryLanguageId: t.id({
      nullable: true,
      shareable: true,
      resolve: () => null
    }),
    uploadUrl: t.exposeString('uploadUrl'),
    userId: t.exposeID('userId', { nullable: false }),
    createdAt: t.expose('createdAt', {
      type: 'Date',
      nullable: false
    }),
    readyToStream: t.exposeBoolean('readyToStream', { nullable: false })
  })
})

builder.queryFields((t) => ({
  getMyCloudflareVideos: t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['CloudflareVideo'],
    nullable: false,
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _root, { offset, limit }, { user }) => {
      return await prisma.cloudflareVideo.findMany({
        ...query,
        where: { userId: user.id },
        take: limit ?? undefined,
        skip: offset ?? undefined
      })
    }
  }),
  getMyCloudflareVideo: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'CloudflareVideo',
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _root, { id }, { user }) => {
      const video = await prisma.cloudflareVideo.findFirstOrThrow({
        ...query,
        where: { id, userId: user.id }
      })

      if (!video.readyToStream) {
        const cloudflareVideo = await getVideo(id)

        if (cloudflareVideo.readyToStream === true) {
          return await prisma.cloudflareVideo.update({
            ...query,
            where: { id },
            data: {
              readyToStream: true
            }
          })
        }
      }
      return video
    }
  })
}))

builder.mutationFields((t) => ({
  createCloudflareVideoUploadByFile: t
    .withAuth({ isAuthenticated: true })
    .prismaField({
      type: 'CloudflareVideo',
      nullable: false,
      args: {
        uploadLength: t.arg({ type: 'Int', required: true }),
        name: t.arg({ type: 'String', required: true })
      },
      resolve: async (query, _root, { uploadLength, name }, { user }) => {
        const { id, uploadUrl } = await createVideoByDirectUpload(
          uploadLength,
          name,
          user.id
        )

        return await prisma.cloudflareVideo.create({
          ...query,
          data: {
            id,
            uploadUrl,
            userId: user.id,
            name
          }
        })
      }
    }),
  createCloudflareVideoUploadByUrl: t
    .withAuth({ isAuthenticated: true })
    .prismaField({
      type: 'CloudflareVideo',
      nullable: false,
      args: {
        url: t.arg({ type: 'String', required: true })
      },
      resolve: async (query, _root, { url }, { user }) => {
        const { uid: id } = await createVideoFromUrl(url, user.id)

        return await prisma.cloudflareVideo.create({
          ...query,
          data: {
            id,
            userId: user.id
          }
        })
      }
    }),
  deleteCloudflareVideo: t.withAuth({ isAuthenticated: true }).boolean({
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_root, { id }, { user, currentRoles }) => {
      const where: Prisma.CloudflareVideoWhereUniqueInput = { id }
      if (!currentRoles.includes('publisher')) {
        where.userId = user.id
      }
      const video = await prisma.cloudflareVideo.findUniqueOrThrow({
        where
      })

      // only delete cloudflare asset if original user
      if (video.userId === user.id) await deleteVideo(id)

      await prisma.cloudflareVideo.delete({ where: { id } })

      return true
    }
  })
}))

builder.asEntity(CloudflareVideo, {
  key: builder.selection<{ id: string; primaryLanguageId: string }>(
    'id primaryLanguageId'
  ),
  resolveReference: async ({ id }) =>
    await prisma.cloudflareVideo.findUniqueOrThrow({ where: { id } })
})
