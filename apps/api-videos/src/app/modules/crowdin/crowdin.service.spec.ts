import OtaClient from '@crowdin/ota-client'
import { Test } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'

import { Video } from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

import { CrowdinService } from './crowdin.service'

jest.mock('@crowdin/ota-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getTranslations: mockGetTranslations
    }
  })
})

const mockOtaClient = OtaClient
const mockGetTranslations = jest.fn().mockResolvedValue({})

describe('CrowdinService', () => {
  let service: CrowdinService
  let prismaService: DeepMockProxy<PrismaService>

  const originalEnv = clone(process.env)

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CrowdinService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<CrowdinService>(CrowdinService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    process.env = originalEnv
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('pullTranslations', () => {
    it('should throw if no distribution hash', async () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(service.pullTranslations()).rejects.toThrow(
        'crowdin distribution hash not set'
      )
    })

    it('should get crowdin translations for titles and push to api-videos', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.video.findMany.mockResolvedValue([
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
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/media_metadata_tile.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="cl13-0-0">
                <source>StoryClubs</source>
                <target>스토리 클럽</target>
              </trans-unit>
              </body>
            </file>star
            <file id="36" original="/Arclight/collection_title.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="2" resname="cl13-0-0">
                <source>StoryClubs</source>
                <target>스토리 클럽</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/3804.xliff'
          }
        ]
      })

      await service.pullTranslations()
      expect(mockOtaClient).toHaveBeenCalledWith('hash', {
        disableManifestCache: true,
        disableStringsCache: true
      })
      expect(prismaService.video.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: { endsWith: 'cl13-0-0' }
        }
      })
      expect(prismaService.videoTitle.upsert).toHaveBeenCalledWith({
        create: {
          languageId: '3804',
          primary: false,
          value: '스토리 클럽',
          videoId: 'id'
        },
        update: { value: '스토리 클럽' },
        where: { videoId_languageId: { languageId: '3804', videoId: 'id' } }
      })
      expect(prismaService.videoTitle.upsert).toHaveBeenCalledTimes(2)
    })

    it('should get crowdin translations for descriptions and push to api-videos', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.video.findMany.mockResolvedValue([
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
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/collection_long_description.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="cl13-0-0">
                <source>StoryClubs</source>
                <target>스토리 클럽</target>
              </trans-unit>
              </body>
            </file>
            <file id="36" original="/Arclight/media_metadata_description.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="2" resname="cl13-0-0">
                <source>StoryClubs</source>
                <target>스토리 클럽</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/3804.xliff'
          }
        ]
      })

      await service.pullTranslations()
      expect(mockOtaClient).toHaveBeenCalledWith('hash', {
        disableManifestCache: true,
        disableStringsCache: true
      })
      expect(prismaService.video.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: { endsWith: 'cl13-0-0' }
        }
      })
      expect(prismaService.videoDescription.upsert).toHaveBeenCalledWith({
        create: {
          languageId: '3804',
          primary: false,
          value: '스토리 클럽',
          videoId: 'id'
        },
        update: { value: '스토리 클럽' },
        where: { videoId_languageId: { languageId: '3804', videoId: 'id' } }
      })
      expect(prismaService.videoDescription.upsert).toHaveBeenCalledTimes(2)
    })

    it('should get crowdin translations for study questions and push to api-videos', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'

      prismaService.videoStudyQuestion.findMany.mockResolvedValue([
        {
          id: '1',
          value: 'Why?',
          languageId: '529',
          order: 1,
          primary: true,
          crowdInId: '1',
          videoId: 'video1'
        },
        {
          id: '2',
          value: 'Why?',
          languageId: '529',
          order: 1,
          primary: true,
          crowdInId: '1',
          videoId: 'video2'
        }
      ])
      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/study_questions.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="1">
                <source>Why?</source>
                <target>그 이유는?</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/3804.xliff'
          }
        ]
      })

      await service.pullTranslations()
      expect(mockOtaClient).toHaveBeenCalledWith('hash', {
        disableManifestCache: true,
        disableStringsCache: true
      })
      expect(prismaService.videoStudyQuestion.upsert).toHaveBeenNthCalledWith(
        1,
        {
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
        }
      )
      expect(prismaService.videoStudyQuestion.upsert).toHaveBeenNthCalledWith(
        2,
        {
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
        }
      )
      expect(prismaService.videoStudyQuestion.upsert).toHaveBeenCalledTimes(2)
    })

    it('should get crowdin translations for bible book names and push to api-videos', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'

      prismaService.bibleBook.findMany.mockResolvedValue([
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
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/Bible_books.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="1">
                <source>Genesis</source>
                <target>창세기</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/3804.xliff'
          }
        ]
      })

      await service.pullTranslations()
      expect(mockOtaClient).toHaveBeenCalledWith('hash', {
        disableManifestCache: true,
        disableStringsCache: true
      })

      expect(prismaService.bibleBook.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: '1'
        }
      })
      expect(prismaService.bibleBookName.upsert).toHaveBeenCalledWith({
        create: {
          languageId: '3804',
          primary: false,
          value: '창세기',
          bibleBookId: '1'
        },
        update: { value: '창세기' },
        where: { bibleBookId_languageId: { languageId: '3804', bibleBookId: '1' } }
      })
    })

    it('should throw if exported filename is wrong format', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.video.findMany.mockResolvedValue([])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/study_questions.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="1">
                <source>Why?</source>
                <target>그 이유는?</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/ko.xliff'
          }
        ]
      })

      await expect(service.pullTranslations()).rejects.toThrow(
        'export filename does not match format or custom mapping not set: /content/ko.xliff'
      )
    })

    it('should throw if data does not match schema', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.video.findMany.mockResolvedValue([])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: 'wrong format',
            file: '/content/3804.xliff'
          }
        ]
      })

      await expect(service.pullTranslations()).rejects.toThrow(
        'xliff12ToJs data does not match schema'
      )
    })

    it('should throw if no matching videoId for titles', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.video.findMany.mockResolvedValue([])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/media_metadata_tile.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="cl13-0-0">
                <source>StoryClubs</source>
                <target>스토리 클럽</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/3804.xliff'
          }
        ]
      })

      await expect(service.pullTranslations()).rejects.toThrow(
        'no matching videoId found for cl13-0-0'
      )
    })

    it('should throw if no matching videoId for descriptions', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.video.findMany.mockResolvedValue([])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/media_metadata_description.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="cl13-0-0">
                <source>StoryClubs</source>
                <target>스토리 클럽</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/3804.xliff'
          }
        ]
      })

      await expect(service.pullTranslations()).rejects.toThrow(
        'no matching videoId found for cl13-0-0'
      )
    })

    it('should throw if no matching videoId for study questions upsert', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.videoStudyQuestion.findMany.mockResolvedValue([
        {
          id: '1',
          value: 'Why?',
          languageId: '529',
          order: 1,
          primary: true,
          crowdInId: '1',
          videoId: null
        }
      ])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/study_questions.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="1">
                <source>Why?</source>
                <target>그 이유는?</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/3804.xliff'
          }
        ]
      })

      await expect(service.pullTranslations()).rejects.toThrow(
        'no matching videoId found for 1'
      )
    })

    it('should throw if no matching crowdInId for study question upsert', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.videoStudyQuestion.findMany.mockResolvedValue([])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/study_questions.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="1">
                <source>Why?</source>
                <target>그 이유는?</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/3804.xliff'
          }
        ]
      })

      await expect(service.pullTranslations()).rejects.toThrow(
        'no matching crowdInId found for 1'
      )
    })

    it('should throw if no matching bibleBookId for bible book name upsert', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.bibleBook.findMany.mockResolvedValue([])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/Bible_books.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="1">
                <source>Genesis</source>
                <target>창세기</target>
              </trans-unit>
              </body>
            </file>
            </xliff>`,
            file: '/content/3804.xliff'
          }
        ]
      })

      await expect(service.pullTranslations()).rejects.toThrow(
        'no matching bibleBookId found for 1'
      )
    })
  })
})
