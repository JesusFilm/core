import {
  fetchFieldsFromMux,
  fetchFieldsFromYouTube,
  videoBlockInternalSchema,
  videoBlockMuxSchema,
  videoBlockYouTubeSchema
} from './service'

// Mock @apollo/client used by fetchFieldsFromMux
const mockQuery = jest.fn()
jest.mock('@apollo/client', () => {
  return {
    ApolloClient: jest.fn().mockImplementation(() => ({ query: mockQuery })),
    InMemoryCache: jest.fn(),
    createHttpLink: jest.fn()
  }
})

describe('video service', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv, GATEWAY_URL: 'http://localhost/graphql' }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('schemas', () => {
    it('validates YouTube schema with 11-char id', () => {
      expect(() =>
        videoBlockYouTubeSchema.parse({ videoId: 'ABCDEFGHIJK' })
      ).not.toThrow()
    })

    it('fails YouTube schema with invalid id', () => {
      expect(() =>
        videoBlockYouTubeSchema.parse({ videoId: 'short' })
      ).toThrow()
    })

    it('validates internal schema with nullish fields', () => {
      expect(() =>
        videoBlockInternalSchema.parse({
          videoId: null,
          videoVariantLanguageId: undefined
        })
      ).not.toThrow()
    })

    it('validates mux schema with non-empty id and fails for empty', () => {
      expect(() =>
        videoBlockMuxSchema.parse({ videoId: 'mux123' })
      ).not.toThrow()
      expect(() => videoBlockMuxSchema.parse({ videoId: '' })).toThrow()
    })
  })

  describe('fetchFieldsFromMux', () => {
    it('throws NOT_FOUND when mux video missing', async () => {
      mockQuery.mockResolvedValue({ data: { getMuxVideo: null } })

      await expect(fetchFieldsFromMux('mux-id')).rejects.toMatchObject({
        message: 'videoId cannot be found on Mux'
      })
    })

    it('returns only title when playbackId is null', async () => {
      mockQuery.mockResolvedValue({
        data: {
          getMuxVideo: { id: 'mux-id', name: 'Mux Title', playbackId: null }
        }
      })

      await expect(fetchFieldsFromMux('mux-id')).resolves.toEqual({
        title: 'Mux Title'
      })
    })

    it('returns title, image, duration, endAt when playbackId present', async () => {
      mockQuery.mockResolvedValue({
        data: {
          getMuxVideo: {
            id: 'mux-id',
            name: 'Mux Title',
            playbackId: 'play123',
            duration: 12.7
          }
        }
      })

      await expect(fetchFieldsFromMux('mux-id')).resolves.toEqual({
        title: 'Mux Title',
        image: 'https://image.mux.com/play123/thumbnail.png?time=1',
        duration: 13,
        endAt: 13
      })
    })
  })

  describe('fetchFieldsFromYouTube', () => {
    const globalAny: any = global

    beforeEach(() => {
      globalAny.fetch = jest.fn()
    })

    afterEach(() => {
      delete globalAny.fetch
    })

    it('throws NOT_FOUND when YouTube video missing', async () => {
      globalAny.fetch.mockResolvedValue({
        json: async () => ({ items: [] })
      })

      await expect(fetchFieldsFromYouTube('invalid')).rejects.toMatchObject({
        message: 'videoId cannot be found on YouTube'
      })
    })

    it('returns fields and parses ISO8601 duration', async () => {
      globalAny.fetch.mockResolvedValue({
        json: async () => ({
          items: [
            {
              id: 'abc',
              snippet: {
                title: 'YT Title',
                description: 'YT Desc',
                thumbnails: { high: { url: 'img-url' } }
              },
              contentDetails: { duration: 'PT1H2M3S' }
            }
          ]
        })
      })

      await expect(fetchFieldsFromYouTube('abc')).resolves.toEqual({
        title: 'YT Title',
        description: 'YT Desc',
        image: 'img-url',
        duration: 3723
      })
    })
  })
})
