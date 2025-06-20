import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

builder.prismaObject('BibleCitation', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    osisId: t.exposeString('osisId', { nullable: false }),
    bibleBook: t.relation('bibleBook', { nullable: false }),
    chapterStart: t.exposeInt('chapterStart', { nullable: false }),
    chapterEnd: t.int({
      resolve: (parent) => (parent.chapterEnd === -1 ? null : parent.chapterEnd)
    }),
    order: t.exposeInt('order', { nullable: false }),
    verseStart: t.int({
      resolve: (parent) => (parent.verseStart === -1 ? null : parent.verseStart)
    }),
    verseEnd: t.int({
      resolve: (parent) => (parent.verseEnd === -1 ? null : parent.verseEnd)
    }),
    video: t.relation('video', { nullable: false })
  })
})

builder.queryFields((t) => ({
  bibleCitations: t.prismaField({
    type: ['BibleCitation'],
    nullable: false,
    args: {
      videoId: t.arg({ type: 'ID', required: false })
    },
    resolve: async (query, _parent, { videoId }) =>
      await prisma.bibleCitation.findMany({
        ...query,
        where: { videoId: videoId ?? undefined },
        orderBy: { order: 'asc' }
      })
  }),
  bibleCitation: t.prismaField({
    type: 'BibleCitation',
    nullable: false,
    args: { id: t.arg({ type: 'ID', required: true }) },
    resolve: async (query, _parent, { id }) =>
      await prisma.bibleCitation.findUniqueOrThrow({ ...query, where: { id } })
  })
}))

builder.mutationFields((t) => ({
  bibleCitationCreate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'BibleCitation',
    input: {
      id: t.input.id({ required: false }),
      osisId: t.input.string({ required: true }),
      videoId: t.input.id({ required: true }),
      bibleBookId: t.input.id({ required: true }),
      chapterStart: t.input.int({ required: true }),
      chapterEnd: t.input.int({ required: false }),
      verseStart: t.input.int({ required: false }),
      verseEnd: t.input.int({ required: false }),
      order: t.input.int({ required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.bibleCitation.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined,
          chapterEnd: input.chapterEnd ?? undefined,
          verseStart: input.verseStart ?? undefined,
          verseEnd: input.verseEnd ?? undefined
        }
      })
    }
  }),
  bibleCitationUpdate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'BibleCitation',
    input: {
      id: t.input.id({ required: true }),
      osisId: t.input.string({ required: false }),
      bibleBookId: t.input.id({ required: false }),
      chapterStart: t.input.int({ required: false }),
      chapterEnd: t.input.int({ required: false }),
      verseStart: t.input.int({ required: false }),
      verseEnd: t.input.int({ required: false }),
      order: t.input.int({ required: false })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.bibleCitation.update({
        ...query,
        where: { id: input.id },
        data: {
          ...input,
          chapterStart: input.chapterStart ?? undefined,
          chapterEnd: input.chapterEnd ?? undefined,
          verseStart: input.verseStart ?? undefined,
          verseEnd: input.verseEnd ?? undefined,
          bibleBookId: input.bibleBookId ?? undefined,
          osisId: input.osisId ?? undefined,
          order: input.order ?? undefined
        }
      })
    }
  }),
  bibleCitationDelete: t.withAuth({ isPublisher: true }).boolean({
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }) => {
      await prisma.bibleCitation.delete({ where: { id: id } })
      return true
    }
  })
}))
