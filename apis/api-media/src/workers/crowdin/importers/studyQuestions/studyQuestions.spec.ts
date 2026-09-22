import type { Logger } from 'pino'
import { type Mocked, vi } from 'vitest'

import { VideoStudyQuestion } from '@core/prisma/media/client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

import { importStudyQuestions } from './studyQuestions'

vi.mock('../../importer')

const testTranslation: ProcessedTranslation = {
  stringId: 101161,
  identifier: 'a81947c6-6d1d-4a2f-9613-3e29a27967be',
  text: 'Test study question',
  languageId: '529'
}

const testQuestion: VideoStudyQuestion = {
  id: '1',
  videoId: 'VIDEO123',
  order: 1,
  crowdInId: '101161',
  value: 'Default question text',
  languageId: '529',
  primary: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('importStudyQuestions', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    child: vi.fn().mockReturnThis()
  } as unknown as Partial<Logger> as Mocked<Logger>

  let cleanup: (() => void) | undefined

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // the importer keeps the question map and missing-question set in module
  // scope, so each test must release them or state leaks into the next
  afterEach(() => {
    cleanup?.()
    cleanup = undefined
  })

  it('should import study questions keyed on the crowdin string id', async () => {
    prismaMock.videoStudyQuestion.findMany.mockResolvedValueOnce([testQuestion])
    vi.mocked(processFile).mockImplementation(async (_, callback) => {
      await callback(testTranslation)
    })

    cleanup = await importStudyQuestions(mockLogger)

    expect(prismaMock.videoStudyQuestion.findMany).toHaveBeenCalledWith({
      select: {
        videoId: true,
        order: true,
        crowdInId: true
      },
      where: {
        crowdInId: { not: null },
        languageId: { equals: '529' }
      }
    })

    const expected = {
      crowdInId: '101161',
      value: testTranslation.text,
      languageId: testTranslation.languageId,
      order: testQuestion.order,
      videoId: testQuestion.videoId,
      primary: true
    }

    expect(prismaMock.videoStudyQuestion.upsert).toHaveBeenCalledWith({
      where: {
        videoId_languageId_order: {
          videoId: testQuestion.videoId,
          languageId: testTranslation.languageId,
          order: testQuestion.order
        }
      },
      update: expected,
      create: expected
    })
  })

  it('should mark translations as non-primary for other languages', async () => {
    prismaMock.videoStudyQuestion.findMany.mockResolvedValueOnce([testQuestion])
    vi.mocked(processFile).mockImplementation(async (_, callback) => {
      await callback({ ...testTranslation, languageId: '18259' })
    })

    cleanup = await importStudyQuestions(mockLogger)

    expect(prismaMock.videoStudyQuestion.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          crowdInId: '101161',
          languageId: '18259',
          primary: false
        })
      })
    )
  })

  it('should skip translations with no string id', async () => {
    prismaMock.videoStudyQuestion.findMany.mockResolvedValueOnce([testQuestion])
    vi.mocked(processFile).mockImplementation(async (_, callback) => {
      await callback({
        ...testTranslation,
        stringId: null
      } as unknown as ProcessedTranslation)
    })

    cleanup = await importStudyQuestions(mockLogger)

    expect(mockLogger.debug).toHaveBeenCalledWith(
      `Skipping study question - missing stringId: ${testTranslation.text}`
    )
    expect(prismaMock.videoStudyQuestion.upsert).not.toHaveBeenCalled()
  })

  it('should track missing questions', async () => {
    prismaMock.videoStudyQuestion.findMany.mockResolvedValueOnce([])

    vi.mocked(processFile).mockImplementation(async (_, callback) => {
      await callback({ ...testTranslation, stringId: 999999 })
    })

    cleanup = await importStudyQuestions(mockLogger)

    expect(prismaMock.videoStudyQuestion.upsert).not.toHaveBeenCalled()
    expect(mockLogger.warn).toHaveBeenCalledWith(
      {
        count: 1,
        questions: ['999999']
      },
      'Study questions not found in database'
    )
  })

  it('should handle database errors', async () => {
    prismaMock.videoStudyQuestion.findMany.mockResolvedValueOnce([testQuestion])
    vi.mocked(processFile).mockImplementation(async (_, callback) => {
      await callback(testTranslation)
    })

    prismaMock.videoStudyQuestion.upsert.mockRejectedValueOnce(
      new Error('Database error')
    )

    cleanup = await importStudyQuestions(mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to upsert study question ${testTranslation.stringId} in language ${testTranslation.languageId}:`,
      expect.objectContaining({
        message: expect.stringContaining('Database error')
      })
    )
  })
})
