import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

const bibleBookSchema = z.object({
  bibleBookId: z.string(),
  languageId: z.string(),
  value: z.string(),
  primary: z.boolean()
})

const missingBooks = new Set<string>()

export async function importBibleBooks(
  parentLogger?: Logger
): Promise<() => void> {
  const logger = parentLogger?.child({ importer: 'bibleBooks' })
  logger?.info('Starting bible books import')

  await processFile(
    CROWDIN_CONFIG.files.bible_books,
    async (data: ProcessedTranslation) => {
      await upsertBibleBookTranslation(data, logger)
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
  data: ProcessedTranslation,
  logger?: Logger
): Promise<void> {
  try {
    const result = bibleBookSchema.parse({
      bibleBookId: data.identifier,
      value: data.text,
      languageId: data.languageId,
      primary: false
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
  } catch (error) {
    logger?.error(
      `Failed to upsert bible book ${data.identifier} in language ${data.languageId}:`,
      error
    )
  }
}
