import { getCarouselVideos, type CarouselVideoItem, type CarouselSlug } from './getCarouselVideos'
import { fetchGraphql } from '@/lib/graphql/fetchGraphql'

// Mock the fetchGraphql function
jest.mock('@/lib/graphql/fetchGraphql')
const mockFetchGraphql = fetchGraphql as jest.MockedFunction<typeof fetchGraphql>

// Mock getLanguageIdFromLocale
jest.mock('@/lib/i18n/getLanguageIdFromLocale')
import { getLanguageIdFromLocale } from '@/lib/i18n/getLanguageIdFromLocale'
const mockGetLanguageIdFromLocale = getLanguageIdFromLocale as jest.MockedFunction<typeof getLanguageIdFromLocale>

describe('getCarouselVideos', () => {
  const mockEndpoint = 'https://api.example.com/graphql'

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_GATEWAY_URL = mockEndpoint
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  describe('successful data fetching and transformation', () => {
    it('transforms GraphQL response into carousel video items', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529') // English

      const mockGraphQLResponse = {
        data: {
          videos: [
            {
              id: 'video-1',
              label: 'Documentary',
              title: [{ value: 'The Simple Gospel' }],
              description: [{ value: 'A powerful testimony of faith and redemption' }],
              slug: 'new-believer-course.html/1-the-simple-gospel',
              variant: {
                slug: 'main',
                hls: 'https://example.com/video1.m3u8'
              },
              images: [{
                mobileCinematicHigh: 'https://example.com/image1.jpg'
              }],
              variantLanguagesCount: 12
            },
            {
              id: 'video-2',
              label: 'Teaching',
              title: [{ value: 'Jesus Film' }],
              description: [{ value: 'The story of Jesus told through film' }],
              slug: 'jesus-film.html/jesus',
              variant: {
                slug: 'main',
                hls: 'https://example.com/video2.m3u8'
              },
              images: [{
                mobileCinematicHigh: 'https://example.com/image2.jpg'
              }],
              variantLanguagesCount: 25
            }
          ]
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'new-believer-course.html/1-the-simple-gospel' },
        { slug: 'jesus-film.html/jesus' }
      ]

      const result = await getCarouselVideos(slugs, 'en')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'video-1',
        label: 'Documentary',
        title: 'The Simple Gospel',
        description: 'A powerful testimony of faith and redemption',
        slug: 'new-believer-course.html/1-the-simple-gospel',
        variantSlug: 'main',
        hlsUrl: 'https://example.com/video1.m3u8',
        imageUrl: 'https://example.com/image1.jpg',
        variantLanguagesCount: 12
      })

      expect(result[1]).toEqual({
        id: 'video-2',
        label: 'Teaching',
        title: 'Jesus Film',
        description: 'The story of Jesus told through film',
        slug: 'jesus-film.html/jesus',
        variantSlug: 'main',
        hlsUrl: 'https://example.com/video2.m3u8',
        imageUrl: 'https://example.com/image2.jpg',
        variantLanguagesCount: 25
      })
    })

    it('handles missing optional fields gracefully', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')

      const mockGraphQLResponse = {
        data: {
          videos: [
            {
              id: 'video-1',
              label: 'Documentary',
              title: [{ value: 'Test Video' }],
              description: [{ value: 'Test description' }],
              slug: 'test-video.html',
              variant: null, // Missing variant
              images: [], // Empty images array
              variantLanguagesCount: 5
            }
          ]
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'test-video.html' }
      ]

      const result = await getCarouselVideos(slugs, 'en')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'video-1',
        label: 'Documentary',
        title: 'Test Video',
        description: 'Test description',
        slug: 'test-video.html',
        variantSlug: null,
        hlsUrl: null,
        imageUrl: null,
        variantLanguagesCount: 5
      })
    })

    it('handles missing title and description arrays', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')

      const mockGraphQLResponse = {
        data: {
          videos: [
            {
              id: 'video-1',
              label: 'Documentary',
              title: [], // Empty title array
              description: [], // Empty description array
              slug: 'test-video.html',
              variant: {
                slug: 'main',
                hls: 'https://example.com/video.m3u8'
              },
              images: [{
                mobileCinematicHigh: 'https://example.com/image.jpg'
              }],
              variantLanguagesCount: 5
            }
          ]
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'test-video.html' }
      ]

      const result = await getCarouselVideos(slugs, 'en')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'video-1',
        label: 'Documentary',
        title: 'Untitled Video',
        description: 'No description available',
        slug: 'test-video.html',
        variantSlug: 'main',
        hlsUrl: 'https://example.com/video.m3u8',
        imageUrl: 'https://example.com/image.jpg',
        variantLanguagesCount: 5
      })
    })

    it('respects maxItems parameter', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')

      const mockGraphQLResponse = {
        data: {
          videos: [
            {
              id: 'video-1',
              label: 'Documentary',
              title: [{ value: 'Video 1' }],
              description: [{ value: 'Description 1' }],
              slug: 'video-1.html',
              variant: { slug: 'main', hls: 'https://example.com/1.m3u8' },
              images: [{ mobileCinematicHigh: 'https://example.com/1.jpg' }],
              variantLanguagesCount: 5
            },
            {
              id: 'video-2',
              label: 'Teaching',
              title: [{ value: 'Video 2' }],
              description: [{ value: 'Description 2' }],
              slug: 'video-2.html',
              variant: { slug: 'main', hls: 'https://example.com/2.m3u8' },
              images: [{ mobileCinematicHigh: 'https://example.com/2.jpg' }],
              variantLanguagesCount: 10
            },
            {
              id: 'video-3',
              label: 'Children',
              title: [{ value: 'Video 3' }],
              description: [{ value: 'Description 3' }],
              slug: 'video-3.html',
              variant: { slug: 'main', hls: 'https://example.com/3.m3u8' },
              images: [{ mobileCinematicHigh: 'https://example.com/3.jpg' }],
              variantLanguagesCount: 15
            }
          ]
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'video-1.html' },
        { slug: 'video-2.html' },
        { slug: 'video-3.html' }
      ]

      const result = await getCarouselVideos(slugs, 'en', 2)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('video-1')
      expect(result[1].id).toBe('video-2')
    })

    it('handles languageSlugOverride from slug configuration', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('21028') // Spanish

      const mockGraphQLResponse = {
        data: {
          videos: [
            {
              id: 'video-1',
              label: 'Documentary',
              title: [{ value: 'El Evangelio Simple' }],
              description: [{ value: 'Un poderoso testimonio de fe y redención' }],
              slug: 'new-believer-course.html/1-the-simple-gospel',
              variant: {
                slug: 'main',
                hls: 'https://example.com/video1.m3u8'
              },
              images: [{
                mobileCinematicHigh: 'https://example.com/image1.jpg'
              }],
              variantLanguagesCount: 12
            }
          ]
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        {
          slug: 'new-believer-course.html/1-the-simple-gospel',
          languageSlugOverride: 'spanish-latin-american.html'
        }
      ]

      const result = await getCarouselVideos(slugs, 'en') // Different from override

      expect(mockGetLanguageIdFromLocale).toHaveBeenCalledWith('en')
      expect(result[0].title).toBe('El Evangelio Simple') // Spanish content returned
    })
  })

  describe('error handling', () => {
    it('returns empty array when GraphQL request fails', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')
      mockFetchGraphql.mockRejectedValue(new Error('Network error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const slugs: CarouselSlug[] = [
        { slug: 'test-video.html' }
      ]

      const result = await getCarouselVideos(slugs, 'en')

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch carousel videos:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('returns empty array when GraphQL response has no data', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')

      const mockGraphQLResponse = {
        data: null
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'test-video.html' }
      ]

      const result = await getCarouselVideos(slugs, 'en')

      expect(result).toEqual([])
    })

    it('returns empty array when GraphQL response has empty videos array', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')

      const mockGraphQLResponse = {
        data: {
          videos: []
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'test-video.html' }
      ]

      const result = await getCarouselVideos(slugs, 'en')

      expect(result).toEqual([])
    })

    it('filters out null video items', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')

      const mockGraphQLResponse = {
        data: {
          videos: [
            {
              id: 'video-1',
              label: 'Documentary',
              title: [{ value: 'Valid Video' }],
              description: [{ value: 'Valid description' }],
              slug: 'valid-video.html',
              variant: { slug: 'main', hls: 'https://example.com/valid.m3u8' },
              images: [{ mobileCinematicHigh: 'https://example.com/valid.jpg' }],
              variantLanguagesCount: 5
            },
            null, // This should be filtered out
            {
              id: 'video-2',
              label: 'Teaching',
              title: [{ value: 'Another Valid Video' }],
              description: [{ value: 'Another description' }],
              slug: 'another-video.html',
              variant: { slug: 'main', hls: 'https://example.com/another.m3u8' },
              images: [{ mobileCinematicHigh: 'https://example.com/another.jpg' }],
              variantLanguagesCount: 10
            }
          ]
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'valid-video.html' },
        { slug: 'null-video.html' },
        { slug: 'another-video.html' }
      ]

      const result = await getCarouselVideos(slugs, 'en')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('video-1')
      expect(result[1].id).toBe('video-2')
    })
  })

  describe('GraphQL query construction', () => {
    it('calls fetchGraphql with correct query and variables', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')

      const mockGraphQLResponse = {
        data: {
          videos: []
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'video-1.html' },
        { slug: 'video-2.html' }
      ]

      await getCarouselVideos(slugs, 'en')

      expect(mockFetchGraphql).toHaveBeenCalledWith(
        expect.stringContaining('query GetCarouselVideos'),
        {
          ids: ['video-1.html', 'video-2.html'],
          languageId: '529'
        }
      )
    })

    it('includes all required fields in GraphQL query', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')

      const mockGraphQLResponse = {
        data: {
          videos: []
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'test-video.html' }
      ]

      await getCarouselVideos(slugs, 'en')

      const queryCall = mockFetchGraphql.mock.calls[0][0]

      // Check that all required fields are present in the query
      expect(queryCall).toContain('id')
      expect(queryCall).toContain('label')
      expect(queryCall).toContain('title(languageId:')
      expect(queryCall).toContain('description(languageId:')
      expect(queryCall).toContain('slug')
      expect(queryCall).toContain('variant {')
      expect(queryCall).toContain('hls')
      expect(queryCall).toContain('images(aspectRatio: banner)')
      expect(queryCall).toContain('mobileCinematicHigh')
      expect(queryCall).toContain('variantLanguagesCount')
    })
  })

  describe('slug processing', () => {
    it('uses all provided slugs up to maxItems limit', async () => {
      mockGetLanguageIdFromLocale.mockReturnValue('529')

      const mockGraphQLResponse = {
        data: {
          videos: [
            {
              id: 'video-1',
              label: 'Documentary',
              title: [{ value: 'Video 1' }],
              description: [{ value: 'Description 1' }],
              slug: 'video-1.html',
              variant: { slug: 'main', hls: 'https://example.com/1.m3u8' },
              images: [{ mobileCinematicHigh: 'https://example.com/1.jpg' }],
              variantLanguagesCount: 5
            }
          ]
        }
      }

      mockFetchGraphql.mockResolvedValue(mockGraphQLResponse)

      const slugs: CarouselSlug[] = [
        { slug: 'video-1.html' },
        { slug: 'video-2.html' },
        { slug: 'video-3.html' },
        { slug: 'video-4.html' },
        { slug: 'video-5.html' }
      ]

      await getCarouselVideos(slugs, 'en', 3)

      expect(mockFetchGraphql).toHaveBeenCalledWith(
        expect.any(String),
        {
          ids: ['video-1.html', 'video-2.html', 'video-3.html'],
          languageId: '529'
        }
      )
    })
  })
})
