import { Logger } from 'pino'

import {
  importBibleBookNames,
  importBibleBooks,
  importBibleCitations,
  importKeywords,
  importLanguageSlugs,
  importMasterUrls,
  importVideoChildren,
  importVideoDescriptions,
  importVideoImageAlts,
  importVideoImages,
  importVideoSnippets,
  importVideoStudyQuestions,
  importVideoSubtitles,
  importVideoTitles,
  importVideoVariantDownloads,
  importVideoVariants,
  importVideos
} from '../importers'

export async function service(logger?: Logger): Promise<void> {
  const cleanup = [
    await importLanguageSlugs(logger),
    await importVideos(logger),
    await importBibleBooks(logger),
    // depends on bibleBooks
    await importBibleBookNames(logger),
    // depends on videos
    await importVideoImages(logger),
    await importKeywords(logger),
    await importVideoTitles(logger),
    await importVideoDescriptions(logger),
    await importVideoImageAlts(logger),
    await importVideoSnippets(logger),
    await importVideoStudyQuestions(logger),
    await importVideoVariants(logger),
    await importVideoSubtitles(logger),
    await importVideoChildren(logger),
    // depends on bibleBooks and videos
    await importBibleCitations(logger),
    // depends on videoVariants
    await importVideoVariantDownloads(logger),
    await importMasterUrls(logger)
  ]
  cleanup.forEach((fn) => fn?.())
}
