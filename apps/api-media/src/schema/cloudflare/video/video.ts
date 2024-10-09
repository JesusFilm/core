import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo,
  getVideo
} from './service'

builder.prismaObject('CloudflareVideo', {
  fields: (t) => ({
    id: t.exposeID('id'),
    uploadUrl: t.exposeString('uploadUrl', { nullable: true }),
    userId: t.exposeID('userId'),
    createdAt: t.expose('createdAt', {
      type: 'Date'
    }),
    readyToStream: t.exposeBoolean('readyToStream')
  })
})

builder.queryFields((t) => ({
  getMyCloudflareVideos: t.prismaField({
    type: ['CloudflareVideo'],
    authScopes: {
      isAuthenticated: true
    },
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _root, { offset, limit }, { user }) => {
      if (user == null) throw new Error('User not found')

      return await prisma.cloudflareVideo.findMany({
        ...query,
        where: { userId: user.id },
        take: limit ?? undefined,
        skip: offset ?? undefined
      })
    }
  }),
  getMyCloudflareVideo: t.prismaField({
    type: 'CloudflareVideo',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _root, { id }, { user }) => {
      if (user == null) throw new Error('User not found')

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
  createCloudflareVideoUploadByFile: t.prismaField({
    type: 'CloudflareVideo',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      uploadLength: t.arg({ type: 'Int', required: true }),
      name: t.arg({ type: 'String', required: true })
    },
    resolve: async (query, _root, { uploadLength, name }, { user }) => {
      if (user == null) throw new Error('User not found')

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
  createCloudflareVideoUploadByUrl: t.prismaField({
    type: 'CloudflareVideo',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      url: t.arg({ type: 'String', required: true })
    },
    resolve: async (query, _root, { url }, { user }) => {
      if (user == null) throw new Error('User not found')

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
  deleteCloudflareVideo: t.boolean({
    authScopes: {
      isAuthenticated: true
    },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_root, { id }, { user }) => {
      if (user == null) throw new Error('User not found')

      await prisma.cloudflareVideo.findUniqueOrThrow({
        where: { id, userId: user.id }
      })

      await deleteVideo(id)

      await prisma.cloudflareVideo.delete({ where: { id } })

      return true
    }
  })
}))
