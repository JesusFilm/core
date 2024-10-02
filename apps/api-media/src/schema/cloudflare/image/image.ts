import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import { ImageAspectRatio } from './enums'
import { ImageInput } from './inputs'
import {
  createImageByDirectUpload,
  createImageFromResponse,
  createImageFromText,
  createImageFromUrl,
  deleteImage
} from './service'

function baseUrl(id: string): string {
  return `https://imagedelivery.net/${
    process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
  }/${id}`
}

builder.prismaObject('CloudflareImage', {
  fields: (t) => ({
    id: t.exposeID('id'),
    uploadUrl: t.exposeString('uploadUrl', { nullable: true }),
    userId: t.exposeID('userId'),
    createdAt: t.expose('createdAt', {
      type: 'Date'
    }),
    aspectRatio: t.expose('aspectRatio', {
      type: ImageAspectRatio,
      nullable: true
    }),
    url: t.field({
      type: 'String',
      nullable: true,
      resolve: ({ id }) => baseUrl(id)
    }),
    mobileCinematicHigh: t.field({
      type: 'String',
      nullable: true,
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'banner'
          ? `${baseUrl(id)}/f=jpg,w=1280,h=600,q=95`
          : null
    }),
    mobileCinematicLow: t.field({
      type: 'String',
      nullable: true,
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'banner'
          ? `${baseUrl(id)}/f=jpg,w=640,h=300,q=95`
          : null
    }),
    mobileCinematicVeryLow: t.field({
      type: 'String',
      nullable: true,
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'banner'
          ? `${baseUrl(id)}/f=webp,w=640,h=300,quality=50`
          : null
    }),
    thumbnail: t.field({
      type: 'String',
      nullable: true,
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'hd' ? `${baseUrl(id)}/f=jpg,w=120,h=68,q=95` : null
    }),
    videoStill: t.field({
      type: 'String',
      nullable: true,
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'hd' ? `${baseUrl(id)}/f=jpg,w=1920,h=1080,q=95` : null
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
    args: {
      input: t.arg({ type: ImageInput, required: false })
    },
    resolve: async (query, _root, { input }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      const { id, uploadURL } = await createImageByDirectUpload()

      return await prisma.cloudflareImage.create({
        ...query,
        data: {
          id,
          uploadUrl: uploadURL,
          userId,
          aspectRatio: input?.aspectRatio ?? undefined,
          videoId: input?.videoId ?? undefined
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
      url: t.arg.string({ required: true }),
      input: t.arg({ type: ImageInput, required: false })
    },
    resolve: async (query, _root, { url, input }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      const { id } = await createImageFromUrl(url)

      return await prisma.cloudflareImage.create({
        ...query,
        data: {
          id,
          userId,
          uploaded: true,
          aspectRatio: input?.aspectRatio ?? undefined,
          videoId: input?.videoId ?? undefined
        }
      })
    }
  }),
  createCloudflareImageFromPrompt: t.prismaField({
    type: 'CloudflareImage',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      prompt: t.arg.string({ required: true }),
      input: t.arg({ type: ImageInput, required: false })
    },
    resolve: async (query, _root, { prompt, input }, { userId }) => {
      if (userId == null) throw new Error('User not found')

      const image = await createImageFromResponse(
        await createImageFromText(prompt)
      )

      return await prisma.cloudflareImage.create({
        ...query,
        data: {
          id: image.id,
          userId,
          uploaded: true,
          aspectRatio: input?.aspectRatio ?? undefined,
          videoId: input?.videoId ?? undefined
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
