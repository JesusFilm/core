import { ApolloClient } from '@apollo/client'

import type { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

import { prismaMock } from '../../../../test/prismaMock'

import { updateSimpleJourney } from './updateSimpleJourney'

// Mock environment variables
const originalEnv = process.env

// Mock ApolloClient
jest.mock('@apollo/client')

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
  const simple: JourneySimple = {
    title: 'Journey',
    description: 'desc',
    cards: [
      {
        id: 'card-1',
        heading: 'Heading',
        text: 'Text',
        image: {
          src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
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
          src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
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
        text: 'Second text'
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
    txMock.block.create.mockResolvedValue({} as any)
    txMock.block.update.mockResolvedValue({} as any)
    prismaMock.$transaction.mockImplementation(
      async (callback) => await callback(txMock as any)
    )
    // Mock environment variables
    process.env = { ...originalEnv }
    process.env.CLOUDFLARE_UPLOAD_KEY = 'test-cloudflare-account-hash'
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
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
    // Should create 2 StepBlocks and 2 CardBlocks
    const stepCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'StepBlock'
    )
    const cardCalls = txMock.block.create.mock.calls.filter(
      ([data]: [any]) => data.data.typename === 'CardBlock'
    )
    expect(stepCalls.length).toBe(2)
    expect(cardCalls.length).toBe(2)
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

  it('handles missing optional fields gracefully', async () => {
    const minimal: JourneySimple = {
      title: 't',
      description: 'd',
      cards: [{ id: 'c1' }]
    }
    await expect(updateSimpleJourney(journeyId, minimal)).resolves.not.toThrow()
  })

  describe('cloudflare upload', () => {
    it('uploads invalid image URLs to Cloudflare and uses the returned URL', async () => {
      // Mock Apollo mutation to return a specific image ID
      const mockImageId = 'test-cloudflare-image-id'
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              createCloudflareUploadByUrl: {
                id: mockImageId
              }
            }
          })
      )

      // Test with invalid URLs that should trigger upload
      const testData = {
        ...simple,
        cards: [
          {
            ...simple.cards[0],
            image: {
              src: 'https://invalid-domain.com/image.jpg', // Invalid URL
              alt: 'test',
              width: 100,
              height: 100,
              blurhash: ''
            },
            backgroundImage: {
              src: 'https://another-invalid-domain.com/bg.jpg', // Invalid URL
              alt: 'bg',
              width: 200,
              height: 200,
              blurhash: ''
            }
          }
        ]
      }

      await updateSimpleJourney(journeyId, testData)

      // Verify Apollo mutation was called for both images
      expect(ApolloClient.prototype.mutate).toHaveBeenCalledTimes(2)

      // Verify the correct Cloudflare URLs were used in block creation
      const imageBlockCalls = txMock.block.create.mock.calls.filter(
        ([data]: [any]) => data.data.typename === 'ImageBlock'
      )

      expect(imageBlockCalls).toHaveLength(2)
      expect(imageBlockCalls[0][0].data.src).toBe(
        `https://imagedelivery.net/test-cloudflare-account-hash/${mockImageId}/public`
      )
      expect(imageBlockCalls[1][0].data.src).toBe(
        `https://imagedelivery.net/test-cloudflare-account-hash/${mockImageId}/public`
      )
    })

    it('uses valid image URLs as-is without uploading to Cloudflare', async () => {
      // Mock Apollo mutation to not be called
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              createCloudflareUploadByUrl: {
                id: 'test-cloudflare-image-id'
              }
            }
          })
      )

      // Test with valid URLs that should NOT trigger upload
      const testData = {
        ...simple,
        cards: [
          {
            ...simple.cards[0],
            image: {
              src: 'https://imagedelivery.net/test/valid-image-id/public', // Valid URL
              alt: 'test',
              width: 100,
              height: 100,
              blurhash: ''
            },
            backgroundImage: {
              src: 'https://images.unsplash.com/photo-123456789', // Valid URL
              alt: 'bg',
              width: 200,
              height: 200,
              blurhash: ''
            }
          }
        ]
      }

      await updateSimpleJourney(journeyId, testData)

      // Verify Apollo mutation was NOT called
      expect(ApolloClient.prototype.mutate).not.toHaveBeenCalled()

      // Verify the original URLs were used in block creation
      const imageBlockCalls = txMock.block.create.mock.calls.filter(
        ([data]: [any]) => data.data.typename === 'ImageBlock'
      )

      expect(imageBlockCalls).toHaveLength(2)
      expect(imageBlockCalls[0][0].data.src).toBe(
        'https://imagedelivery.net/test/valid-image-id/public'
      )
      expect(imageBlockCalls[1][0].data.src).toBe(
        'https://images.unsplash.com/photo-123456789'
      )
    })
  })
})
