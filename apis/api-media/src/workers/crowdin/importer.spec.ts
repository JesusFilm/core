import {
  crowdinClientMock,
  mockSourceString,
  mockTranslation
} from '../../../test/crowdinMock'

import { LANGUAGE_CODES } from './config'
import { fetchSourceStrings, fetchTranslations, processFile } from './importer'

const mockFile = {
  id: 1,
  name: 'test.csv',
  title: 'test',
  path: 'test.csv'
}

describe('Crowdin Importer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchSourceStrings', () => {
    it('should handle pagination correctly', async () => {
      // First page has full results, second page has partial
      crowdinClientMock.sourceStringsApi.listProjectStrings
        .mockResolvedValueOnce({
          data: Array(500).fill({ data: mockSourceString }),
          pagination: { offset: 0, limit: 500 }
        })
        .mockResolvedValueOnce({
          data: Array(50).fill({ data: mockSourceString }),
          pagination: { offset: 500, limit: 500 }
        })

      const strings = await fetchSourceStrings(mockFile.id)
      expect(strings).toHaveLength(550)
      expect(
        crowdinClientMock.sourceStringsApi.listProjectStrings
      ).toHaveBeenCalledTimes(2)
    })

    it('should handle empty results', async () => {
      crowdinClientMock.sourceStringsApi.listProjectStrings.mockResolvedValue({
        data: [],
        pagination: { offset: 0, limit: 500 }
      })
      const strings = await fetchSourceStrings(mockFile.id)
      expect(strings).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      crowdinClientMock.sourceStringsApi.listProjectStrings.mockRejectedValue(
        new Error('API Error')
      )
      await expect(fetchSourceStrings(mockFile.id)).rejects.toThrow()
    })
  })

  describe('fetchTranslations', () => {
    it('should filter non-plain text translations', async () => {
      crowdinClientMock.stringTranslationsApi.listLanguageTranslations.mockResolvedValue(
        {
          data: [
            { data: mockTranslation },
            { data: { ...mockTranslation, contentType: 'text/html' } }
          ],
          pagination: { offset: 0, limit: 500 }
        }
      )

      const translations = await fetchTranslations('ru', mockFile.id)
      expect(translations).toHaveLength(1)
      expect(translations[0].contentType).toBe('text/plain')
    })

    it('should handle pagination in translations', async () => {
      crowdinClientMock.stringTranslationsApi.listLanguageTranslations
        .mockResolvedValueOnce({
          data: Array(500).fill({ data: mockTranslation }),
          pagination: { offset: 0, limit: 500 }
        })
        .mockResolvedValueOnce({
          data: Array(50).fill({ data: mockTranslation }),
          pagination: { offset: 500, limit: 500 }
        })

      const translations = await fetchTranslations('ru', mockFile.id)
      expect(translations).toHaveLength(550)
    })
  })

  describe('processFile', () => {
    it('should process multiple languages', async () => {
      // Set up source strings to return data first
      crowdinClientMock.sourceStringsApi.listProjectStrings.mockResolvedValue({
        data: [{ data: mockSourceString }],
        pagination: { offset: 0, limit: 500 }
      })

      // Set up translations to return data for each language
      crowdinClientMock.stringTranslationsApi.listLanguageTranslations.mockResolvedValue(
        {
          data: [{ data: mockTranslation }],
          pagination: { offset: 0, limit: 500 }
        }
      )

      const importOne = jest.fn()
      await processFile(mockFile, importOne)

      expect(
        crowdinClientMock.stringTranslationsApi.listLanguageTranslations
      ).toHaveBeenCalledTimes(Object.keys(LANGUAGE_CODES).length)
      expect(importOne).toHaveBeenCalled()
    })

    it('should skip processing when no source strings exist', async () => {
      crowdinClientMock.sourceStringsApi.listProjectStrings.mockResolvedValue({
        data: [],
        pagination: { offset: 0, limit: 500 }
      })
      const importOne = jest.fn()

      await processFile(mockFile, importOne)
      expect(importOne).not.toHaveBeenCalled()
    })

    it('should handle errors for individual languages', async () => {
      // Set up source strings first
      crowdinClientMock.sourceStringsApi.listProjectStrings.mockResolvedValue({
        data: [{ data: mockSourceString }],
        pagination: { offset: 0, limit: 500 }
      })

      // Make translations fail
      crowdinClientMock.stringTranslationsApi.listLanguageTranslations.mockRejectedValue(
        new Error('Translation API Error')
      )
      const importOne = jest.fn()

      await processFile(mockFile, importOne)
      expect(importOne).not.toHaveBeenCalled()
    })
  })
})
