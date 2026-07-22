import { vi } from 'vitest'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { updateVideoInAlgolia } from '../../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../../lib/algolia/algoliaVideoVariantUpdate'

const getObjectSpy = vi.fn()
const getObjectsSpy = vi.fn()
const browseSpy = vi.fn()
const deleteObjectSpy = vi.fn()

// Mock the algolia client helper
vi.mock('../../../lib/algolia/algoliaClient', () => ({
  getAlgoliaClient: () => ({
    getObject: getObjectSpy,
    getObjects: getObjectsSpy,
    browse: browseSpy,
    deleteObject: deleteObjectSpy
  }),
  getAlgoliaConfig: () => ({
    appId: 'test-app-id',
    apiKey: 'test-api-key',
    videosIndex: 'test-videos-index',
    videoVariantsIndex: 'test-video-variants-index'
  })
}))

// Mock the algolia update functions
vi.mock('../../../lib/algolia/algoliaVideoUpdate', () => ({
  updateVideoInAlgolia: vi.fn()
}))

vi.mock('../../../lib/algolia/languages', () => ({
  getLanguages: vi.fn().mockResolvedValue({
    '529': { english: 'English', primary: 'English' },
    '496': { english: 'Spanish', primary: 'Español' }
  })
}))

vi.mock('../../../lib/algolia/algoliaVideoVariantUpdate', () => ({
  videoVariantAlgoliaInclude: {
    video: {
      include: {
        title: true,
        description: true,
        imageAlt: true,
        snippet: true,
        subtitles: true,
        images: true
      }
    }
  },
  buildVideoVariantAlgoliaObject: vi.fn((variant) => ({
    objectID: variant.id,
    videoId: variant.videoId,
    languageId: variant.languageId,
    languageEnglishName: variant.languageId === '496' ? 'Spanish' : 'English',
    languagePrimaryName: variant.languageId === '496' ? 'Español' : 'English',
    slug: variant.slug,
    published: variant.published,
    videoPublished: variant.video?.published ?? false,
    duration: variant.duration,
    label: variant.video?.label,
    titles:
      variant.video?.title?.map((title: { value: string }) => title.value) ??
      [],
    titlesWithLanguages:
      variant.video?.title?.map(
        (title: { value: string; languageId: string }) => ({
          value: title.value,
          languageId: title.languageId
        })
      ) ?? [],
    description:
      variant.video?.description?.map(
        (description: { value: string }) => description.value
      ) ?? [],
    subtitles:
      variant.video?.subtitles
        ?.filter(
          (subtitle: { edition: string }) =>
            subtitle.edition === variant.edition
        )
        .map((subtitle: { languageId: string }) => subtitle.languageId) ?? [],
    childrenCount: variant.video?.childIds?.length ?? 0,
    image: variant.video?.images?.[0]?.id ?? '',
    imageAlt:
      variant.video?.imageAlt?.find(
        (alt: { languageId: string }) => alt.languageId === '529'
      )?.value ?? '',
    restrictViewPlatforms: variant.video?.restrictViewPlatforms ?? [],
    manualRanking: variant.languageId === '529' ? 0 : 1
  })),
  updateVideoVariantInAlgolia: vi.fn()
}))

// Get the mocked functions
const mockedUpdateVideoInAlgolia = vi.mocked(updateVideoInAlgolia)
const mockedUpdateVideoVariantInAlgolia = vi.mocked(updateVideoVariantInAlgolia)

describe('videoAlgolia', () => {
  const client = getClient()

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher']
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    getObjectSpy.mockReset()
    getObjectsSpy.mockReset()
    browseSpy.mockReset()
    deleteObjectSpy.mockReset()
    mockedUpdateVideoInAlgolia.mockResolvedValue(undefined)
    mockedUpdateVideoVariantInAlgolia.mockResolvedValue(true as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('queries', () => {
    describe('checkVideoInAlgolia', () => {
      const CHECK_VIDEO_IN_ALGOLIA_QUERY = graphql(`
        query CheckVideoInAlgolia($videoId: ID!) {
          checkVideoInAlgolia(videoId: $videoId) {
            ok
            mismatches {
              field
              expected
              actual
            }
            recordUrl
          }
        }
      `)

      it('should return ok when video data matches Algolia record', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.video.findUnique.mockResolvedValue({
          id: 'videoId',
          label: 'segment',
          restrictViewPlatforms: [],
          keywords: [{ value: 'keyword1' }, { value: 'keyword2' }],
          variants: [
            {
              hls: 'https://example.com/video.m3u8',
              lengthInMilliseconds: 120000,
              downloadable: true
            }
          ]
        } as any)

        getObjectSpy.mockResolvedValue({
          objectID: 'videoId',
          mediaComponentId: 'videoId',
          subType: 'segment',
          componentType: 'content',
          contentType: 'video',
          lengthInMilliseconds: 120000,
          isDownloadable: true,
          restrictViewArclight: false,
          keywords: ['keyword1', 'keyword2']
        })

        const result = await authClient({
          document: CHECK_VIDEO_IN_ALGOLIA_QUERY,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data.checkVideoInAlgolia', {
          ok: true,
          mismatches: [],
          recordUrl:
            'https://www.algolia.com/apps/test-app-id/explorer/browse/test-videos-index?query=videoId'
        })
      })

      it('should return mismatches when video data differs from Algolia record', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.video.findUnique.mockResolvedValue({
          id: 'videoId',
          label: 'segment',
          restrictViewPlatforms: [],
          keywords: [{ value: 'keyword1' }],
          variants: [
            {
              hls: 'https://example.com/video.m3u8',
              lengthInMilliseconds: 120000,
              downloadable: true
            }
          ]
        } as any)

        getObjectSpy.mockResolvedValue({
          objectID: 'videoId',
          mediaComponentId: 'videoId',
          subType: 'segment',
          componentType: 'content',
          contentType: 'video',
          lengthInMilliseconds: 60000, // Different value
          isDownloadable: false, // Different value
          restrictViewArclight: false,
          keywords: ['keyword1']
        })

        const result = await authClient({
          document: CHECK_VIDEO_IN_ALGOLIA_QUERY,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data.checkVideoInAlgolia.ok', false)
        expect(result).toHaveProperty('data.checkVideoInAlgolia.mismatches')
        const mismatches = (result as any).data.checkVideoInAlgolia.mismatches
        expect(mismatches).toContainEqual({
          field: 'lengthInMilliseconds',
          expected: '120000',
          actual: '60000'
        })
        expect(mismatches).toContainEqual({
          field: 'isDownloadable',
          expected: 'true',
          actual: 'false'
        })
      })

      it('should handle container videos (collection/series) correctly', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.video.findUnique.mockResolvedValue({
          id: 'collectionId',
          label: 'collection',
          restrictViewPlatforms: [],
          keywords: [],
          variants: [
            {
              hls: null, // No HLS for container
              lengthInMilliseconds: 0,
              downloadable: true // Should be forced to false for collection
            }
          ]
        } as any)

        getObjectSpy.mockResolvedValue({
          objectID: 'collectionId',
          mediaComponentId: 'collectionId',
          subType: 'collection',
          componentType: 'container',
          contentType: 'none',
          lengthInMilliseconds: 0,
          isDownloadable: false,
          restrictViewArclight: false,
          keywords: []
        })

        const result = await authClient({
          document: CHECK_VIDEO_IN_ALGOLIA_QUERY,
          variables: { videoId: 'collectionId' }
        })

        expect(result).toHaveProperty('data.checkVideoInAlgolia', {
          ok: true,
          mismatches: [],
          recordUrl:
            'https://www.algolia.com/apps/test-app-id/explorer/browse/test-videos-index?query=collectionId'
        })
      })

      it('should handle arclight restriction correctly', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.video.findUnique.mockResolvedValue({
          id: 'restrictedId',
          label: 'segment',
          restrictViewPlatforms: ['arclight'],
          keywords: [],
          variants: [
            {
              hls: 'https://example.com/video.m3u8',
              lengthInMilliseconds: 60000,
              downloadable: false
            }
          ]
        } as any)

        getObjectSpy.mockResolvedValue({
          objectID: 'restrictedId',
          mediaComponentId: 'restrictedId',
          subType: 'segment',
          componentType: 'content',
          contentType: 'video',
          lengthInMilliseconds: 60000,
          isDownloadable: false,
          restrictViewArclight: true,
          keywords: []
        })

        const result = await authClient({
          document: CHECK_VIDEO_IN_ALGOLIA_QUERY,
          variables: { videoId: 'restrictedId' }
        })

        expect(result).toHaveProperty('data.checkVideoInAlgolia.ok', true)
      })

      it('should return error when video not found', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.video.findUnique.mockResolvedValue(null)

        const result = await authClient({
          document: CHECK_VIDEO_IN_ALGOLIA_QUERY,
          variables: { videoId: 'nonExistentId' }
        })

        expect(result).toHaveProperty('errors')
        expect((result as any).errors[0].message).toBe(
          'Video with id nonExistentId not found'
        )
      })

      it('should handle Algolia getObject error gracefully', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.video.findUnique.mockResolvedValue({
          id: 'videoId',
          label: 'segment',
          restrictViewPlatforms: [],
          keywords: [],
          variants: [
            {
              hls: 'https://example.com/video.m3u8',
              lengthInMilliseconds: 60000,
              downloadable: false
            }
          ]
        } as any)

        getObjectSpy.mockRejectedValue(new Error('Object not found'))

        const result = await authClient({
          document: CHECK_VIDEO_IN_ALGOLIA_QUERY,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data.checkVideoInAlgolia', {
          ok: false,
          mismatches: [],
          recordUrl:
            'https://www.algolia.com/apps/test-app-id/explorer/browse/test-videos-index?query=videoId'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CHECK_VIDEO_IN_ALGOLIA_QUERY,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data', null)
      })
    })

    describe('checkVideoVariantsInAlgolia', () => {
      const CHECK_VIDEO_VARIANTS_IN_ALGOLIA_QUERY = graphql(`
        query CheckVideoVariantsInAlgolia($videoId: ID!) {
          checkVideoVariantsInAlgolia(videoId: $videoId) {
            ok
            missingVariants
            browseUrl
          }
        }
      `)

      it('should return ok when all variants exist in Algolia', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.videoVariant.findMany.mockResolvedValue([
          { id: 'variant1' },
          { id: 'variant2' }
        ] as any)

        getObjectsSpy.mockResolvedValue({
          results: [
            { objectID: 'variant1', videoId: 'videoId' },
            { objectID: 'variant2', videoId: 'videoId' }
          ]
        })

        const result = await authClient({
          document: CHECK_VIDEO_VARIANTS_IN_ALGOLIA_QUERY,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data.checkVideoVariantsInAlgolia', {
          ok: true,
          missingVariants: [],
          browseUrl:
            'https://www.algolia.com/apps/test-app-id/explorer/browse/test-video-variants-index?query=videoId'
        })
        expect(getObjectsSpy).toHaveBeenCalledWith({
          requests: [
            {
              indexName: 'test-video-variants-index',
              objectID: 'variant1',
              attributesToRetrieve: ['objectID', 'videoId']
            },
            {
              indexName: 'test-video-variants-index',
              objectID: 'variant2',
              attributesToRetrieve: ['objectID', 'videoId']
            }
          ]
        })
        expect(getObjectSpy).not.toHaveBeenCalled()
      })

      it('should return missing variants when some are not in Algolia', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.videoVariant.findMany.mockResolvedValue([
          { id: 'variant1' },
          { id: 'variant2' },
          { id: 'variant3' }
        ] as any)

        getObjectsSpy.mockResolvedValue({
          results: [
            { objectID: 'variant1', videoId: 'videoId' },
            null,
            { objectID: 'variant3', videoId: 'videoId' }
          ]
        })

        const result = await authClient({
          document: CHECK_VIDEO_VARIANTS_IN_ALGOLIA_QUERY,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data.checkVideoVariantsInAlgolia', {
          ok: false,
          missingVariants: ['variant2'],
          browseUrl:
            'https://www.algolia.com/apps/test-app-id/explorer/browse/test-video-variants-index?query=videoId'
        })
      })

      it('should detect variants with mismatched videoId', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.videoVariant.findMany.mockResolvedValue([
          { id: 'variant1' }
        ] as any)

        getObjectsSpy.mockResolvedValue({
          results: [
            {
              objectID: 'variant1',
              videoId: 'wrongVideoId' // Different videoId
            }
          ]
        })

        const result = await authClient({
          document: CHECK_VIDEO_VARIANTS_IN_ALGOLIA_QUERY,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data.checkVideoVariantsInAlgolia', {
          ok: false,
          missingVariants: ['variant1'],
          browseUrl:
            'https://www.algolia.com/apps/test-app-id/explorer/browse/test-video-variants-index?query=videoId'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CHECK_VIDEO_VARIANTS_IN_ALGOLIA_QUERY,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data', null)
      })
    })
  })

  describe('checkAlgoliaVideoVariantIndexBatch', () => {
    const CHECK_VARIANT_INDEX_BATCH_QUERY = graphql(`
      query CheckAlgoliaVideoVariantIndexBatch(
        $input: CheckAlgoliaVideoVariantIndexBatchInput!
      ) {
        checkAlgoliaVideoVariantIndexBatch(input: $input) {
          scanType
          batchKey
          nextBatchKey
          done
          checkedCount
          missingCount
          staleCount
          extraCount
          failedCount
          issues {
            id
            issueType
            variantId
            objectId
            videoId
            languageId
            languageName
            mismatches {
              field
              expected
              actual
            }
            error
          }
        }
      }
    `)

    it('checks a Core batch and reports stale and missing variants only', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.videoVariant.findMany.mockResolvedValue([
        {
          id: 'variant-stale',
          videoId: 'video-1',
          languageId: '529',
          slug: 'watch/english',
          published: true,
          duration: 120,
          edition: 'base',
          video: {
            published: true,
            label: 'segment',
            childIds: [],
            title: [{ value: 'Jesus', languageId: '529' }],
            description: [{ value: 'Description', languageId: '529' }],
            subtitles: [],
            images: [{ id: 'banner-id' }],
            imageAlt: [{ value: 'Jesus image', languageId: '529' }],
            restrictViewPlatforms: []
          }
        },
        {
          id: 'variant-missing',
          videoId: 'video-2',
          languageId: '496',
          slug: 'watch/spanish',
          published: true,
          duration: 90,
          edition: 'base',
          video: {
            published: true,
            label: 'segment',
            childIds: [],
            title: [{ value: 'Jesus ES', languageId: '496' }],
            description: [],
            subtitles: [],
            images: [],
            imageAlt: [],
            restrictViewPlatforms: []
          }
        }
      ] as any)
      getObjectsSpy.mockResolvedValue({
        results: [
          {
            objectID: 'variant-stale',
            videoId: 'wrong-video',
            languageId: '529',
            languageEnglishName: 'English',
            languagePrimaryName: 'English',
            slug: 'watch/english',
            published: true,
            videoPublished: true,
            duration: 120,
            label: 'segment',
            titles: ['Jesus'],
            titlesWithLanguages: [{ value: 'Jesus', languageId: '529' }],
            description: ['Description'],
            subtitles: [],
            childrenCount: 0,
            image: 'banner-id',
            imageAlt: 'Jesus image',
            restrictViewPlatforms: ['watch'],
            manualRanking: 0
          },
          null
        ]
      })

      const result = await authClient({
        document: CHECK_VARIANT_INDEX_BATCH_QUERY,
        variables: { input: { scanType: 'core', batchSize: 2 } } as any
      })

      expect(result).toHaveProperty(
        'data.checkAlgoliaVideoVariantIndexBatch.checkedCount',
        2
      )
      expect(result).toHaveProperty(
        'data.checkAlgoliaVideoVariantIndexBatch.missingCount',
        1
      )
      expect(result).toHaveProperty(
        'data.checkAlgoliaVideoVariantIndexBatch.staleCount',
        1
      )
      expect(result).toHaveProperty(
        'data.checkAlgoliaVideoVariantIndexBatch.nextBatchKey',
        'variant-missing'
      )
      expect(getObjectsSpy).toHaveBeenCalledWith({
        requests: [
          {
            indexName: 'test-video-variants-index',
            objectID: 'variant-stale',
            attributesToRetrieve: [
              'objectID',
              'videoId',
              'languageId',
              'languageEnglishName',
              'languagePrimaryName',
              'slug',
              'published',
              'videoPublished',
              'duration',
              'label',
              'titles',
              'titlesWithLanguages',
              'description',
              'subtitles',
              'childrenCount',
              'image',
              'imageAlt',
              'restrictViewPlatforms',
              'manualRanking'
            ]
          },
          {
            indexName: 'test-video-variants-index',
            objectID: 'variant-missing',
            attributesToRetrieve: [
              'objectID',
              'videoId',
              'languageId',
              'languageEnglishName',
              'languagePrimaryName',
              'slug',
              'published',
              'videoPublished',
              'duration',
              'label',
              'titles',
              'titlesWithLanguages',
              'description',
              'subtitles',
              'childrenCount',
              'image',
              'imageAlt',
              'restrictViewPlatforms',
              'manualRanking'
            ]
          }
        ]
      })
      expect(getObjectSpy).not.toHaveBeenCalled()
      const issues = (result as any).data.checkAlgoliaVideoVariantIndexBatch
        .issues
      expect(issues).toContainEqual(
        expect.objectContaining({
          issueType: 'missing',
          objectId: 'variant-missing',
          languageName: 'Spanish'
        })
      )
      expect(issues).toContainEqual(
        expect.objectContaining({
          issueType: 'stale',
          objectId: 'variant-stale',
          mismatches: [
            {
              field: 'videoId',
              expected: '"video-1"',
              actual: '"wrong-video"'
            },
            {
              field: 'restrictViewPlatforms',
              expected: '[]',
              actual: '["watch"]'
            }
          ]
        })
      )
    })

    it('filters a Core batch by language id', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.videoVariant.findMany.mockResolvedValue([])

      await authClient({
        document: CHECK_VARIANT_INDEX_BATCH_QUERY,
        variables: {
          input: {
            scanType: 'core',
            batchKey: 'variant-1',
            batchSize: 2,
            languageId: '529'
          }
        } as any
      })

      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: { gt: 'variant-1' },
            languageId: '529'
          }
        })
      )
    })

    it('checks an Algolia browse batch and reports extra objects', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      browseSpy.mockResolvedValue({
        hits: [
          {
            objectID: 'variant-existing',
            videoId: 'video-1',
            languageId: '529'
          },
          { objectID: 'variant-extra', videoId: 'video-2', languageId: '496' }
        ],
        cursor: 'next-cursor'
      })
      prismaMock.videoVariant.findMany.mockResolvedValue([
        { id: 'variant-existing' }
      ] as any)

      const result = await authClient({
        document: CHECK_VARIANT_INDEX_BATCH_QUERY,
        variables: {
          input: { scanType: 'algolia', batchSize: 2 }
        } as any
      })

      expect(browseSpy).toHaveBeenCalledWith({
        indexName: 'test-video-variants-index',
        browseParams: {
          hitsPerPage: 2,
          attributesToRetrieve: ['objectID', 'videoId', 'languageId']
        }
      })
      expect(result).toHaveProperty(
        'data.checkAlgoliaVideoVariantIndexBatch.extraCount',
        1
      )
      expect(result).toHaveProperty(
        'data.checkAlgoliaVideoVariantIndexBatch.nextBatchKey',
        'next-cursor'
      )
      expect(
        (result as any).data.checkAlgoliaVideoVariantIndexBatch.issues
      ).toContainEqual(
        expect.objectContaining({
          issueType: 'extra',
          objectId: 'variant-extra',
          variantId: null,
          videoId: 'video-2',
          languageName: 'Spanish'
        })
      )
    })
  })

  describe('mutations', () => {
    describe('fixAlgoliaVideoVariantIndexIssues', () => {
      const FIX_VARIANT_INDEX_ISSUES_MUTATION = graphql(`
        mutation FixAlgoliaVideoVariantIndexIssues(
          $input: FixAlgoliaVideoVariantIndexIssuesInput!
        ) {
          fixAlgoliaVideoVariantIndexIssues(input: $input) {
            fixedCount
            failedCount
            issues {
              issueType
              objectId
              error
            }
          }
        }
      `)

      it('upserts selected missing and stale variants with existing updater behavior', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        prismaMock.videoVariant.findUnique.mockResolvedValue({
          id: 'variant-1'
        } as any)

        const result = await authClient({
          document: FIX_VARIANT_INDEX_ISSUES_MUTATION,
          variables: {
            input: { issueType: 'stale', objectIds: ['variant-1', 'variant-2'] }
          } as any
        })

        expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
          'variant-1',
          expect.anything()
        )
        expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
          'variant-2',
          expect.anything()
        )
        expect(result).toHaveProperty(
          'data.fixAlgoliaVideoVariantIndexIssues',
          { fixedCount: 2, failedCount: 0, issues: [] }
        )
      })

      it('reports selected missing and stale variants that fail to update', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        prismaMock.videoVariant.findUnique.mockResolvedValue({
          id: 'variant-1',
          videoId: 'video-1',
          languageId: '529'
        } as any)
        mockedUpdateVideoVariantInAlgolia.mockResolvedValueOnce(false as any)

        const result = await authClient({
          document: FIX_VARIANT_INDEX_ISSUES_MUTATION,
          variables: {
            input: { issueType: 'missing', objectIds: ['variant-1'] }
          } as any
        })

        expect(result).toHaveProperty(
          'data.fixAlgoliaVideoVariantIndexIssues.fixedCount',
          0
        )
        expect(result).toHaveProperty(
          'data.fixAlgoliaVideoVariantIndexIssues.failedCount',
          1
        )
        expect(
          (result as any).data.fixAlgoliaVideoVariantIndexIssues.issues
        ).toContainEqual({
          issueType: 'failed',
          objectId: 'variant-1',
          error: 'Algolia update did not complete'
        })
      })

      it('reports update rejections per row and continues fixing remaining variants', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        prismaMock.videoVariant.findUnique.mockResolvedValue({
          id: 'variant-1',
          videoId: 'video-1',
          languageId: '529'
        } as any)
        mockedUpdateVideoVariantInAlgolia
          .mockRejectedValueOnce(new Error('Algolia update failed'))
          .mockResolvedValueOnce(true as any)

        const result = await authClient({
          document: FIX_VARIANT_INDEX_ISSUES_MUTATION,
          variables: {
            input: {
              issueType: 'stale',
              objectIds: ['variant-fail', 'variant-fixed']
            }
          } as any
        })

        expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
          'variant-fail',
          expect.anything()
        )
        expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
          'variant-fixed',
          expect.anything()
        )
        expect(result).toHaveProperty(
          'data.fixAlgoliaVideoVariantIndexIssues.fixedCount',
          1
        )
        expect(result).toHaveProperty(
          'data.fixAlgoliaVideoVariantIndexIssues.failedCount',
          1
        )
        expect(
          (result as any).data.fixAlgoliaVideoVariantIndexIssues.issues
        ).toContainEqual({
          issueType: 'failed',
          objectId: 'variant-fail',
          error: 'Algolia update failed'
        })
      })

      it('re-checks Core row absence before deleting an extra Algolia object', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        prismaMock.videoVariant.findUnique
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: 'variant-valid' } as any)
        deleteObjectSpy.mockResolvedValue({})

        const result = await authClient({
          document: FIX_VARIANT_INDEX_ISSUES_MUTATION,
          variables: {
            input: {
              issueType: 'extra',
              objectIds: ['variant-extra', 'variant-valid']
            }
          } as any
        })

        expect(deleteObjectSpy).toHaveBeenCalledWith({
          indexName: 'test-video-variants-index',
          objectID: 'variant-extra'
        })
        expect(deleteObjectSpy).not.toHaveBeenCalledWith(
          expect.objectContaining({ objectID: 'variant-valid' })
        )
        expect(result).toHaveProperty(
          'data.fixAlgoliaVideoVariantIndexIssues.fixedCount',
          1
        )
        expect(result).toHaveProperty(
          'data.fixAlgoliaVideoVariantIndexIssues.failedCount',
          1
        )
        expect(
          (result as any).data.fixAlgoliaVideoVariantIndexIssues.issues
        ).toContainEqual({
          issueType: 'failed',
          objectId: 'variant-valid',
          error: 'VideoVariant row exists; refusing to delete Algolia object'
        })
      })

      it('reports extra Algolia object delete failures per row', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        prismaMock.videoVariant.findUnique.mockResolvedValue(null)
        deleteObjectSpy
          .mockRejectedValueOnce(new Error('Algolia delete failed'))
          .mockResolvedValueOnce({})

        const result = await authClient({
          document: FIX_VARIANT_INDEX_ISSUES_MUTATION,
          variables: {
            input: {
              issueType: 'extra',
              objectIds: ['variant-fail', 'variant-extra']
            }
          } as any
        })

        expect(result).toHaveProperty(
          'data.fixAlgoliaVideoVariantIndexIssues.fixedCount',
          1
        )
        expect(result).toHaveProperty(
          'data.fixAlgoliaVideoVariantIndexIssues.failedCount',
          1
        )
        expect(
          (result as any).data.fixAlgoliaVideoVariantIndexIssues.issues
        ).toContainEqual({
          issueType: 'failed',
          objectId: 'variant-fail',
          error: 'Algolia delete failed'
        })
      })
    })

    describe('updateVideoAlgoliaIndex', () => {
      const UPDATE_VIDEO_ALGOLIA_INDEX_MUTATION = graphql(`
        mutation UpdateVideoAlgoliaIndex($videoId: ID!) {
          updateVideoAlgoliaIndex(videoId: $videoId)
        }
      `)

      it('should update video in Algolia', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.video.findUnique.mockResolvedValue({
          id: 'videoId'
        } as any)

        const result = await authClient({
          document: UPDATE_VIDEO_ALGOLIA_INDEX_MUTATION,
          variables: { videoId: 'videoId' }
        })

        expect(updateVideoInAlgolia).toHaveBeenCalledWith('videoId')
        expect(result).toHaveProperty('data.updateVideoAlgoliaIndex', true)
      })

      it('should return error when video not found', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.video.findUnique.mockResolvedValue(null)

        const result = await authClient({
          document: UPDATE_VIDEO_ALGOLIA_INDEX_MUTATION,
          variables: { videoId: 'nonExistentId' }
        })

        expect(result).toHaveProperty('errors')
        expect((result as any).errors[0].message).toBe(
          'Video with id nonExistentId not found'
        )
        expect(updateVideoInAlgolia).not.toHaveBeenCalled()
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_ALGOLIA_INDEX_MUTATION,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data', null)
        expect(updateVideoInAlgolia).not.toHaveBeenCalled()
      })
    })

    describe('updateVideoVariantAlgoliaIndex', () => {
      const UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX_MUTATION = graphql(`
        mutation UpdateVideoVariantAlgoliaIndex($videoId: ID!) {
          updateVideoVariantAlgoliaIndex(videoId: $videoId)
        }
      `)

      it('should update all video variants in Algolia', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.videoVariant.findMany.mockResolvedValue([
          { id: 'variant1' },
          { id: 'variant2' },
          { id: 'variant3' }
        ] as any)

        const result = await authClient({
          document: UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX_MUTATION,
          variables: { videoId: 'videoId' }
        })

        expect(updateVideoVariantInAlgolia).toHaveBeenCalledTimes(3)
        expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('variant1')
        expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('variant2')
        expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('variant3')
        expect(result).toHaveProperty(
          'data.updateVideoVariantAlgoliaIndex',
          true
        )
      })

      it('should return error when no variants found', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        prismaMock.videoVariant.findMany.mockResolvedValue([])

        const result = await authClient({
          document: UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX_MUTATION,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('errors')
        expect((result as any).errors[0].message).toBe(
          'No variants found for video videoId'
        )
        expect(updateVideoVariantInAlgolia).not.toHaveBeenCalled()
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX_MUTATION,
          variables: { videoId: 'videoId' }
        })

        expect(result).toHaveProperty('data', null)
        expect(updateVideoVariantInAlgolia).not.toHaveBeenCalled()
      })
    })
  })
})
