import type { Logger } from 'pino'

import { BibleBookName } from '@core/prisma/media/client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

import { importBibleBooks } from './bibleBooks'

jest.mock('../../importer')

const testTranslation: ProcessedTranslation = {
  identifier: 'GEN',
  text: 'Genesis',
  languageId: '529',
  context: ''
}

const expectedBibleBookName: Omit<
  BibleBookName,
  'id' | 'createdAt' | 'updatedAt'
> = {
  bibleBookId: 'GEN',
  languageId: '529',
  value: 'Genesis',
  primary: false
}

describe('importBibleBooks', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis()
  } as unknown as Partial<Logger> as jest.Mocked<Logger>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should import bible books successfully', async () => {
    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(testTranslation)
      })

    await importBibleBooks(mockLogger)

    expect(prismaMock.bibleBookName.upsert).toHaveBeenCalledWith({
      where: {
        bibleBookId_languageId: {
          bibleBookId: expectedBibleBookName.bibleBookId,
          languageId: expectedBibleBookName.languageId
        }
      },
      create: expectedBibleBookName,
      update: expectedBibleBookName
    })
  })

  it('should handle invalid bible book data', async () => {
    const invalidTranslation = {
      text: testTranslation.text,
      languageId: testTranslation.languageId,
      context: testTranslation.context,
      identifier: null
    } as unknown as ProcessedTranslation

    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(invalidTranslation)
      })

    await importBibleBooks(mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to upsert bible book null in language 529:',
      expect.any(Error)
    )
  })

  it('should handle database errors', async () => {
    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(testTranslation)
      })

    prismaMock.bibleBookName.upsert.mockRejectedValueOnce(
      new Error('Database error')
    )

    await importBibleBooks(mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to upsert bible book GEN in language 529:',
      expect.objectContaining({
        message: expect.stringContaining('Database error')
      })
    )
  })
})
