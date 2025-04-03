import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { TranslationData } from '../../types'

const bibleBookSchema = z
  .object({
    identifier: z.string(),
    text: z.string(),
    languageCode: z.string()
  })
  .transform((data) => ({
    bibleBookId: data.identifier,
    languageId: data.languageCode,
    value: data.text,
    primary: false
  }))

function validateBibleBookData(data: TranslationData): boolean {
  if (!data.translation.text) {
    return false
  }

  const languageId =
    CROWDIN_CONFIG.languageCodes[
      data.languageCode as keyof typeof CROWDIN_CONFIG.languageCodes
    ]
  if (!languageId) {
    return false
  }

  return true
}

async function upsertBibleBookTranslation(
  data: TranslationData
): Promise<void> {
  if (!validateBibleBookData(data)) return

  const result = bibleBookSchema.parse({
    identifier: data.sourceString.identifier,
    text: data.translation.text,
    languageCode:
      CROWDIN_CONFIG.languageCodes[
        data.languageCode as keyof typeof CROWDIN_CONFIG.languageCodes
      ]
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

export async function importBibleBooks(): Promise<void> {
  await processFile(
    CROWDIN_CONFIG.files.bible_books,
    upsertBibleBookTranslation
  )
}
