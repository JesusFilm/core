import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { Logger } from 'pino'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { getTranslationText, processFile } from '../../importer'
import { TranslationData } from '../../types'
import {
  clearBibleBooks,
  hasBook,
  initializeBibleBooks
} from '../../utils/bibleBooksCache'

function validateBibleBookData(data: TranslationData): boolean {
  const bookId = data.sourceString.identifier
  if (!bookId || !hasBook(bookId)) {
    return false
  }
  return true
}

async function upsertBibleBookTranslation(
  data: TranslationData
): Promise<void> {
  const text = getTranslationText(data.translation)
  if (!text) return

  const languageId =
    CROWDIN_CONFIG.languageCodes[
      data.languageCode as keyof typeof CROWDIN_CONFIG.languageCodes
    ]
  if (!languageId) return

  await prisma.bibleBookName.upsert({
    where: {
      bibleBookId_languageId: {
        bibleBookId: data.sourceString.identifier,
        languageId
      }
    },
    update: {
      value: text
    },
    create: {
      bibleBookId: data.sourceString.identifier,
      languageId,
      value: text,
      primary: false
    }
  })
}

export async function importBibleBooks(
  sourceStringsApi: SourceStrings,
  stringTranslationsApi: StringTranslations,
  logger?: Logger
): Promise<() => void> {
  await initializeBibleBooks()

  await processFile(
    CROWDIN_CONFIG.files.bible_books,
    upsertBibleBookTranslation,
    async (data) => {
      for (const item of data) {
        await upsertBibleBookTranslation(item)
      }
    },
    {
      sourceStrings: sourceStringsApi,
      stringTranslations: stringTranslationsApi
    },
    logger
  )

  return () => clearBibleBooks()
}
