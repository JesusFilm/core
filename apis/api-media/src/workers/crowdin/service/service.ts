import { Logger } from 'pino'

import {
  importBibleBooks,
  importStudyQuestions,
  importVideoDescriptions,
  importVideoTitles
} from '../importers'

export async function service(logger?: Logger): Promise<void> {
  const cleanup = [
    await importVideoTitles(logger),
    await importVideoDescriptions(logger),
    await importStudyQuestions(logger),
    await importBibleBooks(logger)
  ]

  cleanup.forEach((fn) => fn?.())
}
