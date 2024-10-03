import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Language } from '../../language'
import { VideoTranslationCreateInput } from '../inputs/videoTranslationCreate'
import { VideoTranslationUpdateInput } from '../inputs/videoTranslationUpdate'

builder.prismaObject('VideoSnippet', {
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
  createVideoSnippet: t.prismaField({
    type: 'VideoSnippet',
    args: {
      input: t.arg({ type: VideoTranslationCreateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoSnippet.create({
        data: {
          ...input,
          id: input.id ?? undefined
        }
      })
    }
  }),
  updateVideoSnippet: t.prismaField({
    type: 'VideoSnippet',
    args: {
      input: t.arg({ type: VideoTranslationUpdateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoSnippet.update({
        where: { id: input.id },
        data: {
          value: input.value ?? undefined,
          primary: input.primary ?? undefined,
          languageId: input.languageId ?? undefined
        }
      })
    }
  }),
  deleteVideoSnippet: t.prismaField({
    type: 'VideoSnippet',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { id }) => {
      return await prisma.videoSnippet.delete({
        where: { id }
      })
    }
  })
}))
