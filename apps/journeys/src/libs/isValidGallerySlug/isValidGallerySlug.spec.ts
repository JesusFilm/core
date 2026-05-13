import { isValidGallerySlug } from './isValidGallerySlug'

describe('isValidGallerySlug', () => {
  it.each([
    ['easter-2026', true],
    ['easter', true],
    ['a', true],
    ['1', true],
    ['easter-2026-bonus', true],
    ['abc-1-def', true],
    [`${'a'.repeat(200)}`, true]
  ])('accepts %j', (slug, expected) => {
    expect(isValidGallerySlug(slug)).toBe(expected)
  })

  it.each([
    ['', false],
    ['Easter', false],
    ['easter_2026', false],
    ['easter--2026', false],
    ['-easter', false],
    ['easter-', false],
    ['easter 2026', false],
    ['easter/2026', false],
    [`${'a'.repeat(201)}`, false]
  ])('rejects %j', (slug, expected) => {
    expect(isValidGallerySlug(slug)).toBe(expected)
  })
})
