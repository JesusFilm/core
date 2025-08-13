import { mockSourceString, mockTranslation } from '../../../test/crowdinMock'

import { LANGUAGE_CODES } from './config'
import {
  apis,
  fetchSourceStrings,
  fetchTranslations,
  processFile
} from './importer'

// Cast apis to mocked types for better TypeScript support
const mockedApis = apis as {
  sourceStrings: jest.Mocked<typeof apis.sourceStrings>
  stringTranslations: jest.Mocked<typeof apis.stringTranslations>
}

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
      mockedApis.sourceStrings.listProjectStrings
        .mockResolvedValueOnce({
          data: Array(500).fill({ data: mockSourceString }),
          pagination: { offset: 0, limit: 500 }
        })
        .mockResolvedValueOnce({
          data: Array(50).fill({ data: mockSourceString }),
          pagination: { offset: 500, limit: 500 }
        })

      const strings = await fetchSourceStrings(mockFile.id, apis.sourceStrings)
      expect(strings).toHaveLength(550)
      expect(mockedApis.sourceStrings.listProjectStrings).toHaveBeenCalledTimes(
        2
      )
    })

    it('should handle empty results', async () => {
      mockedApis.sourceStrings.listProjectStrings.mockResolvedValue({
        data: [],
        pagination: { offset: 0, limit: 500 }
      })
      const strings = await fetchSourceStrings(mockFile.id, apis.sourceStrings)
      expect(strings).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      mockedApis.sourceStrings.listProjectStrings.mockRejectedValue(
        new Error('API Error')
      )
      await expect(
        fetchSourceStrings(mockFile.id, apis.sourceStrings)
      ).rejects.toThrow()
    })
  })

  describe('fetchTranslations', () => {
    it('should filter non-plain text translations', async () => {
      mockedApis.stringTranslations.listLanguageTranslations.mockResolvedValue({
        data: [
          { data: mockTranslation },
          { data: { ...mockTranslation, contentType: 'text/html' } }
        ],
        pagination: { offset: 0, limit: 500 }
      })

      const translations = await fetchTranslations(
        'ru',
        mockFile.id,
        apis.stringTranslations
      )
      expect(translations).toHaveLength(1)
      expect(translations[0].contentType).toBe('text/plain')
    })

    it('should handle pagination in translations', async () => {
      mockedApis.stringTranslations.listLanguageTranslations
        .mockResolvedValueOnce({
          data: Array(500).fill({ data: mockTranslation }),
          pagination: { offset: 0, limit: 500 }
        })
        .mockResolvedValueOnce({
          data: Array(50).fill({ data: mockTranslation }),
          pagination: { offset: 500, limit: 500 }
        })

      const translations = await fetchTranslations(
        'ru',
        mockFile.id,
        apis.stringTranslations
      )
      expect(translations).toHaveLength(550)
    })
  })

  describe('processFile', () => {
    it('should process multiple languages', async () => {
      // Set up source strings to return data first
      mockedApis.sourceStrings.listProjectStrings.mockResolvedValue({
        data: [{ data: mockSourceString }],
        pagination: { offset: 0, limit: 500 }
      })

      const importOne = jest.fn()
      await processFile(mockFile, importOne)

      expect(
        mockedApis.stringTranslations.listLanguageTranslations
      ).toHaveBeenCalledTimes(Object.keys(LANGUAGE_CODES).length)
      expect(importOne).toHaveBeenCalled()
    })

    it('should skip processing when no source strings exist', async () => {
      mockedApis.sourceStrings.listProjectStrings.mockResolvedValue({
        data: [],
        pagination: { offset: 0, limit: 500 }
      })
      const importOne = jest.fn()

      await processFile(mockFile, importOne)
      expect(importOne).not.toHaveBeenCalled()
    })

    it('should handle errors for individual languages', async () => {
      mockedApis.stringTranslations.listLanguageTranslations.mockRejectedValue(
        new Error('Translation API Error')
      )
      const importOne = jest.fn()

      await processFile(mockFile, importOne)
      expect(importOne).not.toHaveBeenCalled()
    })
  })
})
