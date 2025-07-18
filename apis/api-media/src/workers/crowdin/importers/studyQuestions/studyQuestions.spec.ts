import type { Logger } from 'pino'

import { VideoStudyQuestion } from '@core/prisma/media/client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

import { importStudyQuestions } from './studyQuestions'

jest.mock('../../importer')

const testTranslation: ProcessedTranslation = {
  identifier: 'QUESTION123',
  text: 'Test study question',
  languageId: '529',
  context: 'QUESTION123\nSome additional context'
}

const testQuestion: VideoStudyQuestion = {
  id: '1',
  videoId: 'VIDEO123',
  order: 1,
  crowdInId: 'QUESTION123',
  value: 'Default question text',
  languageId: '529',
  primary: false
}

describe('importStudyQuestions', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    child: jest.fn().mockReturnThis()
  } as unknown as Partial<Logger> as jest.Mocked<Logger>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should import study questions successfully', async () => {
    prismaMock.videoStudyQuestion.findMany.mockResolvedValueOnce([testQuestion])
    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(testTranslation)
      })

    await importStudyQuestions(mockLogger)

    expect(prismaMock.videoStudyQuestion.findMany).toHaveBeenCalledWith({
      select: {
        videoId: true,
        order: true,
        crowdInId: true
      },
      where: {
        crowdInId: { not: null },
        videoId: { not: null },
        languageId: { equals: '529' }
      }
    })

    expect(prismaMock.videoStudyQuestion.upsert).toHaveBeenCalledWith({
      where: {
        videoId_languageId_order: {
          videoId: testQuestion.videoId,
          languageId: testTranslation.languageId,
          order: testQuestion.order
        }
      },
      update: {
        crowdInId: testQuestion.crowdInId,
        value: testTranslation.text,
        languageId: testTranslation.languageId,
        order: testQuestion.order,
        primary: false
      },
      create: {
        crowdInId: testQuestion.crowdInId,
        value: testTranslation.text,
        languageId: testTranslation.languageId,
        order: testQuestion.order,
        primary: false
      }
    })
  })

  it('should skip questions with invalid IDs', async () => {
    const invalidTranslation = { ...testTranslation, context: '' }
    prismaMock.videoStudyQuestion.findMany.mockResolvedValueOnce([testQuestion])

    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(invalidTranslation)
      })

    await importStudyQuestions(mockLogger)

    expect(mockLogger.debug).toHaveBeenCalledWith(
      'Skipping study question - Invalid ID: '
    )
    expect(prismaMock.videoStudyQuestion.upsert).not.toHaveBeenCalled()
  })

  it('should track missing questions', async () => {
    prismaMock.videoStudyQuestion.findMany.mockResolvedValueOnce([])

    const translationWithMissingQuestion: ProcessedTranslation = {
      identifier: 'QUESTION123',
      text: 'Test study question',
      languageId: '529',
      context: 'MISSING_QUESTION\nSome additional context'
    }

    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(translationWithMissingQuestion)
      })

    await importStudyQuestions(mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      {
        count: 1,
        questions: ['MISSING_QUESTION']
      },
      'Study questions not found in database'
    )
  })

  it('should handle database errors', async () => {
    prismaMock.videoStudyQuestion.findMany.mockResolvedValueOnce([testQuestion])
    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(testTranslation)
      })

    prismaMock.videoStudyQuestion.upsert.mockRejectedValueOnce(
      new Error('Database error')
    )

    await importStudyQuestions(mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to upsert study question for video ${testTranslation.context} in language ${testTranslation.languageId}:`,
      expect.objectContaining({
        message: expect.stringContaining('Database error')
      })
    )
  })
})
