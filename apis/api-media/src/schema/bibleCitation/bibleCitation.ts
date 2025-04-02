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
