import {
  importBibleBooks,
  importStudyQuestions,
  importVideoDescriptions,
  importVideoTitles
} from '../importers'

export async function service(): Promise<void> {
  const cleanup = [
    await importVideoTitles(),
    await importVideoDescriptions(),
    await importStudyQuestions(),
    await importBibleBooks()
  ]

  cleanup.forEach((fn) => fn?.())
}
