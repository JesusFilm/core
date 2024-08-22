import { z } from 'zod'

import { Prisma } from '.prisma/api-videos-client'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

const bibleBookSchema = z.object({
  id: z.number().transform(String),
  name: z.string(),
  osisId: z.string(),
  alternateName: z.string().nullable(),
  paratextAbbreviation: z.string(),
  isNewTestament: z.number().transform(Boolean),
  order: z.number(),
  languageId: z.number().transform(String)
})

type BibleBook = z.infer<typeof bibleBookSchema>

export async function importBibleBook(): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_bibleBooks_arclight_data',
    importOne,
    importMany,
    true
  )
}

function trimBibleBook(
  bibleBook: BibleBook
): Omit<BibleBook, 'name' | 'languageId'> {
  const { name, languageId, ...trimmedBibleBook } = bibleBook
  return trimmedBibleBook
}

export async function importOne(row: unknown): Promise<void> {
  const trimmedBibleBook = this.trimBibleBook(row)
  await this.prismaService.bibleBook.upsert({
    where: { id: bibleBook.id },
    update: {
      ...trimmedBibleBook,
      name: {
        upsert: {
          where: {
            bibleBookId_languageId: {
              bibleBookId: bibleBook.id,
              languageId: bibleBook.languageId
            }
          },
          update: {
            value: bibleBook.name,
            primary: true
          },
          create: {
            value: bibleBook.name,
            languageId: bibleBook.languageId,
            primary: true
          }
        }
      }
    },
    create: {
      ...trimmedBibleBook,
      name: {
        create: {
          value: bibleBook.name,
          languageId: bibleBook.languageId,
          primary: true
        }
      }
    }
  })
  this.ids.push(bibleBook.id)
}

export async function importMany(rows: unknown[]): Promise<void> {
  const trimmedBibleBooks = bibleBooks.map((bibleBook) =>
    this.trimBibleBook(bibleBook)
  )

  const bibleBookNames = bibleBooks.map((bibleBook) => ({
    value: bibleBook.name,
    languageId: bibleBook.languageId,
    primary: true,
    bibleBookId: bibleBook.id
  }))

  await this.prismaService.bibleBook.createMany({
    data: trimmedBibleBooks.filter(({ id }) => !this.ids.includes(id)),
    skipDuplicates: true
  })

  this.ids = bibleBooks.map(({ id }) => id)

  await this.prismaService.bibleBookName.createMany({
    data: bibleBookNames.filter(({ bibleBookId }) =>
      this.ids.includes(bibleBookId)
    ),
    skipDuplicates: true
  })
}
