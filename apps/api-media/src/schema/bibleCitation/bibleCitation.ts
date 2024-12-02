import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

builder.prismaObject('BibleCitation', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    osisId: t.exposeString('osisId', { nullable: false }),
    bibleBook: t.relation('bibleBook', { nullable: false }),
    chapterStart: t.exposeInt('chapterStart', { nullable: false }),
    chapterEnd: t.exposeInt('chapterEnd'),
    verseStart: t.exposeInt('verseStart', { nullable: false }),
    verseEnd: t.exposeInt('verseEnd'),
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
