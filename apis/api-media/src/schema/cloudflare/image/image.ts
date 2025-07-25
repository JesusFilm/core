import { Prisma } from '.prisma/api-media-client'

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
    id: t.exposeID('id', { nullable: false }),
    uploadUrl: t.exposeString('uploadUrl'),
    userId: t.exposeID('userId', { nullable: false }),
    createdAt: t.expose('createdAt', {
      type: 'Date',
      nullable: false
    }),
    aspectRatio: t.expose('aspectRatio', {
      type: ImageAspectRatio
    }),
    url: t.field({
      type: 'String',
      resolve: ({ id }) => baseUrl(id)
    }),
    mobileCinematicHigh: t.field({
      type: 'String',
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'banner'
          ? `${baseUrl(id)}/f=jpg,w=1280,h=600,q=95`
          : null
    }),
    mobileCinematicLow: t.field({
      type: 'String',
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'banner'
          ? `${baseUrl(id)}/f=jpg,w=640,h=300,q=95`
          : null
    }),
    mobileCinematicVeryLow: t.field({
      type: 'String',
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'banner'
          ? `${baseUrl(id)}/f=webp,w=640,h=300,q=50`
          : null
    }),
    thumbnail: t.field({
      type: 'String',
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'hd' ? `${baseUrl(id)}/f=jpg,w=120,h=68,q=95` : null
    }),
    videoStill: t.field({
      type: 'String',
      resolve: ({ id, aspectRatio }) =>
        aspectRatio === 'hd' ? `${baseUrl(id)}/f=jpg,w=1920,h=1080,q=95` : null
    })
  })
})

builder.queryFields((t) => ({
  getMyCloudflareImages: t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['CloudflareImage'],
    nullable: false,
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _root, { offset, limit }, { user }) => {
      return await prisma.cloudflareImage.findMany({
        ...query,
        where: { userId: user.id },
        take: limit ?? undefined,
        skip: offset ?? undefined
      })
    }
  }),
  getMyCloudflareImage: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'CloudflareImage',
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _root, { id }, { user }) => {
      return await prisma.cloudflareImage.findFirstOrThrow({
        ...query,
        where: { id, userId: user.id }
      })
    }
  })
}))

builder.mutationFields((t) => ({
  createCloudflareUploadByFile: t
    .withAuth({ isAuthenticated: true })
    .prismaField({
      type: 'CloudflareImage',
      nullable: false,
      args: {
        input: t.arg({ type: ImageInput, required: false })
      },
      resolve: async (query, _root, { input }, { user }) => {
        const { id, uploadURL } = await createImageByDirectUpload()

        return await prisma.cloudflareImage.create({
          ...query,
          data: {
            id,
            uploadUrl: uploadURL,
            userId: user.id,
            aspectRatio: input?.aspectRatio ?? undefined,
            videoId: input?.videoId ?? undefined
          }
        })
      }
    }),
  createCloudflareUploadByUrl: t
    .withAuth({ $any: { isAuthenticated: true, isValidInterop: true } })
    .prismaField({
      type: 'CloudflareImage',
      nullable: false,
      args: {
        url: t.arg.string({ required: true }),
        input: t.arg({ type: ImageInput, required: false })
      },
      resolve: async (query, _root, { url, input }, { user }: any) => {
        const { id } = await createImageFromUrl(url)

        return await prisma.cloudflareImage.create({
          ...query,
          data: {
            id,
            userId: user?.id ?? 'system-ai',
            uploaded: true,
            aspectRatio: input?.aspectRatio ?? undefined,
            videoId: input?.videoId ?? undefined
          }
        })
      }
    }),
  createCloudflareImageFromPrompt: t
    .withAuth({ isAuthenticated: true })
    .prismaField({
      type: 'CloudflareImage',
      nullable: false,
      args: {
        prompt: t.arg.string({ required: true }),
        input: t.arg({ type: ImageInput, required: false })
      },
      resolve: async (query, _root, { prompt, input }, { user }) => {
        const image = await createImageFromResponse(
          await createImageFromText(prompt)
        )

        return await prisma.cloudflareImage.create({
          ...query,
          data: {
            id: image.id,
            userId: user.id,
            uploaded: true,
            aspectRatio: input?.aspectRatio ?? undefined,
            videoId: input?.videoId ?? undefined
          }
        })
      }
    }),
  deleteCloudflareImage: t.withAuth({ isAuthenticated: true }).boolean({
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_root, { id }, { user, currentRoles }) => {
      const where: Prisma.CloudflareImageWhereUniqueInput = { id }
      if (!currentRoles.includes('publisher')) {
        where.userId = user.id
      }
      const image = await prisma.cloudflareImage.findUniqueOrThrow({
        where
      })

      // only delete cloudflare asset if original user
      if (image.userId === user.id) await deleteImage(id)

      await prisma.cloudflareImage.delete({ where: { id } })
      return true
    }
  }),
  cloudflareUploadComplete: t.withAuth({ isAuthenticated: true }).boolean({
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_root, { id }, { user }) => {
      await prisma.cloudflareImage.update({
        where: { id, userId: user.id },
        data: { uploaded: true }
      })

      return true
    }
  })
}))
