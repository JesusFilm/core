import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Language } from '../../language'

import { SeoContentCreateInput } from './inputs/seoContentCreate'
import { SeoContentUpdateInput } from './inputs/seoContentUpdate'

builder.prismaObject('SeoContent', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    description: t.exposeString('description', { nullable: false }),
    keywords: t.exposeString('keywords', { nullable: false }),
    content: t.exposeString('content', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

builder.mutationFields((t) => ({
  seoContentCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'SeoContent',
    nullable: false,
    args: {
      input: t.arg({ type: SeoContentCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.seoContent.create({
        ...query,
        data: {
          id: input.id ?? undefined,
          title: input.title,
          description: input.description,
          keywords: input.keywords,
          content: input.content,
          primary: input.primary,
          languageId: input.languageId,
          videoId: input.videoId
        }
      })
    }
  }),
  seoContentUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'SeoContent',
    nullable: false,
    args: {
      input: t.arg({ type: SeoContentUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.seoContent.update({
        ...query,
        where: { id: input.id },
        data: {
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          keywords: input.keywords ?? undefined,
          content: input.content ?? undefined,
          primary: input.primary ?? undefined,
          languageId: input.languageId ?? undefined
        }
      })
    }
  }),
  seoContentDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'SeoContent',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.seoContent.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
