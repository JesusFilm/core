import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Language } from '../../language'
import { VideoTranslationCreateInput } from '../inputs/videoTranslationCreate'
import { VideoTranslationUpdateInput } from '../inputs/videoTranslationUpdate'

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
  videoDescriptionCreate: t.prismaField({
    type: 'VideoDescription',
    args: {
      input: t.arg({ type: VideoTranslationCreateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoDescription.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined
        }
      })
    }
  }),
  videoDescriptionUpdate: t.prismaField({
    type: 'VideoDescription',
    args: {
      input: t.arg({ type: VideoTranslationUpdateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoDescription.update({
        ...query,
        where: { id: input.id },
        data: {
          value: input.value ?? undefined,
          primary: input.primary ?? undefined,
          languageId: input.languageId ?? undefined
        }
      })
    }
  }),
  videoDescriptionDelete: t.prismaField({
    type: 'VideoDescription',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoDescription.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
