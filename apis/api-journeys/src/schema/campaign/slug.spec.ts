import { prismaMock } from '../../../test/prismaMock'

import {
  REGION_RESERVED_SLUGS,
  RESERVED_SLUGS,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  generateUniqueCampaignSlug,
  generateUniqueRegionSlug,
  validateCampaignSlug,
  validateRegionSlug
} from './slug'

async function expectBadUserInputAsync(
  promise: Promise<unknown>,
  field: string
): Promise<void> {
  await expect(promise).rejects.toMatchObject({
    extensions: { code: 'BAD_USER_INPUT', field }
  })
}

describe('slug', () => {
  describe('campaign slug', () => {
    beforeEach(() => {
      prismaMock.campaign.findMany.mockResolvedValue([])
      prismaMock.campaign.findFirst.mockResolvedValue(null)
    })

    it('generates the slug from the title with slugify lower strict', async () => {
      await expect(generateUniqueCampaignSlug('Outreach 2026!')).resolves.toBe(
        'outreach-2026'
      )
      expect(prismaMock.campaign.findMany).toHaveBeenCalledWith({
        where: { slug: { startsWith: 'outreach-2026' } },
        select: { slug: true }
      })
    })

    it('appends -2…-50 on collision', async () => {
      prismaMock.campaign.findMany.mockResolvedValue([
        { slug: 'outreach' },
        { slug: 'outreach-2' }
      ] as any)
      await expect(generateUniqueCampaignSlug('Outreach')).resolves.toBe(
        'outreach-3'
      )
    })

    it('falls back to a nanoid suffix once base-2…base-50 are taken', async () => {
      prismaMock.campaign.findMany.mockResolvedValue([
        { slug: 'outreach' },
        ...Array.from({ length: 49 }, (_, i) => ({
          slug: `outreach-${i + 2}`
        }))
      ] as any)
      const slug = await generateUniqueCampaignSlug('Outreach')
      expect(slug).toMatch(/^outreach-[a-z0-9]{6}$/)
      expect(SLUG_PATTERN.test(slug)).toBe(true)
    })

    it('uses the gallery SLUG_PATTERN and SLUG_MAX_LENGTH of 200', async () => {
      expect(SLUG_MAX_LENGTH).toBe(200)
      expect(SLUG_PATTERN.test('eur-2026')).toBe(true)
      expect(SLUG_PATTERN.test('EUR')).toBe(false)
      const slug = await generateUniqueCampaignSlug('a'.repeat(250))
      expect(slug).toHaveLength(200)
      await expectBadUserInputAsync(
        validateCampaignSlug('b'.repeat(201), 'campaignId'),
        'slug'
      )
    })

    it('RESERVED_SLUGS applies and now contains campaign and campaigns', async () => {
      expect(RESERVED_SLUGS.has('campaign')).toBe(true)
      expect(RESERVED_SLUGS.has('campaigns')).toBe(true)
      await expectBadUserInputAsync(
        generateUniqueCampaignSlug('Campaign'),
        'slug'
      )
      await expectBadUserInputAsync(
        generateUniqueCampaignSlug('campaigns'),
        'slug'
      )
      await expectBadUserInputAsync(
        validateCampaignSlug('admin', 'campaignId'),
        'slug'
      )
    })

    it('is author-editable through the gallery author-slug validation', async () => {
      await expect(
        validateCampaignSlug(' Outreach 2026 ', 'campaignId')
      ).resolves.toBe('outreach-2026')
      expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith({
        where: { slug: 'outreach-2026', NOT: { id: 'campaignId' } },
        select: { id: true }
      })
      await expectBadUserInputAsync(
        validateCampaignSlug('!!!', 'campaignId'),
        'slug'
      )
    })

    it('keeps slug collisions as BAD_USER_INPUT, field slug', async () => {
      prismaMock.campaign.findFirst.mockResolvedValue({ id: 'other' } as any)
      await expectBadUserInputAsync(
        validateCampaignSlug('outreach', 'campaignId'),
        'slug'
      )
    })
  })

  describe('region slug', () => {
    beforeEach(() => {
      prismaMock.campaignRegion.findMany.mockResolvedValue([])
      prismaMock.journey.findMany.mockResolvedValue([])
      prismaMock.campaignRegion.findFirst.mockResolvedValue(null)
    })

    const campaign = { id: 'campaignId', teamId: 'teamId' }

    it('generates the slug from the name, unique per campaign', async () => {
      prismaMock.campaignRegion.findMany.mockResolvedValue([
        { slug: 'eur' }
      ] as any)
      await expect(generateUniqueRegionSlug(campaign, 'EUR')).resolves.toBe(
        'eur-2'
      )
      expect(prismaMock.campaignRegion.findMany).toHaveBeenCalledWith({
        where: { campaignId: 'campaignId', slug: { startsWith: 'eur' } },
        select: { slug: true }
      })
    })

    it('skips the slugs of the team’s live journeys', async () => {
      prismaMock.campaignRegion.findMany.mockResolvedValue([
        { slug: 'eur-2' }
      ] as any)
      prismaMock.journey.findMany.mockResolvedValue([{ slug: 'eur' }] as any)
      await expect(generateUniqueRegionSlug(campaign, 'EUR')).resolves.toBe(
        'eur-3'
      )
      expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
        where: {
          teamId: 'teamId',
          slug: { startsWith: 'eur' },
          deletedAt: null
        },
        select: { slug: true }
      })
    })

    it('reserves the shared list plus the viewer segments and i18n locales', async () => {
      for (const reserved of [
        'admin',
        'embed',
        'legal',
        'plausible',
        'campaign',
        'template-gallery',
        'api',
        'fr',
        'zh-hans-cn'
      ]) {
        expect(REGION_RESERVED_SLUGS.has(reserved)).toBe(true)
      }
      await expectBadUserInputAsync(
        generateUniqueRegionSlug(campaign, 'Embed'),
        'slug'
      )
      await expectBadUserInputAsync(
        validateRegionSlug('campaignId', 'legal', 'regionId'),
        'slug'
      )
    })

    it('is author-editable with the same pattern, length and uniqueness within the campaign', async () => {
      await expect(
        validateRegionSlug('campaignId', ' Lac ', 'regionId')
      ).resolves.toBe('lac')
      expect(prismaMock.campaignRegion.findFirst).toHaveBeenCalledWith({
        where: {
          campaignId: 'campaignId',
          slug: 'lac',
          NOT: { id: 'regionId' }
        },
        select: { id: true }
      })
      await expectBadUserInputAsync(
        validateRegionSlug('campaignId', 'x'.repeat(201), 'regionId'),
        'slug'
      )
      prismaMock.campaignRegion.findFirst.mockResolvedValue({
        id: 'other'
      } as any)
      await expectBadUserInputAsync(
        validateRegionSlug('campaignId', 'lac', 'regionId'),
        'slug'
      )
    })
  })
})
