import { describe, expect, it } from 'vitest'

import {
  journeySimpleButtonSchema,
  journeySimpleCardSchema,
  journeySimplePollOptionSchema
} from './journeySimpleTypes'

// journeySimplePollOptionSchema tests

describe('journeySimplePollOptionSchema', () => {
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

  it('fails with both nextCard and url', () => {
    const result = journeySimplePollOptionSchema.safeParse({
      text: 'A',
      nextCard: 'card-1',
      url: 'https://a.com'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Exactly one/)
    }
  })

  it('fails with neither nextCard nor url', () => {
    const result = journeySimplePollOptionSchema.safeParse({ text: 'A' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Exactly one/)
    }
  })
})

// journeySimpleButtonSchema tests

describe('journeySimpleButtonSchema', () => {
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

  it('fails with both nextCard and url', () => {
    const result = journeySimpleButtonSchema.safeParse({
      text: 'B',
      nextCard: 'card-2',
      url: 'https://b.com'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Exactly one/)
    }
  })

  it('fails with neither nextCard nor url', () => {
    const result = journeySimpleButtonSchema.safeParse({ text: 'B' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Exactly one/)
    }
  })
})

// journeySimpleCardSchema tests

describe('journeySimpleCardSchema', () => {
  const base = { id: 'card-1' }

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

  it('fails with none of button, poll, defaultNextCard', () => {
    const result = journeySimpleCardSchema.safeParse(base)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/At least one/)
    }
  })
})
