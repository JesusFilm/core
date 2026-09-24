import { vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'
import {
  SlugInvalidError,
  SlugReservedError,
  SlugTakenError
} from '../templateGalleryPage/generateUniqueSlug'

import {
  generateUniqueCampaignSlug,
  validateUserSuppliedCampaignSlug
} from './campaignSlug'

describe('generateUniqueCampaignSlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the slugified base when no collisions exist', async () => {
    prismaMock.campaign.findMany.mockResolvedValue([])
    await expect(generateUniqueCampaignSlug('World Cup 2026')).resolves.toBe(
      'world-cup-2026'
    )
    expect(prismaMock.campaign.findMany).toHaveBeenCalledWith({
      where: { slug: { startsWith: 'world-cup-2026' } },
      select: { id: true, slug: true }
    })
  })

  it('returns the next numeric suffix when base is taken', async () => {
    prismaMock.campaign.findMany.mockResolvedValue([
      { id: 'a', slug: 'football' },
      { id: 'b', slug: 'football-2' }
    ] as any)
    await expect(generateUniqueCampaignSlug('Football')).resolves.toBe(
      'football-3'
    )
  })

  it('ignores excludeId when checking collisions', async () => {
    prismaMock.campaign.findMany.mockResolvedValue([
      { id: 'self', slug: 'football' }
    ] as any)
    await expect(generateUniqueCampaignSlug('Football', 'self')).resolves.toBe(
      'football'
    )
  })

  it('falls back to a random suffix when 50 collisions exhaust', async () => {
    prismaMock.campaign.findMany.mockResolvedValue([
      { id: 'base', slug: 'football' },
      ...Array.from({ length: 49 }, (_, i) => ({
        id: `c${i}`,
        slug: `football-${i + 2}`
      }))
    ] as any)
    await expect(generateUniqueCampaignSlug('Football')).resolves.toMatch(
      /^football-[a-z0-9]{6}$/
    )
  })

  it('throws SlugReservedError for an empty or reserved title', async () => {
    await expect(generateUniqueCampaignSlug('!!!')).rejects.toThrow(
      SlugReservedError
    )
    await expect(generateUniqueCampaignSlug('Campaign')).rejects.toThrow(
      SlugReservedError
    )
    expect(prismaMock.campaign.findMany).not.toHaveBeenCalled()
  })

  it('truncates long titles to 200 characters', async () => {
    prismaMock.campaign.findMany.mockResolvedValue([])
    const slug = await generateUniqueCampaignSlug('a'.repeat(250))
    expect(slug).toHaveLength(200)
  })
})

describe('validateUserSuppliedCampaignSlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes and returns a valid, unused slug', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(null)
    await expect(
      validateUserSuppliedCampaignSlug('  Euro Cup ', 'c1')
    ).resolves.toBe('euro-cup')
    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith({
      where: { slug: 'euro-cup', NOT: { id: 'c1' } },
      select: { id: true }
    })
  })

  it('throws SlugInvalidError when the slug exceeds the max length', async () => {
    await expect(
      validateUserSuppliedCampaignSlug('a'.repeat(201), 'c1')
    ).rejects.toThrow(SlugInvalidError)
  })

  it('throws SlugReservedError for a reserved slug', async () => {
    await expect(
      validateUserSuppliedCampaignSlug('campaigns', 'c1')
    ).rejects.toThrow(SlugReservedError)
  })

  it('throws SlugTakenError when another campaign owns the slug', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({ id: 'other' } as any)
    await expect(
      validateUserSuppliedCampaignSlug('taken', 'c1')
    ).rejects.toThrow(SlugTakenError)
  })
})
