import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { SourceStringsModel } from '@crowdin/crowdin-api-client/out/sourceStrings'
import { StringTranslationsModel } from '@crowdin/crowdin-api-client/out/stringTranslations'
import { Logger } from 'pino'

import {
  ARCLIGHT_FILES,
  BaseTranslation,
  CROWDIN_LANGUAGE_CODE_TO_ID
} from './importer'

jest.mock('@crowdin/crowdin-api-client')

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
} as unknown as jest.Mocked<Logger>

describe('crowdin/importer', () => {
  // Mock environment variables
  const originalEnv = process.env

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      CROWDIN_API_KEY: 'test-api-key'
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  let baseTranslation: BaseTranslation

  beforeEach(() => {
    jest.clearAllMocks()
    baseTranslation = new BaseTranslation(
      new SourceStrings({ token: 'test-token' }),
      new StringTranslations({ token: 'test-token' }),
      mockLogger
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mockUser = {
    id: 1,
    username: 'test',
    fullName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg'
  }

  const baseMockSourceString = {
    id: 1,
    projectId: 47654,
    fileId: ARCLIGHT_FILES.collection_title.id,
    branchId: 1,
    directoryId: 1,
    identifier: 'test',
    text: 'Test String',
    type: SourceStringsModel.Type.TEXT,
    context: '',
    maxLength: 0,
    isHidden: false,
    isDuplicate: false,
    masterStringId: false,
    revision: 1,
    hasPlurals: false,
    isIcu: false,
    labelIds: [],
    createdAt: '',
    updatedAt: '',
    webUrl: 'https://crowdin.com/string/1'
  } as unknown as SourceStringsModel.String

  describe('fetchSourceStrings', () => {
    it('should fetch source strings with pagination', async () => {
      const mockSourceString1 = {
        ...baseMockSourceString,
        id: 1,
        text: 'Test 1'
      }

      const { listProjectStrings } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )

      listProjectStrings.mockResolvedValueOnce({
        data: [{ data: mockSourceString1 }],
        pagination: { offset: 0, limit: 500 }
      })

      const result = await baseTranslation['fetchSourceStrings'](
        ARCLIGHT_FILES.collection_title.id
      )

      expect(result).toEqual([{ data: mockSourceString1 }])
      expect(listProjectStrings).toHaveBeenCalledTimes(1)
      expect(listProjectStrings).toHaveBeenCalledWith(47654, {
        fileId: ARCLIGHT_FILES.collection_title.id,
        limit: 500,
        offset: 0
      })
    })

    it('should handle multiple pages when limit is reached', async () => {
      const firstPageStrings = Array.from({ length: 500 }, (_, i) => ({
        data: {
          ...baseMockSourceString,
          id: i + 1,
          text: `Test ${i + 1}`
        }
      }))

      const secondPageStrings = Array.from({ length: 3 }, (_, i) => ({
        data: {
          ...baseMockSourceString,
          id: 501 + i,
          text: `Test ${501 + i}`
        }
      }))

      const { listProjectStrings } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )

      listProjectStrings
        .mockResolvedValueOnce({
          data: firstPageStrings,
          pagination: { offset: 0, limit: 500 }
        })
        .mockResolvedValueOnce({
          data: secondPageStrings,
          pagination: { offset: 500, limit: 500 }
        })

      const result = await baseTranslation['fetchSourceStrings'](
        ARCLIGHT_FILES.collection_title.id
      )

      expect(result).toEqual([...firstPageStrings, ...secondPageStrings])
      expect(listProjectStrings).toHaveBeenCalledTimes(2)
      expect(listProjectStrings).toHaveBeenCalledWith(47654, {
        fileId: ARCLIGHT_FILES.collection_title.id,
        limit: 500,
        offset: 0
      })
      expect(listProjectStrings).toHaveBeenCalledWith(47654, {
        fileId: ARCLIGHT_FILES.collection_title.id,
        limit: 500,
        offset: 500
      })
    })
  })

  describe('getTranslationText', () => {
    it('should get text from plain translation', () => {
      const translation = {
        stringId: 1,
        contentType: 'text/plain',
        translationId: 1,
        text: 'Test Translation',
        user: mockUser,
        createdAt: '',
        updatedAt: ''
      } as unknown as StringTranslationsModel.PlainLanguageTranslation

      const result = baseTranslation['getTranslationText'](translation)
      expect(result).toBe('Test Translation')
    })

    it('should return undefined for plain translation with undefined text', () => {
      const translation = {
        stringId: 1,
        contentType: 'text/plain',
        translationId: 1,
        text: undefined,
        user: mockUser,
        createdAt: '',
        updatedAt: ''
      } as unknown as StringTranslationsModel.PlainLanguageTranslation

      const result = baseTranslation['getTranslationText'](translation)
      expect(result).toBeUndefined()
    })

    it('should get text from plural translation', () => {
      const translation = {
        stringId: 1,
        contentType: 'application/x-gettext-plural',
        plurals: {
          one: 'One item',
          other: 'Other items'
        },
        user: mockUser,
        createdAt: '',
        updatedAt: ''
      } as unknown as StringTranslationsModel.PluralLanguageTranslation

      const result = baseTranslation['getTranslationText'](translation)
      expect(result).toBe('One item')
    })

    it('should return undefined for plural translation with malformed plurals', () => {
      const translation = {
        stringId: 1,
        contentType: 'application/x-gettext-plural',
        plurals: null,
        user: mockUser,
        createdAt: '',
        updatedAt: ''
      } as unknown as StringTranslationsModel.PluralLanguageTranslation

      const result = baseTranslation['getTranslationText'](translation)
      expect(result).toBeUndefined()
    })

    it('should return undefined for plural translation without one form', () => {
      const translation = {
        stringId: 1,
        contentType: 'application/x-gettext-plural',
        plurals: {
          other: 'Other items'
        },
        user: mockUser,
        createdAt: '',
        updatedAt: ''
      } as unknown as StringTranslationsModel.PluralLanguageTranslation

      const result = baseTranslation['getTranslationText'](translation)
      expect(result).toBeUndefined()
    })

    it('should return undefined for unsupported translation type', () => {
      const translation = {
        stringId: 1,
        contentType: 'unknown',
        translationId: 1
      } as unknown as StringTranslationsModel.PlainLanguageTranslation

      const result = baseTranslation['getTranslationText'](translation)
      expect(result).toBeUndefined()
    })
  })

  describe('fetchTranslations', () => {
    const mockTranslation1 = {
      stringId: 1,
      contentType: 'text/plain',
      translationId: 1,
      text: 'Test Translation 1',
      user: mockUser,
      createdAt: '',
      updatedAt: ''
    } as unknown as StringTranslationsModel.PlainLanguageTranslation

    it('should fetch translations with pagination', async () => {
      const firstPageTranslations = Array.from({ length: 500 }, (_, i) => ({
        data: {
          ...mockTranslation1,
          stringId: i + 1,
          text: `Translation ${i + 1}`
        }
      }))

      const secondPageTranslations = Array.from({ length: 3 }, (_, i) => ({
        data: {
          ...mockTranslation1,
          stringId: 501 + i,
          text: `Translation ${501 + i}`
        }
      }))

      const { listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )

      listLanguageTranslations
        .mockResolvedValueOnce({
          data: firstPageTranslations,
          pagination: { offset: 0, limit: 500 }
        })
        .mockResolvedValueOnce({
          data: secondPageTranslations,
          pagination: { offset: 500, limit: 500 }
        })

      const result = await baseTranslation['fetchTranslations'](
        'ko',
        ARCLIGHT_FILES.collection_title.id
      )

      expect(result).toEqual([
        ...firstPageTranslations.map((t) => t.data),
        ...secondPageTranslations.map((t) => t.data)
      ])
      expect(listLanguageTranslations).toHaveBeenCalledTimes(2)
      expect(listLanguageTranslations).toHaveBeenCalledWith(47654, 'ko', {
        fileId: ARCLIGHT_FILES.collection_title.id,
        limit: 500,
        offset: 0
      })
      expect(listLanguageTranslations).toHaveBeenCalledWith(47654, 'ko', {
        fileId: ARCLIGHT_FILES.collection_title.id,
        limit: 500,
        offset: 500
      })
    })

    it('should handle 404 error for unconfigured language', async () => {
      const { listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )

      const error = new Error('Language not found')
      ;(error as any).code = 404

      listLanguageTranslations.mockRejectedValueOnce(error)

      await expect(
        baseTranslation['processLanguage'](
          'xx',
          ARCLIGHT_FILES.collection_title,
          new Map(),
          jest.fn(),
          jest.fn()
        )
      ).resolves.toBeUndefined()

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Language xx not configured in project'
      )
    })

    it('should propagate non-404 errors', async () => {
      const { listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )

      const error = new Error('API Error')
      listLanguageTranslations.mockRejectedValueOnce(error)

      await expect(
        baseTranslation['fetchTranslations'](
          'ko',
          ARCLIGHT_FILES.collection_title.id
        )
      ).rejects.toThrow('API Error')
    })
  })

  describe('processTranslations', () => {
    const mockSourceString = {
      ...baseMockSourceString,
      id: 1,
      text: 'Source Text'
    }

    const mockTranslation = {
      stringId: 1,
      contentType: 'text/plain',
      translationId: 1,
      text: 'Test Translation',
      user: mockUser,
      createdAt: '',
      updatedAt: ''
    } as unknown as StringTranslationsModel.PlainLanguageTranslation

    const mockInvalidTranslation = {
      ...mockTranslation,
      stringId: 999 // ID that doesn't exist in source strings
    }

    it('should process valid translations', async () => {
      const sourceStringMap = new Map([[1, mockSourceString]])
      const translations = [mockTranslation]
      const validateData = jest.fn().mockReturnValue(true)
      const upsertTranslation = jest.fn().mockResolvedValue(undefined)

      await baseTranslation['processTranslations'](
        translations,
        sourceStringMap,
        'ko',
        validateData,
        upsertTranslation
      )

      expect(validateData).toHaveBeenCalledWith({
        sourceString: mockSourceString,
        translation: mockTranslation,
        languageCode: 'ko'
      })
      expect(upsertTranslation).toHaveBeenCalledWith({
        sourceString: mockSourceString,
        translation: mockTranslation,
        languageCode: 'ko'
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        { count: 1 },
        'Found valid translations to upsert'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully upserted 1 translations'
      )
    })

    it('should skip translations without matching source string', async () => {
      const sourceStringMap = new Map([[1, mockSourceString]])
      const translations = [mockInvalidTranslation]
      const validateData = jest.fn()
      const upsertTranslation = jest.fn()

      await baseTranslation['processTranslations'](
        translations,
        sourceStringMap,
        'ko',
        validateData,
        upsertTranslation
      )

      expect(validateData).not.toHaveBeenCalled()
      expect(upsertTranslation).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No valid translations to upsert'
      )
    })

    it('should skip translations that fail validation', async () => {
      const sourceStringMap = new Map([[1, mockSourceString]])
      const translations = [mockTranslation]
      const validateData = jest.fn().mockReturnValue(false)
      const upsertTranslation = jest.fn()

      await baseTranslation['processTranslations'](
        translations,
        sourceStringMap,
        'ko',
        validateData,
        upsertTranslation
      )

      expect(validateData).toHaveBeenCalledWith({
        sourceString: mockSourceString,
        translation: mockTranslation,
        languageCode: 'ko'
      })
      expect(upsertTranslation).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No valid translations to upsert'
      )
    })

    it('should handle empty translations array', async () => {
      const sourceStringMap = new Map([[1, mockSourceString]])
      const validateData = jest.fn()
      const upsertTranslation = jest.fn()

      await baseTranslation['processTranslations'](
        [],
        sourceStringMap,
        'ko',
        validateData,
        upsertTranslation
      )

      expect(validateData).not.toHaveBeenCalled()
      expect(upsertTranslation).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No valid translations to upsert'
      )
    })

    it('should process multiple valid translations', async () => {
      const mockTranslation2 = {
        ...mockTranslation,
        stringId: 2,
        text: 'Test Translation 2'
      }
      const mockSourceString2 = {
        ...mockSourceString,
        id: 2,
        text: 'Source Text 2'
      }

      const sourceStringMap = new Map([
        [1, mockSourceString],
        [2, mockSourceString2]
      ])
      const translations = [mockTranslation, mockTranslation2]
      const validateData = jest.fn().mockReturnValue(true)
      const upsertTranslation = jest.fn().mockResolvedValue(undefined)

      await baseTranslation['processTranslations'](
        translations,
        sourceStringMap,
        'ko',
        validateData,
        upsertTranslation
      )

      expect(validateData).toHaveBeenCalledTimes(2)
      expect(upsertTranslation).toHaveBeenCalledTimes(2)
      expect(mockLogger.info).toHaveBeenCalledWith(
        { count: 2 },
        'Found valid translations to upsert'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully upserted 2 translations'
      )
    })
  })

  describe('processLanguage', () => {
    const mockSourceString = {
      ...baseMockSourceString,
      id: 1,
      text: 'Source Text'
    }

    const mockTranslation = {
      stringId: 1,
      contentType: 'text/plain',
      translationId: 1,
      text: 'Test Translation',
      user: mockUser,
      createdAt: '',
      updatedAt: ''
    } as unknown as StringTranslationsModel.PlainLanguageTranslation

    it('should process language successfully', async () => {
      const { listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )
      listLanguageTranslations.mockResolvedValueOnce({
        data: [{ data: mockTranslation }],
        pagination: { offset: 0, limit: 500 }
      })

      const sourceStringMap = new Map([[1, mockSourceString]])
      const validateData = jest.fn().mockReturnValue(true)
      const upsertTranslation = jest.fn().mockResolvedValue(undefined)

      await baseTranslation['processLanguage'](
        'ko',
        ARCLIGHT_FILES.collection_title,
        sourceStringMap,
        validateData,
        upsertTranslation
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Fetching translations for ko'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        { count: 1, languageCode: 'ko' },
        'Total translations fetched'
      )
      expect(mockLogger.info).toHaveBeenCalledWith('Processing translations...')
      expect(validateData).toHaveBeenCalled()
      expect(upsertTranslation).toHaveBeenCalled()
    })

    it('should handle empty translations', async () => {
      const { listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )
      listLanguageTranslations.mockResolvedValueOnce({
        data: [],
        pagination: { offset: 0, limit: 500 }
      })

      const sourceStringMap = new Map([[1, mockSourceString]])
      const validateData = jest.fn()
      const upsertTranslation = jest.fn()

      await baseTranslation['processLanguage'](
        'ko',
        ARCLIGHT_FILES.collection_title,
        sourceStringMap,
        validateData,
        upsertTranslation
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Fetching translations for ko'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        { count: 0, languageCode: 'ko' },
        'Total translations fetched'
      )
      expect(validateData).not.toHaveBeenCalled()
      expect(upsertTranslation).not.toHaveBeenCalled()
    })

    it('should handle 404 error gracefully', async () => {
      const { listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )
      const error = new Error('Language not found')
      ;(error as any).code = 404
      listLanguageTranslations.mockRejectedValueOnce(error)

      const sourceStringMap = new Map([[1, mockSourceString]])
      const validateData = jest.fn()
      const upsertTranslation = jest.fn()

      await baseTranslation['processLanguage'](
        'xx',
        ARCLIGHT_FILES.collection_title,
        sourceStringMap,
        validateData,
        upsertTranslation
      )

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Language xx not configured in project'
      )
      expect(validateData).not.toHaveBeenCalled()
      expect(upsertTranslation).not.toHaveBeenCalled()
    })

    it('should propagate non-404 errors', async () => {
      const { listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )
      const error = new Error('API Error')
      listLanguageTranslations.mockRejectedValueOnce(error)

      const sourceStringMap = new Map([[1, mockSourceString]])
      const validateData = jest.fn()
      const upsertTranslation = jest.fn()

      await expect(
        baseTranslation['processLanguage'](
          'ko',
          ARCLIGHT_FILES.collection_title,
          sourceStringMap,
          validateData,
          upsertTranslation
        )
      ).rejects.toThrow('API Error')
    })
  })

  describe('processFile', () => {
    const mockSourceString = {
      ...baseMockSourceString,
      id: 1,
      text: 'Source Text'
    }

    const mockTranslation = {
      stringId: 1,
      contentType: 'text/plain',
      translationId: 1,
      text: 'Test Translation',
      user: mockUser,
      createdAt: '',
      updatedAt: ''
    } as unknown as StringTranslationsModel.PlainLanguageTranslation

    it('should process file successfully', async () => {
      const { listProjectStrings, listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )

      // Mock source strings fetch
      listProjectStrings.mockResolvedValueOnce({
        data: [{ data: mockSourceString }],
        pagination: { offset: 0, limit: 500 }
      })

      // Mock translations fetch for each language
      listLanguageTranslations.mockResolvedValue({
        data: [{ data: mockTranslation }],
        pagination: { offset: 0, limit: 500 }
      })

      const validateData = jest.fn().mockReturnValue(true)
      const upsertTranslation = jest.fn().mockResolvedValue(undefined)

      await baseTranslation.processFile(
        ARCLIGHT_FILES.collection_title,
        validateData,
        upsertTranslation
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        { fileName: ARCLIGHT_FILES.collection_title.name },
        'Fetching strings from file'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        { count: 1, fileName: ARCLIGHT_FILES.collection_title.name },
        'Found strings in file'
      )
      // Should be called for each language in CROWDIN_LANGUAGE_CODE_TO_ID
      expect(validateData).toHaveBeenCalled()
      expect(upsertTranslation).toHaveBeenCalled()
    })

    it('should handle empty source strings', async () => {
      const { listProjectStrings } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )

      listProjectStrings.mockResolvedValueOnce({
        data: [],
        pagination: { offset: 0, limit: 500 }
      })

      const validateData = jest.fn()
      const upsertTranslation = jest.fn()

      await baseTranslation.processFile(
        ARCLIGHT_FILES.collection_title,
        validateData,
        upsertTranslation
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        '❌ No strings found to translate'
      )
      expect(validateData).not.toHaveBeenCalled()
      expect(upsertTranslation).not.toHaveBeenCalled()
    })

    it('should process all configured languages', async () => {
      const { listProjectStrings, listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )

      // Mock source strings fetch
      listProjectStrings.mockResolvedValueOnce({
        data: [{ data: mockSourceString }],
        pagination: { offset: 0, limit: 500 }
      })

      // Mock translations fetch for each language
      listLanguageTranslations.mockResolvedValue({
        data: [{ data: mockTranslation }],
        pagination: { offset: 0, limit: 500 }
      })

      const validateData = jest.fn().mockReturnValue(true)
      const upsertTranslation = jest.fn().mockResolvedValue(undefined)

      await baseTranslation.processFile(
        ARCLIGHT_FILES.collection_title,
        validateData,
        upsertTranslation
      )

      // Should be called once for each language in CROWDIN_LANGUAGE_CODE_TO_ID
      const languageCount = Object.keys(CROWDIN_LANGUAGE_CODE_TO_ID).length
      expect(listLanguageTranslations).toHaveBeenCalledTimes(languageCount)
      expect(validateData).toHaveBeenCalledTimes(languageCount)
      expect(upsertTranslation).toHaveBeenCalledTimes(languageCount)
    })

    it('should continue processing if one language fails', async () => {
      const { listProjectStrings, listLanguageTranslations } = jest.requireMock(
        '@crowdin/crowdin-api-client'
      )

      // Mock source strings fetch
      listProjectStrings.mockResolvedValueOnce({
        data: [{ data: mockSourceString }],
        pagination: { offset: 0, limit: 500 }
      })

      // Mock translations fetch to fail for one language but succeed for others
      listLanguageTranslations.mockImplementation(
        (projectId: number, languageCode: string) => {
          if (languageCode === 'ko') {
            const error = new Error('Language not found')
            ;(error as any).code = 404
            return Promise.reject(error)
          }
          return Promise.resolve({
            data: [{ data: mockTranslation }],
            pagination: { offset: 0, limit: 500 }
          })
        }
      )

      const validateData = jest.fn().mockReturnValue(true)
      const upsertTranslation = jest.fn().mockResolvedValue(undefined)

      await baseTranslation.processFile(
        ARCLIGHT_FILES.collection_title,
        validateData,
        upsertTranslation
      )

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Language ko not configured in project'
      )
      // Should still process other languages
      expect(validateData).toHaveBeenCalled()
      expect(upsertTranslation).toHaveBeenCalled()
    })
  })
})
