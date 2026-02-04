import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

const getObjectSpy = jest.fn()

// Mock the algolia client helper
jest.mock('../../../lib/algolia/algoliaClient', () => ({
  getAlgoliaClient: () => ({
    getObject: getObjectSpy
  }),
  getAlgoliaConfig: () => ({
    appId: 'test-app-id',
    apiKey: 'test-api-key',
    videosIndex: 'test-videos-index',
    videoVariantsIndex: 'test-video-variants-index'
  })
}))

// Mock the algolia update functions
jest.mock('../../../lib/algolia/algoliaVideoUpdate', () => ({
  updateVideoInAlgolia: jest.fn()
}))

jest.mock('../../../lib/algolia/algoliaVideoVariantUpdate', () => ({
  updateVideoVariantInAlgolia: jest.fn()
}))

// Get the mocked functions
const {
  updateVideoInAlgolia
} = require('../../../lib/algolia/algoliaVideoUpdate')
const {
  updateVideoVariantInAlgolia
} = require('../../../lib/algolia/algoliaVideoVariantUpdate')

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
    jest.clearAllMocks()

    getObjectSpy.mockReset()
    updateVideoInAlgolia.mockResolvedValue(undefined)
    updateVideoVariantInAlgolia.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.resetAllMocks()
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

        getObjectSpy
          .mockResolvedValueOnce({ objectID: 'variant1', videoId: 'videoId' })
          .mockResolvedValueOnce({ objectID: 'variant2', videoId: 'videoId' })

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

        getObjectSpy
          .mockResolvedValueOnce({ objectID: 'variant1', videoId: 'videoId' })
          .mockRejectedValueOnce(new Error('Object not found'))
          .mockResolvedValueOnce({ objectID: 'variant3', videoId: 'videoId' })

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

        getObjectSpy.mockResolvedValueOnce({
          objectID: 'variant1',
          videoId: 'wrongVideoId' // Different videoId
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

  describe('mutations', () => {
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
