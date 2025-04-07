import {
  SourceStrings as MockSourceStrings,
  StringTranslations as MockStringTranslations,
  mockSourceString,
  mockTranslation
} from './__mocks__/@crowdin/crowdin-api-client'
import { LANGUAGE_CODES } from './config'
import {
  apis,
  fetchSourceStrings,
  fetchTranslations,
  processFile
} from './importer'

const sourceStringsApi = MockSourceStrings as jest.Mocked<
  typeof MockSourceStrings
>
const stringTranslationsApi = MockStringTranslations as jest.Mocked<
  typeof MockStringTranslations
>

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
      sourceStringsApi.listProjectStrings
        .mockResolvedValueOnce({
          data: Array(500).fill({ data: mockSourceString })
        })
        .mockResolvedValueOnce({
          data: Array(50).fill({ data: mockSourceString })
        })

      const strings = await fetchSourceStrings(mockFile.id, apis.sourceStrings)
      expect(strings).toHaveLength(550)
      expect(sourceStringsApi.listProjectStrings).toHaveBeenCalledTimes(2)
    })

    it('should handle empty results', async () => {
      sourceStringsApi.listProjectStrings.mockResolvedValue({ data: [] })
      const strings = await fetchSourceStrings(mockFile.id, apis.sourceStrings)
      expect(strings).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      sourceStringsApi.listProjectStrings.mockRejectedValue(
        new Error('API Error')
      )
      await expect(
        fetchSourceStrings(mockFile.id, apis.sourceStrings)
      ).rejects.toThrow()
    })
  })

  describe('fetchTranslations', () => {
    it('should filter non-plain text translations', async () => {
      stringTranslationsApi.listLanguageTranslations.mockResolvedValue({
        data: [
          { data: mockTranslation },
          { data: { ...mockTranslation, contentType: 'text/html' } }
        ]
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
      stringTranslationsApi.listLanguageTranslations
        .mockResolvedValueOnce({
          data: Array(500).fill({ data: mockTranslation })
        })
        .mockResolvedValueOnce({
          data: Array(50).fill({ data: mockTranslation })
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
      sourceStringsApi.listProjectStrings.mockResolvedValue({
        data: [{ data: mockSourceString }]
      })

      const importOne = jest.fn()
      await processFile(mockFile, importOne)

      expect(
        stringTranslationsApi.listLanguageTranslations
      ).toHaveBeenCalledTimes(Object.keys(LANGUAGE_CODES).length)
      expect(importOne).toHaveBeenCalled()
    })

    it('should skip processing when no source strings exist', async () => {
      sourceStringsApi.listProjectStrings.mockResolvedValue({ data: [] })
      const importOne = jest.fn()

      await processFile(mockFile, importOne)
      expect(importOne).not.toHaveBeenCalled()
    })

    it('should handle errors for individual languages', async () => {
      stringTranslationsApi.listLanguageTranslations.mockRejectedValue(
        new Error('Translation API Error')
      )
      const importOne = jest.fn()

      await processFile(mockFile, importOne)
      expect(importOne).not.toHaveBeenCalled()
    })
  })
})
