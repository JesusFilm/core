import { Job } from 'bullmq'

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
} from './importers'
import { jobName } from './names'
import { jobFn } from './worker'

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

describe('bigquery/worker', () => {
  describe('jobFn', () => {
    it(`should not call anything if job name is not ${jobName}`, async () => {
      await jobFn({
        name: 'some-other-job'
      } as unknown as Job)
      expect(importBibleBookNames).not.toHaveBeenCalled()
    })

    it('should call importers', async () => {
      await jobFn({
        name: jobName
      } as unknown as Job)
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
