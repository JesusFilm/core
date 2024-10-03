import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Language } from '../../language'

import { VideoDescriptionCreateInput } from './inputs/videoDescriptionCreate'
import { VideoDescriptionUpdateInput } from './inputs/videoDescriptionUpdate'

builder.prismaObject('VideoDescription', {
  fields: (t) => ({
    id: t.exposeID('id'),
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

builder.mutationFields((t) => ({
  createVideoDescription: t.prismaField({
    type: 'VideoDescription',
    args: {
      input: t.arg({ type: VideoDescriptionCreateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoDescription.create({
        data: {
          ...input,
          id: input.id ?? undefined
        }
      })
    }
  }),
  updateVideoDescription: t.prismaField({
    type: 'VideoDescription',
    args: {
      input: t.arg({ type: VideoDescriptionUpdateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoDescription.update({
        where: { id: input.id },
        data: {
          value: input.value ?? undefined,
          primary: input.primary ?? undefined,
          languageId: input.languageId ?? undefined
        }
      })
    }
  }),
  deleteVideoDescription: t.prismaField({
    type: 'VideoDescription',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { id }) => {
      return await prisma.videoDescription.delete({
        where: { id }
      })
    }
  })
}))
