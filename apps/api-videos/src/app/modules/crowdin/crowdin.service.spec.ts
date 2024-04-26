import OtaClient from '@crowdin/ota-client'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'
import { xliff12ToJs } from 'xliff'

import { Video } from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

import { CrowdinService } from './crowdin.service'

const mockGetTranslations = jest.fn().mockResolvedValue({})

jest.mock('@crowdin/ota-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getTranslations: mockGetTranslations
    }
  })
})

const mockOtaClient = OtaClient

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
        <file id="35" original="/Arclight/media_metadata_tile.csv" source-language="en" target-language="ko" datatype="plaintext" project-id="47654" tool-id="crowdin">
          <header>
            <tool tool-id="crowdin" tool-name="Crowdin" tool-version="1.1"/>
          </header>
          <body>
            <trans-unit id="40096" resname="cl13-0-0">
              <source>StoryClubs</source>
              <target state="needs-translation">스토리 클럽</target>
              <context-group purpose="information">
                <context context-type="source">cl13-0-0</context>
              </context-group>
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
    })
  })
})
