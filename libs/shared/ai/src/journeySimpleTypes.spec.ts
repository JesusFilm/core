import {
  journeySimpleButtonSchema,
  journeySimpleButtonSchemaUpdate,
  journeySimpleCardSchema,
  journeySimpleCardSchemaUpdate,
  journeySimplePollOptionSchema,
  journeySimplePollOptionSchemaUpdate
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
})
