import { builder } from '../builder'

builder.prismaObject('BibleCitation', {
  fields: (t) => ({
    osisId: t.exposeString('osisId'),
    bibleBook: t.relation('bibleBook'),
    chapterStart: t.exposeInt('chapterStart'),
    chapterEnd: t.exposeInt('chapterEnd', { nullable: true }),
    verseStart: t.exposeInt('verseStart'),
    verseEnd: t.exposeInt('verseEnd', { nullable: true })
  })
})
