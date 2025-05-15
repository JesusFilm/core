import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import { VideoOriginCreateInput, VideoOriginUpdateInput } from './inputs'

builder.prismaObject('VideoOrigin', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description', { nullable: true })
  })
})

builder.mutationFields((t) => ({
  videoOriginCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoOrigin',
    nullable: false,
    args: {
      input: t.arg({ type: VideoOriginCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoOrigin.create({
        ...query,
        data: {
          name: input.name,
          description: input.description
        }
      })
    }
  }),
  videoOriginUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoOrigin',
    nullable: false,
    args: {
      input: t.arg({ type: VideoOriginUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoOrigin.update({
        ...query,
        where: { id: input.id },
        data: {
          name: input.name ?? undefined,
          description: input.description ?? undefined
        }
      })
    }
  }),
  videoOriginDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoOrigin',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoOrigin.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
