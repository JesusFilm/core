import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

builder.prismaObject('BibleCitation', {
  fields: (t) => ({
    id: t.exposeID('id'),
    osisId: t.exposeString('osisId'),
    bibleBook: t.relation('bibleBook'),
    chapterStart: t.exposeInt('chapterStart'),
    chapterEnd: t.exposeInt('chapterEnd', { nullable: true }),
    verseStart: t.exposeInt('verseStart'),
    verseEnd: t.exposeInt('verseEnd', { nullable: true }),
    video: t.relation('video')
  })
})

builder.queryFields((t) => ({
  bibleCitations: t.prismaField({
    type: ['BibleCitation'],
    resolve: async (query) =>
      await prisma.bibleCitation.findMany({
        ...query
      })
  })
}))
