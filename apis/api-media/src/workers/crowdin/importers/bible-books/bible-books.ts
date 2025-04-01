import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { Logger } from 'pino'

import { prisma } from '../../../../lib/prisma'
import { ARCLIGHT_FILES } from '../../shared/arclight-files'
import {
  clearBibleBooks,
  hasBook,
  initializeBibleBooks
} from '../../utils/bible-books-cache'
import {
  BaseTranslation,
  CROWDIN_LANGUAGE_CODE_TO_ID,
  TranslationData
} from '../shared/base-translation'

export async function importBibleBooks(
  sourceStringsApi: SourceStrings,
  stringTranslationsApi: StringTranslations,
  logger?: Logger
): Promise<() => void> {
  await initializeBibleBooks()

  const translator = new BibleBooksTranslator(
    sourceStringsApi,
    stringTranslationsApi,
    logger
  )
  const validateData = translator.validateData.bind(translator)
  const upsertTranslation = translator.upsertTranslation.bind(translator)

  await translator.processFile(
    ARCLIGHT_FILES.bible_books,
    validateData,
    upsertTranslation
  )

  return () => clearBibleBooks()
}

class BibleBooksTranslator extends BaseTranslation {
  validateData(data: TranslationData): boolean {
    const bookId = data.sourceString.identifier
    if (!bookId || !hasBook(bookId)) {
      this.logger?.warn({ bookId }, 'Bible book does not exist in database')
      return false
    }
    return true
  }

  async upsertTranslation(data: TranslationData): Promise<void> {
    const text = this.getTranslationText(data.translation)
    if (!text) return

    const languageId =
      CROWDIN_LANGUAGE_CODE_TO_ID[
        data.languageCode as keyof typeof CROWDIN_LANGUAGE_CODE_TO_ID
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
}
