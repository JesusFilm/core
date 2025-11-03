import type { Logger } from 'pino'

import { prismaMock } from '../../../../../test/prismaMock'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'
import { getFullVideoId } from '../videoTitles/videoTitles'

import { importVideoDescriptions } from './videoDescriptions'

jest.mock('../../importer')
jest.mock('../videoTitles/videoTitles')

const testTranslation: ProcessedTranslation = {
  identifier: 'VIDEO123',
  text: 'Test video description',
  languageId: '529',
  context: ''
}

describe('importVideoDescriptions', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis()
  } as unknown as Partial<Logger> as jest.Mocked<Logger>

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(getFullVideoId).mockReturnValue('FULL_VIDEO123')
  })

  it('should import video descriptions successfully', async () => {
    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
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
    jest.mocked(getFullVideoId).mockReturnValue(undefined)

    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(testTranslation)
      })

    await importVideoDescriptions(mockLogger)

    expect(prismaMock.videoDescription.upsert).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
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
