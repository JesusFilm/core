import { ApolloClient, InMemoryCache } from '@apollo/client'

import { loadVideoSubtitleContent } from './get'

// Mock fetch for testing
global.fetch = jest.fn()

describe('loadVideoSubtitleContent', () => {
  let mockClient: ApolloClient<any>
  
  beforeEach(() => {
    mockClient = new ApolloClient({
      cache: new InMemoryCache()
    })
    
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should load subtitle data with SRT content when srtSrc is available', async () => {
    // Mock Apollo query response
    jest.spyOn(mockClient, 'query').mockResolvedValue({
      data: {
        video: {
          variant: {
            subtitle: [
              {
                id: 'subtitle-123',
                languageId: 'en',
                edition: 'default',
                primary: true,
                srtSrc: 'https://example.com/subtitle.srt'
              }
            ]
          }
        }
      }
    } as any)

    // Mock successful fetch response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('1\n00:00:01,000 --> 00:00:05,000\nHello world\n\n2\n00:00:06,000 --> 00:00:10,000\nThis is a test')
    })

    const tool = loadVideoSubtitleContent(mockClient, { langfuseTraceId: 'test-trace-id' })
    
    const result = await tool.execute!({
      videoId: 'video-123',
      languageId: 'en'
    })

    expect(result).toEqual({
      id: 'subtitle-123',
      languageId: 'en',
      edition: 'default',
      primary: true,
      srtSrc: 'https://example.com/subtitle.srt',
      srtContent: '1\n00:00:01,000 --> 00:00:05,000\nHello world\n\n2\n00:00:06,000 --> 00:00:10,000\nThis is a test'
    })

    // Verify fetch was called to get SRT content
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/subtitle.srt')
  })

  it('should handle fetch errors gracefully when SRT content fetch fails', async () => {
    // Mock Apollo query response
    jest.spyOn(mockClient, 'query').mockResolvedValue({
      data: {
        video: {
          variant: {
            subtitle: [
              {
                id: 'subtitle-123',
                languageId: 'en',
                edition: 'default',
                primary: true,
                srtSrc: 'https://example.com/subtitle.srt'
              }
            ]
          }
        }
      }
    } as any)

    // Mock fetch error
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const tool = loadVideoSubtitleContent(mockClient, { langfuseTraceId: 'test-trace-id' })
    
    const result = await tool.execute({
      videoId: 'video-123',
      languageId: 'en'
    })

    // Should still return the subtitle data without srtContent when fetch fails
    expect(result).toEqual({
      id: 'subtitle-123',
      languageId: 'en',
      edition: 'default',
      primary: true,
      srtSrc: 'https://example.com/subtitle.srt'
    })

    // Verify fetch was called but failed
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/subtitle.srt')
  })

  it('should not fetch SRT content when srtSrc is not available', async () => {
    // Mock Apollo query response with no srtSrc
    jest.spyOn(mockClient, 'query').mockResolvedValue({
      data: {
        video: {
          variant: {
            subtitle: [
              {
                id: 'subtitle-123',
                languageId: 'en',
                edition: 'default',
                primary: true,
                srtSrc: null
              }
            ]
          }
        }
      }
    } as any)

    const tool = loadVideoSubtitleContent(mockClient, { langfuseTraceId: 'test-trace-id' })
    
    const result = await tool.execute({
      videoId: 'video-123',
      languageId: 'en'
    })

    expect(result).toEqual({
      id: 'subtitle-123',
      languageId: 'en',
      edition: 'default',
      primary: true,
      srtSrc: null
    })

    // Verify fetch was not called since srtSrc is null
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should handle missing subtitle gracefully', async () => {
    // Mock Apollo query response with no subtitles
    jest.spyOn(mockClient, 'query').mockResolvedValue({
      data: {
        video: {
          variant: {
            subtitle: []
          }
        }
      }
    } as any)

    const tool = loadVideoSubtitleContent(mockClient, { langfuseTraceId: 'test-trace-id' })
    
    await expect(tool.execute({
      videoId: 'video-123',
      languageId: 'en'
    })).rejects.toThrow('No subtitle found for video video-123 and language en')
  })
}) 