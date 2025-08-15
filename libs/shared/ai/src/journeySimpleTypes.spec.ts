import {
  journeySimpleButtonSchema,
  journeySimpleButtonSchemaUpdate,
  journeySimpleCardSchema,
  journeySimpleCardSchemaUpdate,
  journeySimplePollOptionSchema,
  journeySimplePollOptionSchemaUpdate,
  journeySimpleVideoSchema,
  journeySimpleVideoSchemaUpdate
} from './journeySimpleTypes'

// journeySimplePollOptionSchema tests

describe('journeySimplePollOptionSchema (base, permissive)', () => {
  it('validates with only nextCard', () => {
    expect(
      journeySimplePollOptionSchema.safeParse({ text: 'A', nextCard: 'card-1' })
        .success
    ).toBe(true)
  })

  it('validates with only url', () => {
    expect(
      journeySimplePollOptionSchema.safeParse({
        text: 'A',
        url: 'https://a.com'
      }).success
    ).toBe(true)
  })

  it('validates with both nextCard and url (permissive)', () => {
    expect(
      journeySimplePollOptionSchema.safeParse({
        text: 'A',
        nextCard: 'card-1',
        url: 'https://a.com'
      }).success
    ).toBe(true)
  })

  it('validates with neither nextCard nor url (permissive)', () => {
    expect(journeySimplePollOptionSchema.safeParse({ text: 'A' }).success).toBe(
      true
    )
  })
})

describe('journeySimplePollOptionSchemaUpdate (strict)', () => {
  it('validates with only nextCard', () => {
    expect(
      journeySimplePollOptionSchemaUpdate.safeParse({
        text: 'A',
        nextCard: 'card-1'
      }).success
    ).toBe(true)
  })

  it('validates with only url', () => {
    expect(
      journeySimplePollOptionSchemaUpdate.safeParse({
        text: 'A',
        url: 'https://a.com'
      }).success
    ).toBe(true)
  })

  it('fails with both nextCard and url (strict)', () => {
    const result = journeySimplePollOptionSchemaUpdate.safeParse({
      text: 'A',
      nextCard: 'card-1',
      url: 'https://a.com'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Exactly one/)
    }
  })

  it('fails with neither nextCard nor url (strict)', () => {
    const result = journeySimplePollOptionSchemaUpdate.safeParse({ text: 'A' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Exactly one/)
    }
  })
})

// journeySimpleButtonSchema tests

describe('journeySimpleButtonSchema (base, permissive)', () => {
  it('validates with only nextCard', () => {
    expect(
      journeySimpleButtonSchema.safeParse({ text: 'B', nextCard: 'card-2' })
        .success
    ).toBe(true)
  })

  it('validates with only url', () => {
    expect(
      journeySimpleButtonSchema.safeParse({ text: 'B', url: 'https://b.com' })
        .success
    ).toBe(true)
  })

  it('validates with both nextCard and url (permissive)', () => {
    expect(
      journeySimpleButtonSchema.safeParse({
        text: 'B',
        nextCard: 'card-2',
        url: 'https://b.com'
      }).success
    ).toBe(true)
  })

  it('validates with neither nextCard nor url (permissive)', () => {
    expect(journeySimpleButtonSchema.safeParse({ text: 'B' }).success).toBe(
      true
    )
  })
})

describe('journeySimpleButtonSchemaUpdate (strict)', () => {
  it('validates with only nextCard', () => {
    expect(
      journeySimpleButtonSchemaUpdate.safeParse({
        text: 'B',
        nextCard: 'card-2'
      }).success
    ).toBe(true)
  })

  it('validates with only url', () => {
    expect(
      journeySimpleButtonSchemaUpdate.safeParse({
        text: 'B',
        url: 'https://b.com'
      }).success
    ).toBe(true)
  })

  it('fails with both nextCard and url (strict)', () => {
    const result = journeySimpleButtonSchemaUpdate.safeParse({
      text: 'B',
      nextCard: 'card-2',
      url: 'https://b.com'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Exactly one/)
    }
  })

  it('fails with neither nextCard nor url (strict)', () => {
    const result = journeySimpleButtonSchemaUpdate.safeParse({ text: 'B' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Exactly one/)
    }
  })
})

// journeySimpleVideoSchema tests

describe('journeySimpleVideoSchema (base, permissive)', () => {
  it('validates with only src and source', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube'
      }).success
    ).toBe(true)
  })

  it('validates with src, source and startAt', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        startAt: 30
      }).success
    ).toBe(true)
  })

  it('validates with src, source and endAt', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        endAt: 120
      }).success
    ).toBe(true)
  })

  it('validates with src, source, startAt, and endAt', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        startAt: 30,
        endAt: 120
      }).success
    ).toBe(true)
  })

  it('validates with endAt <= startAt (permissive)', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        startAt: 120,
        endAt: 30
      }).success
    ).toBe(true)
  })

  it('validates with startAt = 0', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        startAt: 0
      }).success
    ).toBe(true)
  })

  it('fails with negative startAt', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        startAt: -10
      }).success
    ).toBe(false)
  })

  it('fails with zero endAt', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        endAt: 0
      }).success
    ).toBe(false)
  })

  it('validates with summary field', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        summary: 'This video covers the basics of TypeScript'
      }).success
    ).toBe(true)
  })

  it('validates with questions field', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        questions: ['What did you learn?', 'How will you apply this?']
      }).success
    ).toBe(true)
  })

  it('validates with both summary and questions', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        summary: 'This video covers the basics of TypeScript',
        questions: ['What did you learn?', 'How will you apply this?']
      }).success
    ).toBe(true)
  })

  it('validates with internal source', () => {
    expect(
      journeySimpleVideoSchema.safeParse({
        src: 'video-123',
        source: 'internal'
      }).success
    ).toBe(true)
  })
})

describe('journeySimpleVideoSchemaUpdate (strict)', () => {
  it('validates with only src and source', () => {
    expect(
      journeySimpleVideoSchemaUpdate.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube'
      }).success
    ).toBe(true)
  })

  it('validates with src, source and startAt', () => {
    expect(
      journeySimpleVideoSchemaUpdate.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        startAt: 30
      }).success
    ).toBe(true)
  })

  it('validates with src, source and endAt', () => {
    expect(
      journeySimpleVideoSchemaUpdate.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        endAt: 120
      }).success
    ).toBe(true)
  })

  it('validates with valid time range (endAt > startAt)', () => {
    expect(
      journeySimpleVideoSchemaUpdate.safeParse({
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        startAt: 30,
        endAt: 120
      }).success
    ).toBe(true)
  })

  it('fails with endAt <= startAt (strict)', () => {
    const result = journeySimpleVideoSchemaUpdate.safeParse({
      src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      source: 'youTube',
      startAt: 120,
      endAt: 30
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /endAt must be greater than startAt/
      )
    }
  })

  it('fails with endAt = startAt (strict)', () => {
    const result = journeySimpleVideoSchemaUpdate.safeParse({
      src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      source: 'youTube',
      startAt: 60,
      endAt: 60
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /endAt must be greater than startAt/
      )
    }
  })
})

// journeySimpleCardSchema tests

describe('journeySimpleCardSchema (base, permissive)', () => {
  const base = { id: 'card-1', x: 0, y: 0 }

  it('validates with button', () => {
    expect(
      journeySimpleCardSchema.safeParse({
        ...base,
        button: { text: 'B', nextCard: 'card-2' }
      }).success
    ).toBe(true)
  })

  it('validates with poll', () => {
    expect(
      journeySimpleCardSchema.safeParse({
        ...base,
        poll: [{ text: 'A', nextCard: 'card-2' }]
      }).success
    ).toBe(true)
  })

  it('validates with defaultNextCard', () => {
    expect(
      journeySimpleCardSchema.safeParse({ ...base, defaultNextCard: 'card-2' })
        .success
    ).toBe(true)
  })

  it('validates with video', () => {
    expect(
      journeySimpleCardSchema.safeParse({
        ...base,
        video: {
          src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          source: 'youTube'
        },
        defaultNextCard: 'card-2'
      }).success
    ).toBe(true)
  })

  it('validates with video and other content (permissive)', () => {
    expect(
      journeySimpleCardSchema.safeParse({
        ...base,
        video: {
          src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          source: 'youTube'
        },
        heading: 'Test',
        text: 'Content',
        defaultNextCard: 'card-2'
      }).success
    ).toBe(true)
  })

  it('validates with video but no defaultNextCard (permissive)', () => {
    expect(
      journeySimpleCardSchema.safeParse({
        ...base,
        video: {
          src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          source: 'youTube'
        }
      }).success
    ).toBe(true)
  })

  it('validates with none of button, poll, defaultNextCard (permissive)', () => {
    const result = journeySimpleCardSchema.safeParse(base)
    expect(result.success).toBe(true)
  })
})

describe('journeySimpleCardSchemaUpdate (strict)', () => {
  const base = { id: 'card-1', x: 0, y: 0 }

  it('validates with button', () => {
    expect(
      journeySimpleCardSchemaUpdate.safeParse({
        ...base,
        button: { text: 'B', nextCard: 'card-2' }
      }).success
    ).toBe(true)
  })

  it('validates with poll', () => {
    expect(
      journeySimpleCardSchemaUpdate.safeParse({
        ...base,
        poll: [{ text: 'A', nextCard: 'card-2' }]
      }).success
    ).toBe(true)
  })

  it('validates with defaultNextCard', () => {
    expect(
      journeySimpleCardSchemaUpdate.safeParse({
        ...base,
        defaultNextCard: 'card-2'
      }).success
    ).toBe(true)
  })

  it('validates with video and defaultNextCard (strict)', () => {
    expect(
      journeySimpleCardSchemaUpdate.safeParse({
        ...base,
        video: {
          src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          source: 'youTube'
        },
        defaultNextCard: 'card-2'
      }).success
    ).toBe(true)
  })

  it('fails with video and other content fields (strict)', () => {
    const result = journeySimpleCardSchemaUpdate.safeParse({
      ...base,
      video: {
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube'
      },
      heading: 'Test',
      defaultNextCard: 'card-2'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /If video is present, heading must not be set/
      )
    }
  })

  it('fails with video and button (strict)', () => {
    const result = journeySimpleCardSchemaUpdate.safeParse({
      ...base,
      video: {
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube'
      },
      button: { text: 'B', nextCard: 'card-2' },
      defaultNextCard: 'card-2'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /If video is present, button must not be set/
      )
    }
  })

  it('fails with video and poll (strict)', () => {
    const result = journeySimpleCardSchemaUpdate.safeParse({
      ...base,
      video: {
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube'
      },
      poll: [{ text: 'A', nextCard: 'card-2' }],
      defaultNextCard: 'card-2'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /If video is present, poll must not be set/
      )
    }
  })

  it('fails with video and image (strict)', () => {
    const result = journeySimpleCardSchemaUpdate.safeParse({
      ...base,
      video: {
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube'
      },
      image: {
        src: 'test.jpg',
        alt: 'Test',
        width: 100,
        height: 100,
        blurhash: 'test'
      },
      defaultNextCard: 'card-2'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /If video is present, image must not be set/
      )
    }
  })

  it('fails with video but no defaultNextCard (strict)', () => {
    const result = journeySimpleCardSchemaUpdate.safeParse({
      ...base,
      video: {
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube'
      }
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /If video is present, defaultNextCard is required/
      )
    }
  })

  it('fails with none of button, poll, defaultNextCard (strict)', () => {
    const result = journeySimpleCardSchemaUpdate.safeParse(base)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/At least one/)
    }
  })

  it('fails with invalid button (both nextCard and url, strict)', () => {
    const result = journeySimpleCardSchemaUpdate.safeParse({
      ...base,
      button: { text: 'B', nextCard: 'card-2', url: 'https://b.com' }
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => /Exactly one/.test(issue.message))
      ).toBe(true)
    }
  })

  it('fails with invalid poll option (neither nextCard nor url, strict)', () => {
    const result = journeySimpleCardSchemaUpdate.safeParse({
      ...base,
      poll: [{ text: 'A' }]
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => /Exactly one/.test(issue.message))
      ).toBe(true)
    }
  })

  it('fails with invalid video timing (endAt <= startAt, strict)', () => {
    const result = journeySimpleCardSchemaUpdate.safeParse({
      ...base,
      video: {
        src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        source: 'youTube',
        startAt: 120,
        endAt: 30
      },
      defaultNextCard: 'card-2'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /endAt must be greater than startAt/
      )
    }
  })
})
