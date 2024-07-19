import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { BibleBookName } from './name'
import { Prisma } from '.prisma/api-videos-client'

export const BibleBook = builder.prismaObject('BibleBook', {
  fields: (t) => ({
    osisId: t.exposeString('osisId'),
    alternateName: t.exposeString('alternateName', { nullable: true }),
    paratextAbbreviation: t.exposeString('paratextAbbreviation'),
    isNewTestament: t.exposeBoolean('isNewTestament'),
    order: t.exposeInt('order'),
    name: t.prismaField({
      type: [BibleBookName],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, language, { languageId, primary }) => {
        const where: Prisma.BibleBookNameWhereInput = {
          bibleBookId: language.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.bibleBookName.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' }
        })
      }
    })
  })
})
