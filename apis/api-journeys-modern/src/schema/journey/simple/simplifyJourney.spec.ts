import { Prisma } from '@core/prisma/journeys/client'
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
  } as any

  it('should transform a journey with heading and button (content array format)', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Welcome'
        },
        {
          id: 'button-1',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'Next',
          action: { url: 'https://example.com' }
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    expect(result.title).toBe('Test Journey')
    expect(result.description).toBe('A test journey')
    expect(result.cards).toHaveLength(1)
    const card = result.cards[0]
    expect(card.content).toHaveLength(2)
    expect(card.content[0]).toEqual({
      type: 'heading',
      text: 'Welcome',
      variant: 'h3'
    })
    expect(card.content[1]).toEqual({
      type: 'button',
      text: 'Next',
      action: { kind: 'url', url: 'https://example.com' }
    })
  })

  it('should transform a journey with all block types (heading, text, button, image, video, poll)', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        {
          id: 'step-1',
          typename: 'StepBlock',
          nextBlockId: 'step-2'
        },
        {
          id: 'card-1',
          typename: 'CardBlock',
          parentBlockId: 'step-1'
        },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Welcome',
          parentOrder: 0
        },
        {
          id: 'text-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'body1',
          content: 'Some body text',
          parentOrder: 1
        },
        {
          id: 'button-1',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'Go',
          action: { blockId: 'step-2' },
          parentOrder: 2
        },
        {
          id: 'image-1',
          typename: 'ImageBlock',
          parentBlockId: 'card-1',
          src: 'img.jpg',
          alt: 'photo',
          width: 100,
          height: 50,
          blurhash: 'LGF5#?xD',
          parentOrder: 3
        },
        {
          id: 'video-1',
          typename: 'VideoBlock',
          parentBlockId: 'card-1',
          source: 'youTube',
          videoId: 'abc123',
          startAt: 10,
          endAt: 60,
          parentOrder: 4
        },
        {
          id: 'poll-1',
          typename: 'RadioQuestionBlock',
          parentBlockId: 'card-1',
          parentOrder: 5
        },
        {
          id: 'option-1',
          typename: 'RadioOptionBlock',
          parentBlockId: 'poll-1',
          label: 'Option A',
          action: { blockId: 'step-2' },
          parentOrder: 0
        },
        {
          id: 'option-2',
          typename: 'RadioOptionBlock',
          parentBlockId: 'poll-1',
          label: 'Option B',
          action: { url: 'https://example.com' },
          parentOrder: 1
        },
        { id: 'step-2', typename: 'StepBlock' },
        {
          id: 'card-2',
          typename: 'CardBlock',
          parentBlockId: 'step-2'
        },
        {
          id: 'heading-2',
          typename: 'TypographyBlock',
          parentBlockId: 'card-2',
          variant: 'h3',
          content: 'Done'
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    expect(result.cards).toHaveLength(2)
    const card = result.cards[0]
    expect(card.content).toHaveLength(6)
    expect(card.content[0]).toEqual({
      type: 'heading',
      text: 'Welcome',
      variant: 'h3'
    })
    expect(card.content[1]).toEqual({
      type: 'text',
      text: 'Some body text',
      variant: 'body1'
    })
    expect(card.content[2]).toEqual({
      type: 'button',
      text: 'Go',
      action: { kind: 'navigate', cardId: 'card-done' }
    })
    expect(card.content[3]).toEqual({
      type: 'image',
      src: 'img.jpg',
      alt: 'photo',
      width: 100,
      height: 50,
      blurhash: 'LGF5#?xD'
    })
    expect(card.content[4]).toEqual({
      type: 'video',
      url: 'https://youtube.com/watch?v=abc123',
      startAt: 10,
      endAt: 60
    })
    expect(card.content[5]).toEqual({
      type: 'poll',
      gridView: false,
      options: [
        {
          text: 'Option A',
          action: { kind: 'navigate', cardId: 'card-done' }
        },
        {
          text: 'Option B',
          action: { kind: 'url', url: 'https://example.com' }
        }
      ]
    })
    expect(card.defaultNextCard).toBe('card-done')
  })

  it('should generate content-derived card IDs from headings', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Welcome Home'
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    expect(result.cards[0].id).toBe('card-welcome-home')
  })

  it('should fallback to text content for card ID when no heading', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'text-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'body1',
          content: 'Some descriptive paragraph text here and more'
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    // Slug is first 4 words
    expect(result.cards[0].id).toBe('card-some-descriptive-paragraph-text')
  })

  it('should handle duplicate headings with suffix', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Welcome'
        },
        { id: 'step-2', typename: 'StepBlock' },
        { id: 'card-2', typename: 'CardBlock', parentBlockId: 'step-2' },
        {
          id: 'heading-2',
          typename: 'TypographyBlock',
          parentBlockId: 'card-2',
          variant: 'h3',
          content: 'Welcome'
        },
        { id: 'step-3', typename: 'StepBlock' },
        { id: 'card-3', typename: 'CardBlock', parentBlockId: 'step-3' },
        {
          id: 'heading-3',
          typename: 'TypographyBlock',
          parentBlockId: 'card-3',
          variant: 'h3',
          content: 'Welcome'
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    expect(result.cards[0].id).toBe('card-welcome')
    expect(result.cards[1].id).toBe('card-welcome-2')
    expect(result.cards[2].id).toBe('card-welcome-3')
  })

  it('should map all 5 action kinds (navigate, url, email, chat, phone)', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Actions'
        },
        {
          id: 'btn-nav',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'Navigate',
          action: { blockId: 'step-2' },
          parentOrder: 1
        },
        {
          id: 'btn-url',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'URL',
          action: { url: 'https://example.com' },
          parentOrder: 2
        },
        {
          id: 'btn-email',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'Email',
          action: { email: 'test@example.com' },
          parentOrder: 3
        },
        {
          id: 'btn-chat',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'Chat',
          action: { chatUrl: 'https://wa.me/123' },
          parentOrder: 4
        },
        {
          id: 'btn-phone',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'Phone',
          action: {
            phone: '+1234567890',
            countryCode: 'US',
            contactAction: 'call'
          },
          parentOrder: 5
        },
        { id: 'step-2', typename: 'StepBlock' },
        { id: 'card-2', typename: 'CardBlock', parentBlockId: 'step-2' },
        {
          id: 'heading-2',
          typename: 'TypographyBlock',
          parentBlockId: 'card-2',
          variant: 'h3',
          content: 'Target'
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const buttons = result.cards[0].content.filter((b) => b.type === 'button')
    expect(buttons).toHaveLength(5)
    expect(buttons[0]).toEqual({
      type: 'button',
      text: 'Navigate',
      action: { kind: 'navigate', cardId: 'card-target' }
    })
    expect(buttons[1]).toEqual({
      type: 'button',
      text: 'URL',
      action: { kind: 'url', url: 'https://example.com' }
    })
    expect(buttons[2]).toEqual({
      type: 'button',
      text: 'Email',
      action: { kind: 'email', email: 'test@example.com' }
    })
    expect(buttons[3]).toEqual({
      type: 'button',
      text: 'Chat',
      action: { kind: 'chat', chatUrl: 'https://wa.me/123' }
    })
    expect(buttons[4]).toEqual({
      type: 'button',
      text: 'Phone',
      action: {
        kind: 'phone',
        phone: '+1234567890',
        countryCode: 'US',
        contactAction: 'call'
      }
    })
  })

  it('should handle backgroundImage from cover block', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        {
          id: 'card-1',
          typename: 'CardBlock',
          parentBlockId: 'step-1',
          coverBlockId: 'cover-img'
        },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Background Test'
        },
        {
          id: 'cover-img',
          typename: 'ImageBlock',
          parentBlockId: 'card-1',
          src: 'bg.jpg',
          alt: 'background',
          width: 1920,
          height: 1080,
          blurhash: 'LGF5#?xD'
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const card = result.cards[0]
    expect(card.backgroundImage).toEqual({
      src: 'bg.jpg',
      alt: 'background',
      width: 1920,
      height: 1080,
      blurhash: 'LGF5#?xD'
    })
    // Cover block should not appear in content array
    const images = card.content.filter((b) => b.type === 'image')
    expect(images).toHaveLength(0)
  })

  it('should handle backgroundVideo from YouTube cover block', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        {
          id: 'card-1',
          typename: 'CardBlock',
          parentBlockId: 'step-1',
          coverBlockId: 'cover-vid'
        },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Video Background'
        },
        {
          id: 'cover-vid',
          typename: 'VideoBlock',
          parentBlockId: 'card-1',
          source: 'youTube',
          videoId: 'xyz789',
          startAt: 5,
          endAt: 30
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const card = result.cards[0]
    expect(card.backgroundVideo).toEqual({
      url: 'https://youtube.com/watch?v=xyz789',
      startAt: 5,
      endAt: 30
    })
    // Cover block should not appear in content array
    const videos = card.content.filter((b) => b.type === 'video')
    expect(videos).toHaveLength(0)
  })

  it('should handle video content block', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'video-1',
          typename: 'VideoBlock',
          parentBlockId: 'card-1',
          source: 'youTube',
          videoId: 'dQw4w9WgXcQ',
          startAt: 30,
          endAt: 120
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const card = result.cards[0]
    expect(card.content).toHaveLength(1)
    expect(card.content[0]).toEqual({
      type: 'video',
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      startAt: 30,
      endAt: 120
    })
  })

  it('should sort child blocks by parentOrder', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'text-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'body1',
          content: 'Second',
          parentOrder: 1
        },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'First',
          parentOrder: 0
        },
        {
          id: 'button-1',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'Third',
          action: { url: 'https://example.com' },
          parentOrder: 2
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const card = result.cards[0]
    expect(card.content).toHaveLength(3)
    expect(card.content[0]).toEqual({
      type: 'heading',
      text: 'First',
      variant: 'h3'
    })
    expect(card.content[1]).toEqual({
      type: 'text',
      text: 'Second',
      variant: 'body1'
    })
    expect(card.content[2]).toEqual({
      type: 'button',
      text: 'Third',
      action: { kind: 'url', url: 'https://example.com' }
    })
  })

  it('should handle multiselect block', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Preferences',
          parentOrder: 0
        },
        {
          id: 'multi-1',
          typename: 'MultiselectBlock',
          parentBlockId: 'card-1',
          min: 1,
          max: 3,
          parentOrder: 1
        },
        {
          id: 'mopt-1',
          typename: 'MultiselectOptionBlock',
          parentBlockId: 'multi-1',
          label: 'Alpha',
          parentOrder: 0
        },
        {
          id: 'mopt-2',
          typename: 'MultiselectOptionBlock',
          parentBlockId: 'multi-1',
          label: 'Beta',
          parentOrder: 1
        },
        {
          id: 'mopt-3',
          typename: 'MultiselectOptionBlock',
          parentBlockId: 'multi-1',
          label: 'Gamma',
          parentOrder: 2
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const card = result.cards[0]
    const multiselect = card.content.find((b) => b.type === 'multiselect')
    expect(multiselect).toEqual({
      type: 'multiselect',
      min: 1,
      max: 3,
      options: ['Alpha', 'Beta', 'Gamma']
    })
  })

  it('should handle textInput block', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Contact',
          parentOrder: 0
        },
        {
          id: 'input-1',
          typename: 'TextResponseBlock',
          parentBlockId: 'card-1',
          label: 'Your email',
          type: 'email',
          placeholder: 'name@example.com',
          hint: 'We will not share your email',
          required: true,
          parentOrder: 1
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const card = result.cards[0]
    const textInput = card.content.find((b) => b.type === 'textInput')
    expect(textInput).toEqual({
      type: 'textInput',
      label: 'Your email',
      inputType: 'email',
      placeholder: 'name@example.com',
      hint: 'We will not share your email',
      required: true
    })
  })

  it('should handle spacer block', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'Spaced',
          parentOrder: 0
        },
        {
          id: 'spacer-1',
          typename: 'SpacerBlock',
          parentBlockId: 'card-1',
          spacing: 24,
          parentOrder: 1
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const card = result.cards[0]
    const spacer = card.content.find((b) => b.type === 'spacer')
    expect(spacer).toEqual({
      type: 'spacer',
      spacing: 24
    })
  })

  it('should skip non-YouTube video blocks', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock' },
        { id: 'card-1', typename: 'CardBlock', parentBlockId: 'step-1' },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h3',
          content: 'No Video',
          parentOrder: 0
        },
        {
          id: 'video-1',
          typename: 'VideoBlock',
          parentBlockId: 'card-1',
          source: 'internal',
          videoId: 'some-id',
          parentOrder: 1
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const videos = result.cards[0].content.filter((b) => b.type === 'video')
    expect(videos).toHaveLength(0)
  })

  it('should throw error if card block is missing', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [{ id: 'step-1', typename: 'StepBlock' }] as any
    }
    expect(() => simplifyJourney(journey)).toThrow('Card block not found')
  })

  it('should produce Zod-valid output', () => {
    const journey: TestJourney = {
      ...baseJourney,
      blocks: [
        { id: 'step-1', typename: 'StepBlock', nextBlockId: 'step-2' },
        {
          id: 'card-1',
          typename: 'CardBlock',
          parentBlockId: 'step-1',
          backgroundColor: '#1A1A2E',
          coverBlockId: 'cover-1'
        },
        {
          id: 'cover-1',
          typename: 'ImageBlock',
          parentBlockId: 'card-1',
          src: 'bg.jpg',
          alt: 'bg'
        },
        {
          id: 'heading-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'h1',
          content: 'Full Test',
          parentOrder: 0
        },
        {
          id: 'text-1',
          typename: 'TypographyBlock',
          parentBlockId: 'card-1',
          variant: 'body2',
          content: 'Description text',
          parentOrder: 1
        },
        {
          id: 'button-1',
          typename: 'ButtonBlock',
          parentBlockId: 'card-1',
          label: 'Continue',
          action: { blockId: 'step-2' },
          parentOrder: 2
        },
        {
          id: 'poll-1',
          typename: 'RadioQuestionBlock',
          parentBlockId: 'card-1',
          gridView: true,
          parentOrder: 3
        },
        {
          id: 'opt-1',
          typename: 'RadioOptionBlock',
          parentBlockId: 'poll-1',
          label: 'Yes',
          action: { blockId: 'step-2' },
          parentOrder: 0
        },
        {
          id: 'opt-2',
          typename: 'RadioOptionBlock',
          parentBlockId: 'poll-1',
          label: 'No',
          action: { url: 'https://example.com' },
          parentOrder: 1
        },
        { id: 'step-2', typename: 'StepBlock' },
        { id: 'card-2', typename: 'CardBlock', parentBlockId: 'step-2' },
        {
          id: 'heading-2',
          typename: 'TypographyBlock',
          parentBlockId: 'card-2',
          variant: 'h3',
          content: 'End'
        }
      ] as any
    }
    const result = simplifyJourney(journey)
    const parsed = journeySimpleSchema.safeParse(result)
    expect(parsed.success).toBe(true)
    expect(result.cards).toHaveLength(2)
    expect(result.cards[0].backgroundColor).toBe('#1A1A2E')
    expect(result.cards[0].backgroundImage).toBeDefined()
    expect(result.cards[0].defaultNextCard).toBe('card-end')
    // gridView should be present on the poll
    const poll = result.cards[0].content.find((b) => b.type === 'poll')
    expect(poll).toBeDefined()
    if (poll?.type === 'poll') {
      expect(poll.gridView).toBe(true)
    }
  })
})
