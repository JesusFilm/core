import OtaClient from '@crowdin/ota-client'
import clone from 'lodash/clone'

import { Video } from '.prisma/api-media-client'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

const mockGetTranslations = jest.fn().mockResolvedValue({})

jest.mock('xliff', () => ({
  xliff12ToJs: jest.fn().mockResolvedValue({
    resources: {
      '/Arclight/media_metadata_tile.csv': {
        '1': {
          source: 'StoryClubs',
          target: '스토리 클럽',
          additionalAttributes: {
            resname: 'cl13-0-0'
          }
        }
      },
      '/Arclight/collection_title.csv': {
        '2': {
          source: 'StoryClubs',
          target: '스토리 클럽',
          additionalAttributes: {
            resname: 'cl13-0-0'
          }
        }
      },
      '/Arclight/collection_long_description.csv': {
        '3': {
          source: 'StoryClubs Description',
          target: '스토리 클럽 설명',
          additionalAttributes: {
            resname: 'cl13-0-0'
          }
        }
      },
      '/Arclight/media_metadata_description.csv': {
        '4': {
          source: 'StoryClubs Description',
          target: '스토리 클럽 설명',
          additionalAttributes: {
            resname: 'cl13-0-0'
          }
        }
      },
      '/Arclight/study_questions.csv': {
        '5': {
          source: 'Why?',
          target: '그 이유는?',
          additionalAttributes: {
            resname: '1'
          }
        }
      },
      '/Arclight/Bible_books.csv': {
        '6': {
          source: 'Genesis',
          target: '창세기',
          additionalAttributes: {
            resname: '1'
          }
        }
      }
    }
  })
}))

jest.mock('@crowdin/ota-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getTranslations: mockGetTranslations
    }
  })
})

const mockOtaClient = OtaClient

describe('crowdin/service', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = originalEnv
    // Set default empty responses for all findMany calls
    prismaMock.video.findMany.mockResolvedValue([])
    prismaMock.videoStudyQuestion.findMany.mockResolvedValue([])
    prismaMock.bibleBook.findMany.mockResolvedValue([])
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('pullTranslations', () => {
    it('should throw if no distribution hash', async () => {
      delete process.env.CROWDIN_DISTRIBUTION_HASH

      await expect(service()).rejects.toThrow(
        'crowdin distribution hash not set'
      )
    })

    it('should get crowdin translations for titles and push to api-media', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'id',
          slug: 'video-slug',
          label: 'featureFilm',
          primaryLanguageId: '3804',
          seoTitle: [],
          snippet: [],
          description: [],
          studyQuestions: [],
          image: '',
          imageAlt: [],
          noIndex: false,
          childIds: []
        } as unknown as Video
      ])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: 'dummy content - this will be handled by xliff mock',
            file: '/content/3804.xliff'
          }
        ]
      })

      await service()
      expect(mockOtaClient).toHaveBeenCalledWith('hash', {
        disableManifestCache: true,
        disableStringsCache: true
      })

      expect(prismaMock.video.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: { endsWith: 'cl13-0-0' }
        }
      })

      expect(prismaMock.videoTitle.upsert).toHaveBeenCalledWith({
        create: {
          languageId: '3804',
          primary: false,
          value: '스토리 클럽',
          videoId: 'id'
        },
        update: { value: '스토리 클럽' },
        where: { videoId_languageId: { languageId: '3804', videoId: 'id' } }
      })

      expect(prismaMock.videoTitle.upsert).toHaveBeenCalledTimes(2)
    })

    it('should get crowdin translations for descriptions and push to api-media', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'id',
          slug: 'video-slug',
          label: 'featureFilm',
          primaryLanguageId: '3804',
          seoTitle: [],
          snippet: [],
          description: [],
          studyQuestions: [],
          image: '',
          imageAlt: [],
          noIndex: false,
          childIds: []
        } as unknown as Video
      ])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: 'dummy content - this will be handled by xliff mock',
            file: '/content/3804.xliff'
          }
        ]
      })

      await service()
      expect(mockOtaClient).toHaveBeenCalledWith('hash', {
        disableManifestCache: true,
        disableStringsCache: true
      })

      expect(prismaMock.video.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: { endsWith: 'cl13-0-0' }
        }
      })

      expect(prismaMock.videoDescription.upsert).toHaveBeenCalledWith({
        create: {
          languageId: '3804',
          primary: false,
          value: '스토리 클럽 설명',
          videoId: 'id'
        },
        update: { value: '스토리 클럽 설명' },
        where: { videoId_languageId: { languageId: '3804', videoId: 'id' } }
      })

      expect(prismaMock.videoDescription.upsert).toHaveBeenCalledTimes(2)
    })

    it('should get crowdin translations for study questions and push to api-media', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaMock.videoStudyQuestion.findMany.mockResolvedValue([
        {
          id: '1',
          value: 'Why?',
          languageId: '529',
          primary: true,
          videoId: 'video1',
          order: 1,
          crowdInId: '1'
        },
        {
          id: '2',
          value: 'Why?',
          languageId: '529',
          primary: true,
          videoId: 'video2',
          order: 1,
          crowdInId: '1'
        }
      ])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: 'dummy content - this will be handled by xliff mock',
            file: '/content/3804.xliff'
          }
        ]
      })

      await service()
      expect(mockOtaClient).toHaveBeenCalledWith('hash', {
        disableManifestCache: true,
        disableStringsCache: true
      })

      expect(prismaMock.videoStudyQuestion.findMany).toHaveBeenCalledWith({
        select: {
          videoId: true,
          order: true
        },
        where: { crowdInId: '1' }
      })

      expect(prismaMock.videoStudyQuestion.upsert).toHaveBeenNthCalledWith(1, {
        where: {
          videoId_languageId_order: {
            languageId: '3804',
            videoId: 'video1',
            order: 1
          }
        },
        update: { value: '그 이유는?' },
        create: {
          value: '그 이유는?',
          languageId: '3804',
          order: 1,
          primary: false,
          crowdInId: '1',
          videoId: 'video1'
        }
      })

      expect(prismaMock.videoStudyQuestion.upsert).toHaveBeenNthCalledWith(2, {
        where: {
          videoId_languageId_order: {
            languageId: '3804',
            videoId: 'video2',
            order: 1
          }
        },
        update: { value: '그 이유는?' },
        create: {
          value: '그 이유는?',
          languageId: '3804',
          order: 1,
          primary: false,
          crowdInId: '1',
          videoId: 'video2'
        }
      })

      expect(prismaMock.videoStudyQuestion.upsert).toHaveBeenCalledTimes(2)
    })

    it('should get crowdin translations for bible book names and push to api-media', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaMock.bibleBook.findMany.mockResolvedValue([
        {
          id: '1',
          osisId: 'Gen',
          alternateName: null,
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1
        }
      ])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: 'dummy content - this will be handled by xliff mock',
            file: '/content/3804.xliff'
          }
        ]
      })

      await service()
      expect(mockOtaClient).toHaveBeenCalledWith('hash', {
        disableManifestCache: true,
        disableStringsCache: true
      })

      expect(prismaMock.bibleBook.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: '1'
        }
      })

      expect(prismaMock.bibleBookName.upsert).toHaveBeenCalledWith({
        create: {
          languageId: '3804',
          primary: false,
          value: '창세기',
          bibleBookId: '1'
        },
        update: { value: '창세기' },
        where: {
          bibleBookId_languageId: { languageId: '3804', bibleBookId: '1' }
        }
      })
    })
  })
})
