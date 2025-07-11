import type { JourneySimpleUpdate } from '@core/shared/ai/journeySimpleTypes'

import { prismaMock } from '../../../../test/prismaMock'

import { updateSimpleJourney } from './updateSimpleJourney'

// Mock node-fetch
jest.mock('node-fetch')
const mockFetch = require('node-fetch') as jest.MockedFunction<typeof fetch>

const txMock = {
  block: {
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  journey: {
    update: jest.fn()
  }
}

describe('updateSimpleJourney', () => {
  const journeyId = 'jid'
  const simple: JourneySimpleUpdate = {
    title: 'Journey',
    description: 'desc',
    cards: [
      {
        id: 'card-1',
        heading: 'Heading',
        text: 'Text',
        image: {
          src: 'img.jpg',
          alt: 'alt',
          width: 100,
          height: 100,
          blurhash: ''
        },
        poll: [
          { text: 'Option 1', nextCard: 'card-2' },
          { text: 'Option 2', url: 'https://example.com' }
        ],
        button: { text: 'Next', nextCard: 'card-2' },
        backgroundImage: {
          src: 'bg.jpg',
          alt: 'bg',
          width: 200,
          height: 200,
          blurhash: ''
        },
        defaultNextCard: 'card-2'
      },
      {
        id: 'card-2',
        heading: 'Second',
        text: 'Second text',
        defaultNextCard: 'card-3'
      },
      {
        id: 'card-3',
        button: { text: 'End', url: 'https://example.com' }
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
    txMock.block.create.mockResolvedValue({ id: 'mock-block-id' } as any)
    txMock.block.update.mockResolvedValue({} as any)
    prismaMock.$transaction.mockImplementation(
      async (callback) => await callback(txMock as any)
    )

    // Mock successful YouTube API response
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          items: [
            {
              contentDetails: {
                duration: 'PT3M45S' // 3 minutes 45 seconds = 225 seconds
              }
            }
          ]
        })
    } as any)
  })

  it('wraps all operations in a transaction', async () => {
    await updateSimpleJourney(journeyId, simple)
    expect(prismaMock.$transaction).toHaveBeenCalled()
  })

  it('marks all non-deleted blocks as deleted', async () => {
    await updateSimpleJourney(journeyId, simple)
    expect(txMock.block.updateMany).toHaveBeenCalledWith({
      where: { journeyId, deletedAt: null },
      data: { deletedAt: expect.any(String) }
    })
  })

  it('updates journey title and description', async () => {
    await updateSimpleJourney(journeyId, simple)
    expect(txMock.journey.update).toHaveBeenCalledWith({
      where: { id: journeyId },
      data: { title: simple.title, description: simple.description }
    })
  })

  it('creates StepBlocks and CardBlocks for each card', async () => {
    await updateSimpleJourney(journeyId, simple)
    // Should create 3 StepBlocks and 3 CardBlocks
    const stepCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'StepBlock'
    )
    const cardCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'CardBlock'
    )
    expect(stepCalls.length).toBe(3)
    expect(cardCalls.length).toBe(3)
  })

  it('creates content blocks for heading, text, image, poll, button, backgroundImage, defaultNextCard', async () => {
    await updateSimpleJourney(journeyId, simple)
    // Check for TypographyBlock, ImageBlock, RadioQuestionBlock, RadioOptionBlock, ButtonBlock
    const types = txMock.block.create.mock.calls.map(
      ([data]: [any]) => data.data.typename
    )
    expect(types).toContain('TypographyBlock')
    expect(types).toContain('ImageBlock')
    expect(types).toContain('RadioQuestionBlock')
    expect(types).toContain('RadioOptionBlock')
    expect(types).toContain('ButtonBlock')
  })

  it('creates VideoBlock for video cards with full timing', async () => {
    const videoJourney: JourneySimpleUpdate = {
      title: 'Video Journey',
      description: 'A journey with video',
      cards: [
        {
          id: 'video-card-1',
          video: {
            url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            startAt: 30,
            endAt: 120
          },
          defaultNextCard: 'card-2'
        },
        {
          id: 'card-2',
          button: { text: 'End', url: 'https://example.com' }
        }
      ]
    }

    await updateSimpleJourney(journeyId, videoJourney)

    const videoCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'VideoBlock'
    )
    expect(videoCalls.length).toBe(1)

    const videoBlockData = videoCalls[0][0].data
    expect(videoBlockData.source).toBe('youTube')
    expect(videoBlockData.videoId).toBe('dQw4w9WgXcQ')
    expect(videoBlockData.startAt).toBe(30)
    expect(videoBlockData.endAt).toBe(120)
  })

  it('creates VideoBlock for video cards with default timing (fetches from YouTube API)', async () => {
    const videoJourney: JourneySimpleUpdate = {
      title: 'Video Journey',
      description: 'A journey with video',
      cards: [
        {
          id: 'video-card-1',
          video: {
            url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
            // No startAt/endAt provided
          },
          defaultNextCard: 'card-2'
        },
        {
          id: 'card-2',
          button: { text: 'End', url: 'https://example.com' }
        }
      ]
    }

    await updateSimpleJourney(journeyId, videoJourney)

    // Should call YouTube API to get duration
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://www.googleapis.com/youtube/v3/videos')
    )

    const videoCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'VideoBlock'
    )
    const videoBlockData = videoCalls[0][0].data
    expect(videoBlockData.startAt).toBe(0) // Default startAt
    expect(videoBlockData.endAt).toBe(225) // Duration from mocked API response (3m45s)
  })

  it('extracts videoId from various YouTube URL formats', async () => {
    const testUrls = [
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://youtube.com/embed/dQw4w9WgXcQ',
      'dQw4w9WgXcQ' // Direct videoId
    ]

    for (const url of testUrls) {
      const videoJourney: JourneySimpleUpdate = {
        title: 'Video Journey',
        description: 'Test URL extraction',
        cards: [
          {
            id: 'video-card-1',
            video: { url },
            defaultNextCard: 'card-2'
          },
          {
            id: 'card-2',
            button: { text: 'End', url: 'https://example.com' }
          }
        ]
      }

      jest.clearAllMocks()
      txMock.block.create.mockResolvedValue({ id: 'mock-block-id' } as any)

      await updateSimpleJourney(journeyId, videoJourney)

      const videoCalls = txMock.block.create.mock.calls.filter(
        ([data]: [any]) => data.data.typename === 'VideoBlock'
      )
      expect(videoCalls.length).toBe(1)
      expect(videoCalls[0][0].data.videoId).toBe('dQw4w9WgXcQ')
    }
  })

  it('throws error for invalid YouTube URLs', async () => {
    const videoJourney: JourneySimpleUpdate = {
      title: 'Invalid Video Journey',
      description: 'A journey with invalid video URL',
      cards: [
        {
          id: 'video-card-1',
          video: {
            url: 'https://vimeo.com/123456789' // Not YouTube
          },
          defaultNextCard: 'card-2'
        },
        {
          id: 'card-2',
          button: { text: 'End', url: 'https://example.com' }
        }
      ]
    }

    await expect(updateSimpleJourney(journeyId, videoJourney)).rejects.toThrow(
      'Invalid YouTube video URL'
    )
  })

  it('throws error when YouTube API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          items: [] // No video found
        })
    } as any)

    const videoJourney: JourneySimpleUpdate = {
      title: 'Video Journey',
      description: 'A journey with video',
      cards: [
        {
          id: 'video-card-1',
          video: {
            url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
          },
          defaultNextCard: 'card-2'
        },
        {
          id: 'card-2',
          button: { text: 'End', url: 'https://example.com' }
        }
      ]
    }

    await expect(updateSimpleJourney(journeyId, videoJourney)).rejects.toThrow(
      'Could not fetch video duration'
    )
  })

  it('creates video block with navigation action when defaultNextCard is provided', async () => {
    const videoJourney: JourneySimpleUpdate = {
      title: 'Video Journey',
      description: 'A journey with video',
      cards: [
        {
          id: 'video-card-1',
          video: {
            url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            startAt: 0,
            endAt: 60
          },
          defaultNextCard: 'card-2'
        },
        {
          id: 'card-2',
          button: { text: 'End', url: 'https://example.com' }
        }
      ]
    }

    await updateSimpleJourney(journeyId, videoJourney)

    const videoCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'VideoBlock'
    )
    const videoBlockData = videoCalls[0][0].data
    expect(videoBlockData.action).toBeDefined()
    expect(videoBlockData.action.create.blockId).toBeDefined()
  })

  it('does not create other content blocks for video cards', async () => {
    const videoJourney: JourneySimpleUpdate = {
      title: 'Video Journey',
      description: 'A journey with video only',
      cards: [
        {
          id: 'video-card-1',
          video: {
            url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
          },
          defaultNextCard: 'card-2'
        },
        {
          id: 'card-2',
          button: { text: 'End', url: 'https://example.com' }
        }
      ]
    }

    await updateSimpleJourney(journeyId, videoJourney)

    const allCalls = txMock.block.create.mock.calls
    const contentTypes = allCalls.map(([data]: [any]) => data.data.typename)

    // Should have StepBlocks, CardBlocks, VideoBlock, and ButtonBlock
    // Should NOT have TypographyBlock, ImageBlock, etc. for the video card
    expect(contentTypes.filter((type) => type === 'VideoBlock')).toHaveLength(1)
    expect(contentTypes.filter((type) => type === 'ButtonBlock')).toHaveLength(
      1
    ) // Only for card-2
    expect(
      contentTypes.filter((type) => type === 'TypographyBlock')
    ).toHaveLength(0)
    expect(contentTypes.filter((type) => type === 'ImageBlock')).toHaveLength(0)
  })

  it('parses ISO8601 duration correctly', async () => {
    // Test different duration formats
    const durations = [
      { iso: 'PT3M45S', expected: 225 }, // 3m45s
      { iso: 'PT1H30M', expected: 5400 }, // 1h30m
      { iso: 'PT45S', expected: 45 }, // 45s
      { iso: 'PT2H', expected: 7200 }, // 2h
      { iso: 'PT10M', expected: 600 } // 10m
    ]

    for (const { iso, expected } of durations) {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            items: [
              {
                contentDetails: {
                  duration: iso
                }
              }
            ]
          })
      } as any)

      const videoJourney: JourneySimpleUpdate = {
        title: 'Duration Test',
        description: 'Testing duration parsing',
        cards: [
          {
            id: 'video-card',
            video: { url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }, // Use valid video ID
            defaultNextCard: 'end-card'
          },
          {
            id: 'end-card',
            button: { text: 'End', url: 'https://example.com' }
          }
        ]
      }

      jest.clearAllMocks()
      txMock.block.create.mockResolvedValue({ id: 'mock-id' } as any)

      await updateSimpleJourney(journeyId, videoJourney)

      const videoCalls = txMock.block.create.mock.calls.filter(
        ([data]: [any]) => data.data.typename === 'VideoBlock'
      )
      expect(videoCalls[0][0].data.endAt).toBe(expected)
    }
  })

  it('handles missing optional fields gracefully', async () => {
    const minimal: JourneySimpleUpdate = {
      title: 't',
      description: 'd',
      cards: [
        {
          id: 'c1',
          defaultNextCard: 'c2'
        },
        {
          id: 'c2',
          button: { text: 'End', url: 'https://example.com' }
        }
      ]
    }
    await expect(updateSimpleJourney(journeyId, minimal)).resolves.not.toThrow()
  })
})
