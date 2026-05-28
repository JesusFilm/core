import type { Logger } from 'pino'
import { type Mocked, vi } from 'vitest'

import { prismaMock } from '../../../../../test/prismaMock'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'
import { getFullVideoId } from '../videoTitles/videoTitles'

import { importVideoDescriptions } from './videoDescriptions'

vi.mock('../../importer')
vi.mock('../videoTitles/videoTitles')

const testTranslation: ProcessedTranslation = {
  identifier: 'VIDEO123',
  text: 'Test video description',
  languageId: '529',
  context: ''
}

describe('importVideoDescriptions', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis()
  } as unknown as Partial<Logger> as Mocked<Logger>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getFullVideoId).mockReturnValue('FULL_VIDEO123')
  })

  it('should import video descriptions successfully', async () => {
    vi.mocked(processFile).mockImplementation(async (_, callback) => {
      await callback(testTranslation)
    })

    await importVideoDescriptions(mockLogger)

    expect(prismaMock.videoDescription.upsert).toHaveBeenCalledWith({
      where: {
        videoId_languageId: {
          videoId: 'FULL_VIDEO123',
          languageId: testTranslation.languageId
        }
      },
      update: {
        videoId: 'FULL_VIDEO123',
        value: testTranslation.text,
        languageId: testTranslation.languageId,
        primary: false
      },
      create: {
        videoId: 'FULL_VIDEO123',
        value: testTranslation.text,
        languageId: testTranslation.languageId,
        primary: false
      }
    })
  })

  it('should handle invalid video IDs', async () => {
    vi.mocked(getFullVideoId).mockReturnValue(undefined)

    vi.mocked(processFile).mockImplementation(async (_, callback) => {
      await callback(testTranslation)
    })

    await importVideoDescriptions(mockLogger)

    expect(prismaMock.videoDescription.upsert).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    vi.mocked(processFile).mockImplementation(async (_, callback) => {
      await callback(testTranslation)
    })

    prismaMock.videoDescription.upsert.mockRejectedValueOnce(
      new Error('Database error')
    )

    await importVideoDescriptions(mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to upsert video description for video ${testTranslation.identifier} in language ${testTranslation.languageId}:`,
      expect.objectContaining({
        message: expect.stringContaining('Database error')
      })
    )
  })
})
