import { builder } from '../../builder'

import { CloudflareR2CreateInput } from './inputs/cloudflareR2Create'
import { CloudflareR2UpdateInput } from './inputs/cloudflareR2Update'

builder.prismaObject('CloudflareR2', {
  fields: (t) => ({
    id: t.exposeID('id'),
    fileName: t.exposeString('fileName'),
    uploadUrl: t.exposeString('uploadUrl', { nullable: true }),
    userId: t.exposeID('userId'),
    publicUrl: t.exposeString('publicUrl', { nullable: true }),
    createdAt: t.expose('createdAt', {
      type: 'Date'
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'Date'
    })
  })
})

builder.queryFields((t) => ({
  videoCloudflareAssets: t.prismaField({
    type: ['CloudflareR2'],
    args: {
      videoId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { videoId }) => {
      return await query.prisma.cloudflareR2.findMany({
        ...query,
        where: { videoId }
      })
    }
  })
}))

builder.mutationFields((t) => ({
  r2AssetCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CloudflareR2',
    args: {
      input: t.arg({ type: CloudflareR2CreateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user }) => {
      return await query.prisma.cloudflareR2.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined,
          userId: user.id
        }
      })
    }
  }),
  r2AssetUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CloudflareR2',
    args: {
      input: t.arg({ type: CloudflareR2UpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user }) => {
      return await query.prisma.cloudflareR2.update({
        ...query,
        where: { id: input.id },
        data: {
          fileName: input.fileName ?? undefined,
          uploadUrl: input.uploadUrl ?? undefined,
          publicUrl: input.publicUrl ?? undefined,
          videoId: input.videoId ?? undefined
        }
      })
    }
  }),
  r2AssetDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CloudflareR2',
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user }) => {
      return await query.prisma.cloudflareR2.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
