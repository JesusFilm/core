import { prisma } from '@core/prisma/media/client'

import { builder, toPrismaDateTimeFilter } from '../../builder'

import { VideoOriginsFilter } from './inputs'

builder.prismaObject('VideoOrigin', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description', { nullable: true })
  })
})

builder.queryFields((t) => ({
  videoOrigins: t.prismaField({
    type: ['VideoOrigin'],
    nullable: false,
    args: {
      where: t.arg({ type: VideoOriginsFilter, required: false }),
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _parent, { where, offset, limit }) => {
      return await prisma.videoOrigin.findMany({
        ...query,
        where: { updatedAt: toPrismaDateTimeFilter(where?.updatedAt) },
        skip: offset ?? 0,
        take: limit ?? 100,
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }]
      })
    }
  }),
  videoOriginsCount: t.int({
    nullable: false,
    args: {
      where: t.arg({ type: VideoOriginsFilter, required: false })
    },
    resolve: async (_parent, { where }) => {
      return await prisma.videoOrigin.count({
        where: { updatedAt: toPrismaDateTimeFilter(where?.updatedAt) }
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
