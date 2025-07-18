import { prisma } from '@core/prisma-media/client'

import { builder } from '../../builder'

builder.prismaObject('VideoOrigin', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description', { nullable: true })
  })
})

builder.queryFields((t) => ({
  videoOrigins: t.withAuth({ isPublisher: true }).prismaField({
    type: ['VideoOrigin'],
    nullable: false,
    resolve: async (query) => {
      return await prisma.videoOrigin.findMany({
        ...query,
        orderBy: { name: 'asc' }
      })
    }
  })
}))

builder.mutationFields((t) => ({
  videoOriginCreate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'VideoOrigin',
    nullable: false,
    input: {
      name: t.input.string({ required: true }),
      description: t.input.string({ required: false })
    },
    resolve: async (query, _parent, { input: { name, description } }) => {
      return await prisma.videoOrigin.create({
        ...query,
        data: {
          name,
          description
        }
      })
    }
  }),
  videoOriginUpdate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'VideoOrigin',
    nullable: false,
    input: {
      id: t.input.id({ required: true }),
      name: t.input.string({ required: false }),
      description: t.input.string({ required: false })
    },
    resolve: async (query, _parent, { input: { id, name, description } }) => {
      return await prisma.videoOrigin.update({
        ...query,
        where: { id },
        data: {
          name: name ?? undefined,
          description: description ?? undefined
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
