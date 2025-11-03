import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'

import { VideoEditionUpdateInput } from './inputs'
import { VideoEditionCreateInput } from './inputs/videoEditionCreate'

builder.prismaObject('VideoEdition', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name'),
    videoVariants: t.relation('videoVariants', { nullable: false }),
    videoSubtitles: t.relation('videoSubtitles', { nullable: false })
  })
})

builder.queryFields((t) => ({
  videoEditions: t.prismaField({
    type: ['VideoEdition'],
    nullable: false,
    resolve: async (query) => {
      return await prisma.videoEdition.findMany({
        ...query
      })
    }
  }),
  videoEdition: t.prismaField({
    type: 'VideoEdition',
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoEdition.findUnique({
        ...query,
        where: { id }
      })
    }
  })
}))

builder.mutationFields((t) => ({
  videoEditionCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoEdition',
    nullable: false,
    args: {
      input: t.arg({ type: VideoEditionCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoEdition.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined
        }
      })
    }
  }),
  videoEditionUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoEdition',
    nullable: false,
    args: {
      input: t.arg({ type: VideoEditionUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoEdition.update({
        ...query,
        where: { id: input.id },
        data: {
          name: input.name ?? undefined
        }
      })
    }
  }),
  videoEditionDelete: t.prismaField({
    type: 'VideoEdition',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoEdition.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
