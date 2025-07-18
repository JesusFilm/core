import type { Logger } from 'pino'

import { Video } from '@core/prisma-media/client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

import {
  getFullVideoId,
  importVideoTitles,
  resetVideoCache
} from './videoTitles'

jest.mock('../../importer')

const testVideo: Video = {
  id: 'VIDEO123',
  label: 'episode',
  primaryLanguageId: '529',
  published: true,
  slug: null,
  noIndex: false,
  childIds: [],
  locked: false,
  availableLanguages: ['529'],
  originId: null,
  restrictDownloadPlatforms: [],
  restrictViewPlatforms: [],
  publishedAt: null
}

const testTranslation: ProcessedTranslation = {
  identifier: 'VIDEO123',
  text: 'Test video title',
  languageId: '529',
  context: ''
}

describe('importVideoTitles', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis()
  } as unknown as Partial<Logger> as jest.Mocked<Logger>

  beforeEach(() => {
    jest.clearAllMocks()
    resetVideoCache()
  })

  it('should import video titles successfully', async () => {
    prismaMock.video.findMany.mockResolvedValueOnce([testVideo])
    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(testTranslation)
      })

    await importVideoTitles(mockLogger)

    expect(prismaMock.video.findMany).toHaveBeenCalledWith({
      select: { id: true }
    })

    expect(prismaMock.videoTitle.upsert).toHaveBeenCalledWith({
      where: {
        videoId_languageId: {
          videoId: testTranslation.identifier,
          languageId: testTranslation.languageId
        }
      },
      update: {
        videoId: testTranslation.identifier,
        value: testTranslation.text,
        languageId: testTranslation.languageId,
        primary: false
      },
      create: {
        videoId: testTranslation.identifier,
        value: testTranslation.text,
        languageId: testTranslation.languageId,
        primary: false
      }
    })
  })

  it('should handle database fetch errors', async () => {
    prismaMock.video.findMany.mockRejectedValueOnce(new Error('Database error'))

    await expect(importVideoTitles(mockLogger)).rejects.toThrow(
      'Video import failed: Unable to load video data'
    )
  })

  it('should handle invalid video IDs', async () => {
    const differentVideo = { ...testVideo, id: 'DIFFERENT_VIDEO' }
    prismaMock.video.findMany.mockResolvedValueOnce([differentVideo])

    jest
      .spyOn({ processFile }, 'processFile')
      .mockImplementation(async (_, callback) => {
        await callback(testTranslation)
      })

    await importVideoTitles(mockLogger)

    expect(prismaMock.videoTitle.upsert).not.toHaveBeenCalled()
  })
})

describe('Video ID lookup', () => {
  beforeEach(() => {
    resetVideoCache()
  })

  it('should find exact video ID match', async () => {
    prismaMock.video.findMany.mockResolvedValueOnce([testVideo])
    await importVideoTitles()
    expect(getFullVideoId('VIDEO123')).toBe('VIDEO123')
  })

  it('should find video ID from suffix match', async () => {
    const prefixedVideo = { ...testVideo, id: 'PREFIX_VIDEO123' }
    prismaMock.video.findMany.mockResolvedValueOnce([prefixedVideo])
    await importVideoTitles()
    expect(getFullVideoId('VIDEO123')).toBe('PREFIX_VIDEO123')
  })

  it('should return undefined for no match', async () => {
    prismaMock.video.findMany.mockResolvedValueOnce([])
    await importVideoTitles()
    expect(getFullVideoId('VIDEO123')).toBeUndefined()
  })
})
