import OtaClient from '@crowdin/ota-client'
import clone from 'lodash/clone'

import { Video } from '.prisma/api-media-client'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

jest.mock('@crowdin/ota-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getTranslations: mockGetTranslations
    }
  })
})

const mockOtaClient = OtaClient
const mockGetTranslations = jest.fn().mockResolvedValue({})

describe('crowdin/service', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = originalEnv
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('pullTranslations', () => {
    it('should throw if no distribution hash', async () => {
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
          value: '스토리 클럽',
          videoId: 'id'
        },
        update: { value: '스토리 클럽' },
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

      await service()
      expect(mockOtaClient).toHaveBeenCalledWith('hash', {
        disableManifestCache: true,
        disableStringsCache: true
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
