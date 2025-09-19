import { prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'
import { Language } from '../../language'
import { VideoTranslationCreateInput } from '../inputs/videoTranslationCreate'
import { VideoTranslationUpdateInput } from '../inputs/videoTranslationUpdate'

builder.prismaObject('VideoImageAlt', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

builder.mutationFields((t) => ({
  videoImageAltCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoImageAlt',
    nullable: false,
    args: {
      input: t.arg({ type: VideoTranslationCreateInput, required: true })
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
  videoImageAltUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoImageAlt',
    nullable: false,
    args: {
      input: t.arg({ type: VideoTranslationUpdateInput, required: true })
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
  videoImageAltDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoImageAlt',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoImageAlt.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
