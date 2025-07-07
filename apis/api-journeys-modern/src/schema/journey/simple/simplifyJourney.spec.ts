import { Prisma } from '.prisma/api-journeys-modern-client'
import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { simplifyJourney } from './simplifyJourney'

type TestJourney = Prisma.JourneyGetPayload<{
  include: { blocks: { include: { action: true } } }
}>

describe('simplifyJourney', () => {
  const baseJourney: TestJourney = {
    title: 'Test Journey',
    description: 'A test journey',
    blocks: []
  } as any // as any to allow minimal mock

  it('transforms a journey with one step/card and minimal blocks', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' }
      ] as any
    }
    const result = simplifyJourney(journey)
    expect(result.title).toBe('Test Journey')
    expect(result.description).toBe('A test journey')
    expect(result.cards.length).toBe(1)
    expect(journeySimpleSchema.safeParse(result).success).toBe(true)
  })

  it('transforms a journey with heading, text, button, poll, image, backgroundImage, and navigation', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        {
          id: 'step-1',
          typename: 'StepBlock',
          nextBlockId: 'step-2',
          coverBlockId: 'bg-1'
        },
        {
          id: 'card-1',
          typename: 'CardBlock',
          parentBlockId: 'step-1',
          coverBlockId: 'bg-1'
        },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Heading'
        },
        {
          id: 'text-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'body1',
          content: 'Text'
        },
        {
          id: 'button-1',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'Next',
          action: { blockId: 'step-2' }
        },
        {
          id: 'poll-1',
          typename: 'RadioQuestionBlock',
          parentBlockId: 'card-1'
        },
        {
          id: 'option-1',
          typename: 'RadioOptionBlock',
          parentBlockId: 'poll-1',
          label: 'Option 1',
          action: { blockId: 'step-2' }
        },
        {
          id: 'option-2',
          typename: 'RadioOptionBlock',
          parentBlockId: 'poll-1',
          label: 'Option 2',
          action: { url: 'https://example.com' }
        },
        {
          id: 'image-1',
          typename: 'ImageBlock',
          parentBlockId: 'card-1',
          src: 'img.jpg',
          alt: 'alt',
          width: 100,
          height: 100,
          blurhash: ''
        },
        {
          id: 'bg-1',
          typename: 'ImageBlock',
          parentBlockId: 'card-1',
          src: 'bg.jpg',
          alt: 'bg',
          width: 200,
          height: 200,
          blurhash: ''
        },
        { id: 'step-2', typename: 'StepBlock' },
        { id: 'card-2', typename: 'CardBlock', parentBlockId: 'step-2' }
      ] as any
    }
    const result = simplifyJourney(journey)
    expect(result.cards.length).toBe(2)
    const card = result.cards[0]
    expect(card.heading).toBe('Heading')
    expect(card.text).toBe('Text')
    expect(card.button?.text).toBe('Next')
    expect(card.button?.nextCard).toBe('card-2')
    expect(card.poll?.length).toBe(2)
    expect(card.poll?.[0].text).toBe('Option 1')
    expect(card.poll?.[0].nextCard).toBe('card-2')
    expect(card.poll?.[1].url).toBe('https://example.com')
    expect(card.image?.src).toBe('img.jpg')
    expect(card.backgroundImage?.src).toBe('bg.jpg')
    expect(card.defaultNextCard).toBe('card-2')
    expect(journeySimpleSchema.safeParse(result).success).toBe(true)
  })

  it('handles edge case: missing/extra/invalid data gracefully', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        { id: 'unknown-1', typename: 'UnknownBlock', parentBlockId: 'card-1' },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Heading'
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    expect(result.cards.length).toBe(1)
    expect(result.cards[0].heading).toBe('Heading')
    expect(journeySimpleSchema.safeParse(result).success).toBe(true)
  })

  it('throws error if card block is missing for a step', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [{ id: 'step-1', typename: 'StepBlock' }] as any
    }
    expect(() => simplifyJourney(journey)).toThrow('Card block not found')
  })
})
