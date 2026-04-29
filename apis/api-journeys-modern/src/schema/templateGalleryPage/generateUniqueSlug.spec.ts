import { prismaMock } from '../../../test/prismaMock'

import {
  RESERVED_SLUGS,
  SlugInvalidError,
  SlugReservedError,
  SlugTakenError,
  generateUniqueSlug,
  validateUserSuppliedSlug
} from './generateUniqueSlug'

describe('generateUniqueSlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the slugified base when no collisions exist', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    const slug = await generateUniqueSlug('My Welcome Page')
    expect(slug).toBe('my-welcome-page')
  })

  it('returns the next numeric suffix when base is taken', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([
      { id: 'a', slug: 'welcome' },
      { id: 'b', slug: 'welcome-2' }
    ] as any)
    const slug = await generateUniqueSlug('Welcome')
    expect(slug).toBe('welcome-3')
  })

  it('ignores excludeId when checking collisions (used during update)', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([
      { id: 'self', slug: 'welcome' }
    ] as any)
    const slug = await generateUniqueSlug('Welcome', 'self')
    expect(slug).toBe('welcome')
  })

  it('falls back to nanoid suffix when 50 collisions exhaust', async () => {
    const collisions = [
      { id: 'base', slug: 'welcome' },
      ...Array.from({ length: 49 }, (_, i) => ({
        id: `c${i}`,
        slug: `welcome-${i + 2}`
      }))
    ]
    prismaMock.templateGalleryPage.findMany.mockResolvedValue(collisions as any)
    const slug = await generateUniqueSlug('Welcome')
    expect(slug).toMatch(/^welcome-[a-z0-9]{6}$/)
  })

  it('throws SlugReservedError when title is empty after slugify', async () => {
    await expect(generateUniqueSlug('!!!')).rejects.toThrow(SlugReservedError)
  })

  it('throws SlugReservedError when base collides with a reserved slug', async () => {
    await expect(generateUniqueSlug('Admin')).rejects.toThrow(SlugReservedError)
  })

  it('normalizes Cyrillic homographs to their Latin equivalents (defeats homograph squatting)', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    // Cyrillic 'е' (U+0435) is mapped to Latin 'e' by slugify, so the
    // homograph and the legitimate string collide on the same slug — anyone
    // already holding "google-com" wins, and the lookalike attempt resolves
    // identically rather than minting a separate slug.
    const slug = await generateUniqueSlug('googlе com')
    expect(slug).toBe('google-com')
  })

  it('rejects strings that slugify to empty (e.g. pure punctuation/symbols)', async () => {
    await expect(generateUniqueSlug('!!! ???')).rejects.toThrow(
      SlugReservedError
    )
  })
})

describe('validateUserSuppliedSlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the normalized slug when valid and unique', async () => {
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue(null)
    const slug = await validateUserSuppliedSlug('My-New-Slug', 'self')
    expect(slug).toBe('my-new-slug')
  })

  it('rejects malformed slugs', async () => {
    await expect(validateUserSuppliedSlug('   ', 'self')).rejects.toThrow(
      SlugInvalidError
    )
  })

  it('rejects reserved slugs', async () => {
    await expect(validateUserSuppliedSlug('admin', 'self')).rejects.toThrow(
      SlugReservedError
    )
  })

  it('rejects taken slugs (excluding self)', async () => {
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue({
      id: 'other'
    } as any)
    await expect(
      validateUserSuppliedSlug('taken-slug', 'self')
    ).rejects.toThrow(SlugTakenError)
  })

  it('rejects slugs longer than 200 chars', async () => {
    const long = 'a'.repeat(201)
    await expect(validateUserSuppliedSlug(long, 'self')).rejects.toThrow(
      SlugInvalidError
    )
  })
})

describe('RESERVED_SLUGS', () => {
  it('contains expected entries', () => {
    expect(RESERVED_SLUGS.has('admin')).toBe(true)
    expect(RESERVED_SLUGS.has('templates')).toBe(true)
    expect(RESERVED_SLUGS.has('graphql')).toBe(true)
  })
})
