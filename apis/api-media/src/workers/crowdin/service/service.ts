import { Logger } from 'pino'

import {
  importBibleBooks,
  importStudyQuestions,
  importVideoDescriptions,
  importVideoTitles
} from '../importers'
import { populateCrowdinIds } from '../importers/populateCrowdinIds/populateCrowdinIds'

export async function service(logger?: Logger): Promise<void> {
  await populateCrowdinIds(logger)
  // const cleanup = [
  //   await importVideoTitles(logger),
  //   await importVideoDescriptions(logger),
  //   await importStudyQuestions(logger),
  //   await importBibleBooks(logger),
  // ]

  // cleanup.forEach((fn) => fn?.())
}
