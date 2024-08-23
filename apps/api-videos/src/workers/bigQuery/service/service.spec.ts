import {
  importBibleBookNames,
  importBibleBooks,
  importBibleCitations,
  importKeywords,
  importLanguageSlugs,
  importVideoChildren,
  importVideoDescriptions,
  importVideoImageAlts,
  importVideoSnippets,
  importVideoStudyQuestions,
  importVideoSubtitles,
  importVideoTitles,
  importVideoVariantDownloads,
  importVideoVariants,
  importVideos
} from '../importers'

import { service } from './service'

jest.mock('./importers', () => ({
  importBibleBookNames: jest.fn(),
  importBibleBooks: jest.fn(),
  importBibleCitations: jest.fn(),
  importKeywords: jest.fn(),
  importLanguageSlugs: jest.fn(),
  importVideoChildren: jest.fn(),
  importVideoDescriptions: jest.fn(),
  importVideoImageAlts: jest.fn(),
  importVideoSnippets: jest.fn(),
  importVideoStudyQuestions: jest.fn(),
  importVideoSubtitles: jest.fn(),
  importVideoTitles: jest.fn(),
  importVideoVariantDownloads: jest.fn(),
  importVideoVariants: jest.fn(),
  importVideos: jest.fn()
}))

describe('bigquery/service', () => {
  describe('service', () => {
    it('should call importers', async () => {
      await service()
      expect(importBibleBookNames).toHaveBeenCalled()
      expect(importBibleBooks).toHaveBeenCalled()
      expect(importBibleCitations).toHaveBeenCalled()
      expect(importKeywords).toHaveBeenCalled()
      expect(importLanguageSlugs).toHaveBeenCalled()
      expect(importVideoChildren).toHaveBeenCalled()
      expect(importVideoDescriptions).toHaveBeenCalled()
      expect(importVideoImageAlts).toHaveBeenCalled()
      expect(importVideoSnippets).toHaveBeenCalled()
      expect(importVideoStudyQuestions).toHaveBeenCalled()
      expect(importVideoSubtitles).toHaveBeenCalled()
      expect(importVideoTitles).toHaveBeenCalled()
      expect(importVideoVariantDownloads).toHaveBeenCalled()
      expect(importVideoVariants).toHaveBeenCalled()
      expect(importVideos).toHaveBeenCalled()
    })
  })
})
