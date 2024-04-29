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

  describe('getCrowdinTranslations', () => {
    it('should throw if no distribution hash', async () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(service.getCrowdinTranslations()).rejects.toThrow(
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
            </file>
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

      await service.getCrowdinTranslations()
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

      await service.getCrowdinTranslations()
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

    it('should throw if no matching videoId', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      prismaService.video.findMany.mockResolvedValue([])

      mockGetTranslations.mockResolvedValue({
        ko: [
          {
            content: `<?xml version="1.0" encoding="UTF-8"?>
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file id="35" original="/Arclight/collection_long_description.csv" source-language="en" target-language="ko">
              <body>
              <trans-unit id="1" resname="ohno">
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

      await expect(service.getCrowdinTranslations()).rejects.toThrow(
        'no matching videoId found for ohno'
      )
    })
  })
})
