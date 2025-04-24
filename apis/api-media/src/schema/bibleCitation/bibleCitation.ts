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
    resolve: async (query) =>
      await prisma.bibleCitation.findMany({
        ...query
      })
  })
}))

builder.mutationFields((t) => ({
  bibleCitationCreate: t.prismaFieldWithInput({
    type: 'BibleCitation',
    input: {
      id: t.arg.id({ required: false }),
      osisId: t.arg.string({ required: true }),
      videoId: t.arg.id({ required: true }),
      bibleBookId: t.arg.id({ required: true }),
      chapterStart: t.arg.int({ required: true }),
      chapterEnd: t.arg.int({ required: false }),
      verseStart: t.arg.int({ required: false }),
      verseEnd: t.arg.int({ required: false }),
      order: t.arg.int({ required: true })
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
  bibleCitationUpdate: t.prismaFieldWithInput({
    type: 'BibleCitation',
    input: {
      id: t.arg.id({ required: true }),
      osisId: t.arg.string({ required: false }),
      bibleBookId: t.arg.id({ required: false }),
      chapterStart: t.arg.int({ required: false }),
      chapterEnd: t.arg.int({ required: false }),
      verseStart: t.arg.int({ required: false }),
      verseEnd: t.arg.int({ required: false }),
      order: t.arg.int({ required: false })
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
  })
}))
