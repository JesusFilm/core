import { ApolloClient } from '@apollo/client'

import type { JourneySimpleUpdate } from '@core/shared/ai/journeySimpleTypes'

import { prismaMock } from '../../../../test/prismaMock'

import { updateSimpleJourney } from './updateSimpleJourney'

jest.mock('../../../utils/generateBlurhashAndMetadataFromUrl', () => ({
  generateBlurhashAndMetadataFromUrl: jest.fn().mockResolvedValue({
    blurhash: 'mocked-blurhash',
    width: 100,
    height: 100
  })
}))

jest.mock('@apollo/client')
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
        x: 0,
        y: 0,
        content: [
          { type: 'heading', text: 'Heading', variant: 'h3' as const },
          { type: 'text', text: 'Body text', variant: 'body1' as const },
          {
            type: 'image',
            src: 'https://images.unsplash.com/photo-123',
            alt: 'alt',
            width: 100,
            height: 100,
            blurhash: ''
          },
          {
            type: 'button',
            text: 'Next',
            action: { kind: 'navigate', cardId: 'card-2' }
          },
          {
            type: 'poll', gridView: false,
            options: [
              {
                text: 'Option 1',
                action: { kind: 'navigate', cardId: 'card-2' }
              },
              { text: 'Option 2', action: { kind: 'url', url: 'https://example.com' } }
            ]
          }
        ],
        backgroundImage: {
          src: 'https://images.unsplash.com/photo-456',
          alt: 'bg'
        },
        defaultNextCard: 'card-2'
      },
      {
        id: 'card-2',
        x: 100,
        y: 100,
        content: [
          { type: 'heading', text: 'Second', variant: 'h3' as const },
          { type: 'text', text: 'Second text', variant: 'body1' as const }
        ],
        defaultNextCard: 'card-3'
      },
      {
        id: 'card-3',
        x: 200,
        y: 200,
        content: [
          {
            type: 'button',
            text: 'End',
            action: { kind: 'url', url: 'https://example.com' }
          }
        ]
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
    txMock.block.create.mockResolvedValue({ id: 'mock-block-id' } as any)
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(txMock as any)
    )

    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          items: [
            {
              contentDetails: {
                duration: 'PT3M45S' // 225 seconds
              }
            }
          ]
        })
    } as any)
  })

  it('should wrap all operations in a transaction', async () => {
    await updateSimpleJourney(journeyId, simple)
    expect(prismaMock.$transaction).toHaveBeenCalled()
  })

  it('should mark all non-deleted blocks as deleted', async () => {
    await updateSimpleJourney(journeyId, simple)
    expect(txMock.block.updateMany).toHaveBeenCalledWith({
      where: { journeyId, deletedAt: null },
      data: { deletedAt: expect.any(String) }
    })
  })

  it('should update journey title and description', async () => {
    await updateSimpleJourney(journeyId, simple)
    expect(txMock.journey.update).toHaveBeenCalledWith({
      where: { id: journeyId },
      data: { title: simple.title, description: simple.description }
    })
  })

  it('should create StepBlocks and CardBlocks for each card', async () => {
    await updateSimpleJourney(journeyId, simple)
    const stepCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'StepBlock'
    )
    const cardCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'CardBlock'
    )
    expect(stepCalls).toHaveLength(3)
    expect(cardCalls).toHaveLength(3)
  })

  it('should create content blocks from content array (heading, text, button, image)', async () => {
    await updateSimpleJourney(journeyId, simple)
    const types = txMock.block.create.mock.calls.map(
      ([data]: [any]) => data.data.typename
    )
    expect(types).toContain('TypographyBlock')
    expect(types).toContain('ImageBlock')
    expect(types).toContain('ButtonBlock')
    expect(types).toContain('RadioQuestionBlock')
    expect(types).toContain('RadioOptionBlock')
  })

  it('should handle all 5 action kinds (navigate, url, email, chat, phone)', async () => {
    const actionJourney: JourneySimpleUpdate = {
      title: 'Actions',
      description: 'All action kinds',
      cards: [
        {
          id: 'card-1',
          x: 0,
          y: 0,
          content: [
            {
              type: 'button',
              text: 'Navigate',
              action: { kind: 'navigate', cardId: 'card-2' }
            },
            {
              type: 'button',
              text: 'URL',
              action: { kind: 'url', url: 'https://example.com' }
            },
            {
              type: 'button',
              text: 'Email',
              action: { kind: 'email', email: 'test@example.com' }
            },
            {
              type: 'button',
              text: 'Chat',
              action: { kind: 'chat', chatUrl: 'https://wa.me/123' }
            },
            {
              type: 'button',
              text: 'Phone',
              action: {
                kind: 'phone',
                phone: '+15551234567',
                countryCode: 'US',
                contactAction: 'call'
              }
            }
          ]
        },
        {
          id: 'card-2',
          x: 300,
          y: 0,
          content: [{ type: 'heading', text: 'Done', variant: 'h3' as const }]
        }
      ]
    }

    await updateSimpleJourney(journeyId, actionJourney)

    const buttonCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'ButtonBlock'
    )
    expect(buttonCalls).toHaveLength(5)

    // navigate
    expect(buttonCalls[0][0].data.action).toEqual({
      create: { blockId: 'mock-block-id' }
    })
    // url
    expect(buttonCalls[1][0].data.action).toEqual({
      create: { url: 'https://example.com' }
    })
    // email
    expect(buttonCalls[2][0].data.action).toEqual({
      create: { email: 'test@example.com' }
    })
    // chat
    expect(buttonCalls[3][0].data.action).toEqual({
      create: { chatUrl: 'https://wa.me/123' }
    })
    // phone
    expect(buttonCalls[4][0].data.action).toEqual({
      create: {
        phone: '+15551234567',
        countryCode: 'US',
        contactAction: 'call'
      }
    })
  })

  it('should create poll with options and actions', async () => {
    const pollJourney: JourneySimpleUpdate = {
      title: 'Poll',
      description: 'Poll test',
      cards: [
        {
          id: 'card-1',
          x: 0,
          y: 0,
          content: [
            {
              type: 'poll',
              gridView: true,
              options: [
                {
                  text: 'Option A',
                  action: { kind: 'navigate', cardId: 'card-2' }
                },
                {
                  text: 'Option B',
                  action: { kind: 'url', url: 'https://example.com' }
                }
              ]
            }
          ]
        },
        {
          id: 'card-2',
          x: 300,
          y: 0,
          content: [{ type: 'heading', text: 'Done', variant: 'h3' as const }]
        }
      ]
    }

    await updateSimpleJourney(journeyId, pollJourney)

    const radioCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'RadioQuestionBlock'
    )
    expect(radioCalls).toHaveLength(1)
    expect(radioCalls[0][0].data.gridView).toBe(true)

    const optionCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'RadioOptionBlock'
    )
    expect(optionCalls).toHaveLength(2)
    expect(optionCalls[0][0].data.label).toBe('Option A')
    expect(optionCalls[1][0].data.label).toBe('Option B')
    expect(optionCalls[1][0].data.action).toEqual({
      create: { url: 'https://example.com' }
    })
  })

  it('should create multiselect with option blocks', async () => {
    const msJourney: JourneySimpleUpdate = {
      title: 'Multiselect',
      description: 'MS test',
      cards: [
        {
          id: 'card-1',
          x: 0,
          y: 0,
          content: [
            {
              type: 'multiselect',
              min: 1,
              max: 3,
              options: ['Alpha', 'Beta', 'Gamma']
            }
          ]
        }
      ]
    }

    await updateSimpleJourney(journeyId, msJourney)

    const msCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'MultiselectBlock'
    )
    expect(msCalls).toHaveLength(1)
    expect(msCalls[0][0].data.min).toBe(1)
    expect(msCalls[0][0].data.max).toBe(3)

    const optionCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'MultiselectOptionBlock'
    )
    expect(optionCalls).toHaveLength(3)
    expect(optionCalls[0][0].data.label).toBe('Alpha')
    expect(optionCalls[1][0].data.label).toBe('Beta')
    expect(optionCalls[2][0].data.label).toBe('Gamma')
  })

  it('should create textInput block', async () => {
    const tiJourney: JourneySimpleUpdate = {
      title: 'TextInput',
      description: 'TI test',
      cards: [
        {
          id: 'card-1',
          x: 0,
          y: 0,
          content: [
            {
              type: 'textInput',
              label: 'Your name',
              inputType: 'name',
              placeholder: 'Enter name',
              hint: 'First and last',
              required: true
            }
          ]
        }
      ]
    }

    await updateSimpleJourney(journeyId, tiJourney)

    const tiCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'TextResponseBlock'
    )
    expect(tiCalls).toHaveLength(1)
    expect(tiCalls[0][0].data).toMatchObject({
      label: 'Your name',
      type: 'name',
      placeholder: 'Enter name',
      hint: 'First and last',
      required: true
    })
  })

  it('should create spacer block', async () => {
    const spacerJourney: JourneySimpleUpdate = {
      title: 'Spacer',
      description: 'Spacer test',
      cards: [
        {
          id: 'card-1',
          x: 0,
          y: 0,
          content: [{ type: 'spacer', spacing: 24 }]
        }
      ]
    }

    await updateSimpleJourney(journeyId, spacerJourney)

    const spacerCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'SpacerBlock'
    )
    expect(spacerCalls).toHaveLength(1)
    expect(spacerCalls[0][0].data.spacing).toBe(24)
  })

  it('should create backgroundImage as cover block', async () => {
    await updateSimpleJourney(journeyId, simple)

    const imageCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) =>
        data.data.typename === 'ImageBlock' && data.data.parentOrder == null
    )
    expect(imageCalls.length).toBeGreaterThanOrEqual(1)

    expect(txMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'mock-block-id' },
        data: { coverBlockId: 'mock-block-id' }
      })
    )
  })

  it('should create backgroundVideo as cover block', async () => {
    const bgVideoJourney: JourneySimpleUpdate = {
      title: 'BgVideo',
      description: 'Background video test',
      cards: [
        {
          id: 'card-1',
          x: 0,
          y: 0,
          content: [{ type: 'heading', text: 'Hello', variant: 'h3' as const }],
          backgroundVideo: {
            url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            startAt: 10,
            endAt: 60
          }
        }
      ]
    }

    await updateSimpleJourney(journeyId, bgVideoJourney)

    const videoCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'VideoBlock'
    )
    expect(videoCalls).toHaveLength(1)
    expect(videoCalls[0][0].data.videoId).toBe('dQw4w9WgXcQ')
    expect(videoCalls[0][0].data.startAt).toBe(10)
    expect(videoCalls[0][0].data.endAt).toBe(60)

    expect(txMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { coverBlockId: 'mock-block-id' }
      })
    )
  })

  it('should auto-assign x/y when omitted', async () => {
    const autoXYJourney: JourneySimpleUpdate = {
      title: 'AutoXY',
      description: 'Auto layout test',
      cards: [
        {
          id: 'card-1',
          content: [{ type: 'heading', text: 'First', variant: 'h3' as const }]
        },
        {
          id: 'card-2',
          content: [{ type: 'heading', text: 'Second', variant: 'h3' as const }]
        },
        {
          id: 'card-3',
          content: [{ type: 'heading', text: 'Third', variant: 'h3' as const }]
        }
      ]
    }

    await updateSimpleJourney(journeyId, autoXYJourney)

    const stepCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'StepBlock'
    )
    expect(stepCalls[0][0].data.x).toBe(0)
    expect(stepCalls[0][0].data.y).toBe(0)
    expect(stepCalls[1][0].data.x).toBe(300)
    expect(stepCalls[1][0].data.y).toBe(0)
    expect(stepCalls[2][0].data.x).toBe(600)
    expect(stepCalls[2][0].data.y).toBe(0)
  })

  it('should create VideoBlock for video content', async () => {
    const videoJourney: JourneySimpleUpdate = {
      title: 'Video',
      description: 'Video test',
      cards: [
        {
          id: 'card-1',
          x: 0,
          y: 0,
          content: [
            {
              type: 'video',
              url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
              startAt: 30,
              endAt: 120
            }
          ]
        }
      ]
    }

    await updateSimpleJourney(journeyId, videoJourney)

    const videoCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'VideoBlock'
    )
    expect(videoCalls).toHaveLength(1)
    expect(videoCalls[0][0].data).toMatchObject({
      typename: 'VideoBlock',
      videoId: 'dQw4w9WgXcQ',
      source: 'youTube',
      autoplay: true,
      startAt: 30,
      endAt: 120
    })
  })

  it('should fetch YouTube duration when endAt not provided', async () => {
    const videoJourney: JourneySimpleUpdate = {
      title: 'Video',
      description: 'Duration fetch test',
      cards: [
        {
          id: 'card-1',
          x: 0,
          y: 0,
          content: [
            {
              type: 'video',
              url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
            }
          ]
        }
      ]
    }

    await updateSimpleJourney(journeyId, videoJourney)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://www.googleapis.com/youtube/v3/videos')
    )

    const videoCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'VideoBlock'
    )
    expect(videoCalls[0][0].data.startAt).toBe(0)
    expect(videoCalls[0][0].data.endAt).toBe(225) // PT3M45S
  })

  describe('cloudflare upload', () => {
    it('should handle valid image URLs without Cloudflare upload', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              createCloudflareUploadByUrl: { id: 'unused' }
            }
          })
      )

      const validImageJourney: JourneySimpleUpdate = {
        title: 'Valid Images',
        description: 'No upload needed',
        cards: [
          {
            id: 'card-1',
            x: 0,
            y: 0,
            content: [
              {
                type: 'image',
                src: 'https://imagedelivery.net/test/valid-id/public',
                alt: 'valid'
              }
            ],
            backgroundImage: {
              src: 'https://images.unsplash.com/photo-123',
              alt: 'bg'
            }
          }
        ]
      }

      await updateSimpleJourney(journeyId, validImageJourney)
      expect(ApolloClient.prototype.mutate).not.toHaveBeenCalled()

      const imageCalls = txMock.block.create.mock.calls.filter(
        ([data]: [any]) => data.data.typename === 'ImageBlock'
      )
      // content image + background image
      expect(imageCalls).toHaveLength(2)
      expect(imageCalls[0][0].data.src).toBe(
        'https://imagedelivery.net/test/valid-id/public'
      )
      expect(imageCalls[1][0].data.src).toBe(
        'https://images.unsplash.com/photo-123'
      )
    })

    it('should upload invalid image URLs to Cloudflare', async () => {
      const mockImageId = 'test-cf-image-id'
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              createCloudflareUploadByUrl: { id: mockImageId }
            }
          })
      )

      const invalidImageJourney: JourneySimpleUpdate = {
        title: 'Invalid Images',
        description: 'Upload needed',
        cards: [
          {
            id: 'card-1',
            x: 0,
            y: 0,
            content: [
              {
                type: 'image',
                src: 'https://unknown-host.com/image.jpg',
                alt: 'test'
              }
            ],
            backgroundImage: {
              src: 'https://another-invalid.com/bg.jpg',
              alt: 'bg'
            }
          }
        ]
      }

      await updateSimpleJourney(journeyId, invalidImageJourney)

      expect(ApolloClient.prototype.mutate).toHaveBeenCalledTimes(2)

      const imageCalls = txMock.block.create.mock.calls.filter(
        ([data]: [any]) => data.data.typename === 'ImageBlock'
      )
      expect(imageCalls).toHaveLength(2)
      const expectedSrc = `https://imagedelivery.net/test-cloudflare-account-hash/${mockImageId}/public`
      expect(imageCalls[0][0].data.src).toBe(expectedSrc)
      expect(imageCalls[1][0].data.src).toBe(expectedSrc)

      for (const call of imageCalls) {
        expect(call[0].data.width).toBe(100)
        expect(call[0].data.height).toBe(100)
        expect(call[0].data.blurhash).toBe('mocked-blurhash')
      }
    })
  })

  it('should set defaultNextCard via StepBlock.nextBlockId', async () => {
    await updateSimpleJourney(journeyId, simple)

    // card-1 and card-2 both have defaultNextCard set
    const stepUpdateCalls = txMock.block.update.mock.calls.filter(
      ([data]: [any]) => data.data.nextBlockId != null
    )
    expect(stepUpdateCalls.length).toBeGreaterThanOrEqual(2)
    expect(stepUpdateCalls[0][0].data.nextBlockId).toBe('mock-block-id')
  })

  it('should throw error for invalid YouTube URLs', async () => {
    const invalidVideoJourney: JourneySimpleUpdate = {
      title: 'Invalid Video',
      description: 'Bad URL',
      cards: [
        {
          id: 'card-1',
          x: 0,
          y: 0,
          content: [
            {
              type: 'video',
              url: 'https://vimeo.com/123456789'
            }
          ]
        }
      ]
    }

    await expect(
      updateSimpleJourney(journeyId, invalidVideoJourney)
    ).rejects.toThrow('Invalid YouTube video URL')
  })
})
