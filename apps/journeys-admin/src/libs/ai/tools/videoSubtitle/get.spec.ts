import { ApolloClient, InMemoryCache } from '@apollo/client'

import { loadVideoSubtitleContent } from './get'

describe('loadVideoSubtitleContent', () => {
  let mockClient: ApolloClient<any>
  let fetchMock: jest.SpyInstance

  beforeEach(() => {
    mockClient = new ApolloClient({
      cache: new InMemoryCache()
    })
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({ ok: false } as Response))
  })

  afterEach(() => {
    fetchMock.mockRestore()
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

    fetchMock.mockResolvedValue({
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

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/subtitle.srt')
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

    fetchMock.mockRejectedValue(new Error('Network error'))

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
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/subtitle.srt')
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
    expect(fetchMock).not.toHaveBeenCalled()
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