import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Language } from '../../language'

import { VideoStudyQuestionCreateInput } from './inputs/videoStudyQuestionCreate'
import { VideoStudyQuestionUpdateInput } from './inputs/videoStudyQuestionUpdate'

builder.prismaObject('VideoStudyQuestion', {
  include: { order: true },
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
  createVideoStudyQuestion: t.prismaField({
    type: 'VideoStudyQuestion',
    args: {
      input: t.arg({ type: VideoStudyQuestionCreateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoStudyQuestion.create({
        data: {
          ...input,
          id: input.id ?? undefined
        }
      })
    }
  }),
  updateVideoStudyQuestion: t.prismaField({
    type: 'VideoStudyQuestion',
    args: {
      input: t.arg({ type: VideoStudyQuestionUpdateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoStudyQuestion.update({
        where: { id: input.id },
        data: {
          value: input.value ?? undefined,
          primary: input.primary ?? undefined,
          languageId: input.languageId ?? undefined,
          crowdInId: input.crowdInId ?? undefined,
          order: input.order ?? undefined
        }
      })
    }
  }),
  deleteVideoStudyQuestion: t.prismaField({
    type: 'VideoStudyQuestion',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { id }) => {
      return await prisma.videoStudyQuestion.delete({
        where: { id }
      })
    }
  })
}))
