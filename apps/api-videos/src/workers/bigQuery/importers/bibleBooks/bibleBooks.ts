import omit from 'lodash/omit'
import { Logger } from 'pino'
import { z } from 'zod'

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

let bibleBookIds: string[] = []

export function setBibleBookIds(bibleBooks: Array<{ id: string }>): void {
  bibleBookIds = bibleBooks.map(({ id }) => id)
}

export function getBibleBookIds(): string[] {
  return bibleBookIds
}

export async function importBibleBooks(logger?: Logger): Promise<() => void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_bibleBooks_arclight_data',
    importOne,
    importMany,
    false,
    logger
  )

  setBibleBookIds(await prisma.bibleBook.findMany({ select: { id: true } }))

  return () => setBibleBookIds([])
}

function trimBibleBook(
  bibleBook: BibleBook
): Omit<BibleBook, 'name' | 'languageId'> {
  return omit(bibleBook, 'name', 'languageId')
}

export async function importOne(row: unknown): Promise<void> {
  const bibleBook = parse(bibleBookSchema, row)
  const trimmedBibleBook = trimBibleBook(bibleBook)
  await prisma.bibleBook.upsert({
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
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: bibleBooks, inValidRowIds } = parseMany(bibleBookSchema, rows)

  if (bibleBooks.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  const filteredBibleBooks = bibleBooks.filter(
    ({ id }) => !bibleBookIds.includes(id)
  )
  const trimmedBibleBooks = filteredBibleBooks.map((bibleBook) =>
    trimBibleBook(bibleBook)
  )

  const bibleBookNames = filteredBibleBooks.map((bibleBook) => ({
    value: bibleBook.name,
    languageId: bibleBook.languageId,
    primary: true,
    bibleBookId: bibleBook.id
  }))

  await prisma.bibleBook.createMany({
    data: trimmedBibleBooks.filter(({ id }) => !bibleBookIds.includes(id)),
    skipDuplicates: true
  })

  await prisma.bibleBookName.createMany({
    data: bibleBookNames,
    skipDuplicates: true
  })
}
