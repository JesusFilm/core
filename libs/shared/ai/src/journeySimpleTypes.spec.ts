import {
  journeySimpleActionSchema,
  journeySimpleBlockSchema,
  journeySimpleCardSchema,
  journeySimpleSchemaUpdate
} from './journeySimpleTypes'

describe('journeySimpleActionSchema', () => {
  it('should validate navigate action', () => {
    const result = journeySimpleActionSchema.safeParse({
      kind: 'navigate',
      cardId: 'card-welcome'
    })
    expect(result.success).toBe(true)
  })

  it('should validate url action', () => {
    const result = journeySimpleActionSchema.safeParse({
      kind: 'url',
      url: 'https://example.com'
    })
    expect(result.success).toBe(true)
  })

  it('should validate email action', () => {
    const result = journeySimpleActionSchema.safeParse({
      kind: 'email',
      email: 'user@example.com'
    })
    expect(result.success).toBe(true)
  })

  it('should validate chat action', () => {
    const result = journeySimpleActionSchema.safeParse({
      kind: 'chat',
      chatUrl: 'https://wa.me/1234567890'
    })
    expect(result.success).toBe(true)
  })

  it('should validate phone action with all fields', () => {
    const result = journeySimpleActionSchema.safeParse({
      kind: 'phone',
      phone: '+1234567890',
      countryCode: 'US',
      contactAction: 'call'
    })
    expect(result.success).toBe(true)
  })

  it('should validate phone action with minimal fields', () => {
    const result = journeySimpleActionSchema.safeParse({
      kind: 'phone',
      phone: '+1234567890'
    })
    expect(result.success).toBe(true)
  })

  it('should reject url action with javascript: scheme', () => {
    const result = journeySimpleActionSchema.safeParse({
      kind: 'url',
      url: 'javascript:alert(1)'
    })
    expect(result.success).toBe(false)
  })

  it('should reject chat action with data: scheme', () => {
    const result = journeySimpleActionSchema.safeParse({
      kind: 'chat',
      chatUrl: 'data:text/html,<script>alert(1)</script>'
    })
    expect(result.success).toBe(false)
  })
})

describe('journeySimpleBlockSchema', () => {
  it('should validate heading block with default variant', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'heading',
      text: 'Welcome'
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('heading')
      if (result.data.type === 'heading') {
        expect(result.data.variant).toBe('h3')
      }
    }
  })

  it('should validate heading block with explicit variant', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'heading',
      text: 'Welcome',
      variant: 'h1'
    })
    expect(result.success).toBe(true)
    if (result.success && result.data.type === 'heading') {
      expect(result.data.variant).toBe('h1')
    }
  })

  it('should validate text block with all variants', () => {
    const variants = [
      'body1',
      'body2',
      'subtitle1',
      'subtitle2',
      'caption',
      'overline'
    ] as const
    for (const variant of variants) {
      const result = journeySimpleBlockSchema.safeParse({
        type: 'text',
        text: 'Some text',
        variant
      })
      expect(result.success).toBe(true)
    }
  })

  it('should validate button block with navigate action', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'button',
      text: 'Next',
      action: { kind: 'navigate', cardId: 'card-results' }
    })
    expect(result.success).toBe(true)
  })

  it('should validate button block with url action', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'button',
      text: 'Visit',
      action: { kind: 'url', url: 'https://example.com' }
    })
    expect(result.success).toBe(true)
  })

  it('should validate image block with optional fields omitted', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'image',
      src: 'https://example.com/photo.jpg',
      alt: 'A photo'
    })
    expect(result.success).toBe(true)
  })

  it('should validate image block with all fields', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'image',
      src: 'https://example.com/photo.jpg',
      alt: 'A photo',
      width: 800,
      height: 600,
      blurhash: 'LEHV6nWB2yk8'
    })
    expect(result.success).toBe(true)
  })

  it('should validate video block', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'video',
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      startAt: 10,
      endAt: 60
    })
    expect(result.success).toBe(true)
  })

  it('should validate poll block with 2+ options', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'poll',
      options: [
        { text: 'Option A', action: { kind: 'navigate', cardId: 'card-a' } },
        { text: 'Option B', action: { kind: 'navigate', cardId: 'card-b' } }
      ]
    })
    expect(result.success).toBe(true)
  })

  it('should reject poll block with <2 options', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'poll',
      options: [
        { text: 'Only one', action: { kind: 'navigate', cardId: 'card-a' } }
      ]
    })
    expect(result.success).toBe(false)
  })

  it('should validate multiselect block', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'multiselect',
      min: 1,
      max: 3,
      options: ['Red', 'Green', 'Blue']
    })
    expect(result.success).toBe(true)
  })

  it('should reject multiselect block with <2 options', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'multiselect',
      options: ['Only one']
    })
    expect(result.success).toBe(false)
  })

  it('should validate textInput block with all fields', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'textInput',
      label: 'Your name',
      inputType: 'name',
      placeholder: 'Enter name',
      hint: 'First and last name',
      required: true
    })
    expect(result.success).toBe(true)
  })

  it('should validate textInput block with defaults', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'textInput',
      label: 'Comment'
    })
    expect(result.success).toBe(true)
    if (result.success && result.data.type === 'textInput') {
      expect(result.data.inputType).toBe('freeForm')
      expect(result.data.required).toBe(false)
    }
  })

  it('should validate spacer block', () => {
    const result = journeySimpleBlockSchema.safeParse({
      type: 'spacer',
      spacing: 24
    })
    expect(result.success).toBe(true)
  })
})

describe('journeySimpleCardSchema', () => {
  it('should validate card with content array', () => {
    const result = journeySimpleCardSchema.safeParse({
      id: 'card-welcome',
      content: [
        { type: 'heading', text: 'Welcome' },
        { type: 'text', text: 'Hello world' }
      ]
    })
    expect(result.success).toBe(true)
  })

  it('should validate card with optional x/y omitted', () => {
    const result = journeySimpleCardSchema.safeParse({
      id: 'card-welcome',
      content: [{ type: 'heading', text: 'Welcome' }]
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.x).toBeUndefined()
      expect(result.data.y).toBeUndefined()
    }
  })

  it('should validate card with backgroundColor', () => {
    const result = journeySimpleCardSchema.safeParse({
      id: 'card-dark',
      backgroundColor: '#1A1A2E',
      content: [{ type: 'heading', text: 'Dark card' }]
    })
    expect(result.success).toBe(true)
  })

  it('should validate card with backgroundImage', () => {
    const result = journeySimpleCardSchema.safeParse({
      id: 'card-hero',
      backgroundImage: {
        src: 'https://example.com/bg.jpg',
        alt: 'Background'
      },
      content: [{ type: 'heading', text: 'Hero' }]
    })
    expect(result.success).toBe(true)
  })

  it('should validate card with backgroundVideo', () => {
    const result = journeySimpleCardSchema.safeParse({
      id: 'card-video-bg',
      backgroundVideo: {
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        startAt: 0,
        endAt: 30
      },
      content: [{ type: 'heading', text: 'Video BG' }]
    })
    expect(result.success).toBe(true)
  })
})

describe('journeySimpleSchemaUpdate', () => {
  const makeJourney = (
    cards: Array<{
      id: string
      content: unknown[]
      defaultNextCard?: string
      backgroundImage?: unknown
      backgroundVideo?: unknown
    }>
  ) => ({
    title: 'Test Journey',
    description: 'A test journey',
    cards
  })

  it('should validate valid journey with cross-card references', () => {
    const result = journeySimpleSchemaUpdate.safeParse(
      makeJourney([
        {
          id: 'card-welcome',
          content: [
            {
              type: 'button',
              text: 'Go',
              action: { kind: 'navigate', cardId: 'card-results' }
            }
          ],
          defaultNextCard: 'card-results'
        },
        {
          id: 'card-results',
          content: [{ type: 'heading', text: 'Results' }]
        }
      ])
    )
    expect(result.success).toBe(true)
  })

  it('should reject invalid card reference in defaultNextCard', () => {
    const result = journeySimpleSchemaUpdate.safeParse(
      makeJourney([
        {
          id: 'card-welcome',
          content: [{ type: 'heading', text: 'Hi' }],
          defaultNextCard: 'card-nonexistent'
        }
      ])
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) =>
          i.message.includes('"card-nonexistent" does not exist')
        )
      ).toBe(true)
    }
  })

  it('should reject invalid card reference in button navigate action', () => {
    const result = journeySimpleSchemaUpdate.safeParse(
      makeJourney([
        {
          id: 'card-welcome',
          content: [
            {
              type: 'button',
              text: 'Go',
              action: { kind: 'navigate', cardId: 'card-missing' }
            }
          ]
        }
      ])
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) =>
          i.message.includes('"card-missing" does not exist')
        )
      ).toBe(true)
    }
  })

  it('should reject invalid card reference in poll option navigate action', () => {
    const result = journeySimpleSchemaUpdate.safeParse(
      makeJourney([
        {
          id: 'card-welcome',
          content: [
            {
              type: 'poll',
              options: [
                {
                  text: 'A',
                  action: { kind: 'navigate', cardId: 'card-gone' }
                },
                {
                  text: 'B',
                  action: { kind: 'navigate', cardId: 'card-welcome' }
                }
              ]
            }
          ]
        }
      ])
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) =>
          i.message.includes('"card-gone" does not exist')
        )
      ).toBe(true)
    }
  })

  it('should reject video content with other content blocks', () => {
    const result = journeySimpleSchemaUpdate.safeParse(
      makeJourney([
        {
          id: 'card-video',
          content: [
            { type: 'video', url: 'https://youtube.com/watch?v=abc' },
            { type: 'heading', text: 'Extra' }
          ]
        }
      ])
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) =>
          i.message.includes('Video content must be the only content block')
        )
      ).toBe(true)
    }
  })

  it('should reject video content with backgroundImage', () => {
    const result = journeySimpleSchemaUpdate.safeParse(
      makeJourney([
        {
          id: 'card-video',
          content: [
            { type: 'video', url: 'https://youtube.com/watch?v=abc' }
          ],
          backgroundImage: {
            src: 'https://example.com/bg.jpg',
            alt: 'Background'
          }
        }
      ])
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) =>
          i.message.includes(
            'Video content cards cannot have background image or background video'
          )
        )
      ).toBe(true)
    }
  })

  it('should reject backgroundImage with backgroundVideo on same card', () => {
    const result = journeySimpleSchemaUpdate.safeParse(
      makeJourney([
        {
          id: 'card-both',
          content: [{ type: 'heading', text: 'Hi' }],
          backgroundImage: {
            src: 'https://example.com/bg.jpg',
            alt: 'Background'
          },
          backgroundVideo: {
            url: 'https://youtube.com/watch?v=abc'
          }
        }
      ])
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) =>
          i.message.includes(
            'Card cannot have both backgroundImage and backgroundVideo'
          )
        )
      ).toBe(true)
    }
  })

  it('should provide helpful error message with valid card IDs listed', () => {
    const result = journeySimpleSchemaUpdate.safeParse(
      makeJourney([
        {
          id: 'card-alpha',
          content: [{ type: 'heading', text: 'A' }],
          defaultNextCard: 'card-nonexistent'
        },
        {
          id: 'card-beta',
          content: [{ type: 'heading', text: 'B' }]
        }
      ])
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.message.includes('"card-nonexistent" does not exist')
      )
      expect(issue).toBeDefined()
      expect(issue?.message).toContain('card-alpha')
      expect(issue?.message).toContain('card-beta')
    }
  })
})
