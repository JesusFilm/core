import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import {
  createImageByDirectUpload,
  createImageFromUrl,
  deleteImage
} from './service'

builder.prismaObject('CloudflareImage', {
  fields: (t) => ({
    id: t.exposeID('id'),
    uploadUrl: t.exposeString('uploadUrl', { nullable: true }),
    userId: t.exposeID('userId'),
    createdAt: t.expose('createdAt', {
      type: 'Date'
    })
  })
})

builder.queryFields((t) => ({
  getMyCloudflareImages: t.prismaField({
    type: ['CloudflareImage'],
    authScopes: {
      isAuthenticated: true
    },
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _root, { offset, limit }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      return await prisma.cloudflareImage.findMany({
        ...query,
        where: { userId },
        take: limit ?? undefined,
        skip: offset ?? undefined
      })
    }
  }),
  getMyCloudflareImage: t.prismaField({
    type: 'CloudflareImage',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _root, { id }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      return await prisma.cloudflareImage.findFirstOrThrow({
        ...query,
        where: { id, userId }
      })
    }
  })
}))

builder.mutationFields((t) => ({
  createCloudflareUploadByFile: t.prismaField({
    type: 'CloudflareImage',
    authScopes: {
      isAuthenticated: true
    },
    resolve: async (query, _root, _args, { userId }) => {
      if (userId == null) throw new Error('User not found')

      const { id, uploadURL } = await createImageByDirectUpload({ userId })

      return await prisma.cloudflareImage.create({
        ...query,
        data: {
          id,
          uploadUrl: uploadURL,
          userId
        }
      })
    }
  }),
  createCloudflareUploadByUrl: t.prismaField({
    type: 'CloudflareImage',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      url: t.arg.string({ required: true })
    },
    resolve: async (query, _root, { url }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      const { id } = await createImageFromUrl(url, { userId, url })

      return await prisma.cloudflareImage.create({
        ...query,
        data: {
          id,
          userId,
          uploaded: true
        }
      })
    }
  }),
  deleteCloudflareImage: t.boolean({
    authScopes: {
      isAuthenticated: true
    },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_root, { id }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      await prisma.cloudflareImage.findUniqueOrThrow({
        where: { id, userId }
      })

      await deleteImage(id)

      await prisma.cloudflareImage.delete({ where: { id } })
      return true
    }
  }),
  cloudflareUploadComplete: t.boolean({
    authScopes: {
      isAuthenticated: true
    },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_root, { id }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      await prisma.cloudflareImage.update({
        where: { id, userId },
        data: { uploaded: true }
      })

      return true
    }
  })
}))
