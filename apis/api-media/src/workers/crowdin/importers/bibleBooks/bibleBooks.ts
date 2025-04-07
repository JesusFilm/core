import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

const bibleBookSchema = z
  .object({
    identifier: z.string(),
    text: z.string(),
    languageId: z.string()
  })
  .transform((data) => ({
    bibleBookId: data.identifier,
    languageId: data.languageId,
    value: data.text,
    primary: false
  }))

const missingBooks = new Set<string>()

export async function importBibleBooks(
  parentLogger?: Logger
): Promise<() => void> {
  const logger = parentLogger?.child({ importer: 'bibleBooks' })
  logger?.info('Starting bible books import')

  await processFile(
    CROWDIN_CONFIG.files.bible_books,
    async (data: ProcessedTranslation) => {
      await upsertBibleBookTranslation(data)
    },
    logger
  )

  if (missingBooks.size > 0) {
    logger?.warn(
      {
        count: missingBooks.size,
        books: Array.from(missingBooks)
      },
      'Bible books not found in database'
    )
  }

  logger?.info('Finished bible books import')
  return () => missingBooks.clear()
}

async function upsertBibleBookTranslation(
  data: ProcessedTranslation
): Promise<void> {
  const result = bibleBookSchema.parse({
    identifier: data.identifier,
    text: data.text,
    languageId: data.languageId
  })

  await prisma.bibleBookName.upsert({
    where: {
      bibleBookId_languageId: {
        bibleBookId: result.bibleBookId,
        languageId: result.languageId
      }
    },
    update: result,
    create: result
  })
}
