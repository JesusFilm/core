import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Language } from '../../language'
import { VideoTranslationCreateInput } from '../inputs/videoTranslationCreate'
import { VideoTranslationUpdateInput } from '../inputs/videoTranslationUpdate'

builder.prismaObject('VideoImageAlt', {
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
  videoImageAltCreate: t.prismaField({
    type: 'VideoImageAlt',
    args: {
      input: t.arg({ type: VideoTranslationCreateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoImageAlt.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined
        }
      })
    }
  }),
  videoImageAltUpdate: t.prismaField({
    type: 'VideoImageAlt',
    args: {
      input: t.arg({ type: VideoTranslationUpdateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoImageAlt.update({
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
  videoImageAltDelete: t.prismaField({
    type: 'VideoImageAlt',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoImageAlt.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
