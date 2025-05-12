import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

builder.prismaObject('VideoOwner', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description', { nullable: true }),
    videos: t.relation('videos', { nullable: false })
  })
})

builder.mutationFields((t) => ({
  videoOwnerCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoOwner',
    nullable: false,
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: false })
    },
    resolve: async (query, _parent, { name, description }) => {
      return await prisma.videoOwner.create({
        ...query,
        data: {
          name,
          description
        }
      })
    }
  }),
  videoOwnerUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoOwner',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      name: t.arg.string({ required: false }),
      description: t.arg.string({ required: false })
    },
    resolve: async (query, _parent, { id, name, description }) => {
      return await prisma.videoOwner.update({
        ...query,
        where: { id },
        data: {
          name: name ?? undefined,
          description: description ?? undefined
        }
      })
    }
  }),
  videoOwnerDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoOwner',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoOwner.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
