import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo
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
    resolve: async (query, _root, { offset, limit }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      return await prisma.cloudflareVideo.findMany({
        ...query,
        where: { userId },
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
    resolve: async (query, _root, { id }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      return await prisma.cloudflareVideo.findFirstOrThrow({
        ...query,
        where: { id, userId }
      })
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
    resolve: async (query, _root, { uploadLength, name }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      const { id, uploadUrl } = await createVideoByDirectUpload(
        uploadLength,
        name,
        userId
      )

      return await prisma.cloudflareVideo.create({
        ...query,
        data: {
          id,
          uploadUrl,
          userId,
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
    resolve: async (query, _root, { url }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      const { uid: id } = await createVideoFromUrl(url, userId)

      return await prisma.cloudflareVideo.create({
        ...query,
        data: {
          id,
          userId
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
    resolve: async (_root, { id }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      await prisma.cloudflareVideo.findUniqueOrThrow({
        where: { id, userId }
      })

      await deleteVideo(id)

      await prisma.cloudflareVideo.delete({ where: { id } })

      return true
    }
  })
}))
