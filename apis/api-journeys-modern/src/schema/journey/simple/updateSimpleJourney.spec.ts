import type { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

import { prismaMock } from '../../../../test/prismaMock'

import { updateSimpleJourney } from './updateSimpleJourney'

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
})
