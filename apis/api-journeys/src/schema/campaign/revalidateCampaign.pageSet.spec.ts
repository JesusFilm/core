import { type MockedFunction, vi } from 'vitest'

import { mockQueueAdd } from '../../../test/bullmqMock'
import { prismaMock } from '../../../test/prismaMock'
import { logger } from '../logger'

import { fetchLanguage } from './gatewayClient'
import {
  CAMPAIGN_ADDRESS_SELECT,
  type CampaignAddressSnapshot,
  campaignPageSet,
  queuePageSetChange,
  snapshotCampaignAddress
} from './revalidateCampaign'

vi.mock('./gatewayClient', () => ({ fetchLanguage: vi.fn() }))
vi.mock('../logger', () => ({ logger: { error: vi.fn() } }))

const mockFetchLanguage = fetchLanguage as MockedFunction<typeof fetchLanguage>

const BCP47: Record<string, string | null> = {
  '529': 'en',
  '496': 'fr-CA',
  '21028': 'es'
}

const published: CampaignAddressSnapshot = {
  status: 'published',
  slug: 'outreach',
  regions: [
    { slug: 'eur', listed: true },
    { slug: 'afr', listed: false }
  ],
  domainNames: [],
  languageIds: ['529']
}

function queuedPaths(): string[] {
  return mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])
}

describe('the Campaign page set', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchLanguage.mockImplementation(async (id) => ({
      id,
      bcp47: BCP47[id] ?? null
    }))
  })

  describe('snapshotCampaignAddress', () => {
    it('reads the address state with a plain select, no lock, leaving region order and names out', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue({
        status: 'published',
        slug: 'outreach',
        title: 'Outreach',
        regions: [{ slug: 'eur', listed: true, name: 'Europe', order: 0 }],
        customDomains: [{ name: 'outreach.example.org' }],
        languages: [{ languageId: '529' }, { languageId: '496' }]
      } as any)

      expect(await snapshotCampaignAddress(prismaMock, 'campaignId')).toEqual({
        status: 'published',
        slug: 'outreach',
        regions: [{ slug: 'eur', listed: true }],
        domainNames: ['outreach.example.org'],
        languageIds: ['529', '496']
      })
      expect(prismaMock.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        select: CAMPAIGN_ADDRESS_SELECT
      })
      expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it('is null when the campaign does not exist', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(null)

      expect(await snapshotCampaignAddress(prismaMock, 'missing')).toBeNull()
    })
  })

  describe('campaignPageSet', () => {
    const tags = new Map([['529', 'en']])

    it('is empty for a draft', () => {
      expect(campaignPageSet({ ...published, status: 'draft' }, tags)).toEqual(
        []
      )
    })

    it('is empty for a deleted campaign', () => {
      expect(campaignPageSet(null, tags)).toEqual([])
    })

    it('lists every region, listed and orphan, in both forms under each resolved tag', () => {
      expect(
        campaignPageSet(
          {
            ...published,
            domainNames: ['outreach.example.org'],
            languageIds: ['529', '496']
          },
          tags
        )
      ).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/eur',
        '/home/campaign/outreach/afr',
        '/home/campaign/outreach/_lang/en',
        '/home/campaign/outreach/_lang/en/eur',
        '/home/campaign/outreach/_lang/en/afr',
        '/outreach.example.org',
        '/outreach.example.org/eur',
        '/outreach.example.org/afr',
        '/outreach.example.org/_lang/en',
        '/outreach.example.org/_lang/en/eur',
        '/outreach.example.org/_lang/en/afr'
      ])
    })
  })

  describe('queuePageSetChange', () => {
    it('queues nothing for an unchanged snapshot', async () => {
      await queuePageSetChange(published, { ...published })

      expect(mockFetchLanguage).not.toHaveBeenCalled()
      expect(mockQueueAdd).not.toHaveBeenCalled()
    })

    it('ignores region order, so a reorder queues nothing', async () => {
      await queuePageSetChange(published, {
        ...published,
        regions: [...published.regions].reverse()
      })

      expect(mockQueueAdd).not.toHaveBeenCalled()
    })

    it('compares languages as a set, so their order queues nothing', async () => {
      await queuePageSetChange(
        { ...published, languageIds: ['529', '496'] },
        { ...published, languageIds: ['496', '529'] }
      )

      expect(mockQueueAdd).not.toHaveBeenCalled()
    })

    it('queues nothing for a change on a draft, and calls no gateway', async () => {
      const draft = { ...published, status: 'draft' as const }

      await queuePageSetChange(draft, { ...draft, slug: 'renamed' })

      expect(mockFetchLanguage).not.toHaveBeenCalled()
      expect(mockQueueAdd).not.toHaveBeenCalled()
    })

    it('queues every page of the published campaign on publish', async () => {
      await queuePageSetChange({ ...published, status: 'draft' }, published)

      expect(queuedPaths()).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/eur',
        '/home/campaign/outreach/afr',
        '/home/campaign/outreach/_lang/en',
        '/home/campaign/outreach/_lang/en/eur',
        '/home/campaign/outreach/_lang/en/afr'
      ])
    })

    it('queues every page of the before snapshot when the campaign is deleted', async () => {
      await queuePageSetChange(published, null)

      expect(queuedPaths()).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/eur',
        '/home/campaign/outreach/afr',
        '/home/campaign/outreach/_lang/en',
        '/home/campaign/outreach/_lang/en/eur',
        '/home/campaign/outreach/_lang/en/afr'
      ])
    })

    it('queues before ∪ after on a slug change, the unchanged domain form once', async () => {
      const withDomain = {
        ...published,
        regions: [{ slug: 'eur', listed: true }],
        domainNames: ['outreach.example.org'],
        languageIds: []
      }

      await queuePageSetChange(withDomain, { ...withDomain, slug: 'renamed' })

      expect(queuedPaths()).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/eur',
        '/outreach.example.org',
        '/outreach.example.org/eur',
        '/home/campaign/renamed',
        '/home/campaign/renamed/eur'
      ])
    })

    it('queues both forms when a Campaign Domain is added', async () => {
      const plain = {
        ...published,
        regions: [{ slug: 'eur', listed: true }],
        languageIds: []
      }

      await queuePageSetChange(plain, {
        ...plain,
        domainNames: ['outreach.example.org']
      })

      expect(queuedPaths()).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/eur',
        '/outreach.example.org',
        '/outreach.example.org/eur'
      ])
    })

    it('queues every page under the old and the new tags when a Page Language is added, each path once', async () => {
      const plain = { ...published, regions: [{ slug: 'eur', listed: true }] }

      await queuePageSetChange(plain, { ...plain, languageIds: ['529', '496'] })

      expect(queuedPaths()).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/eur',
        '/home/campaign/outreach/_lang/en',
        '/home/campaign/outreach/_lang/en/eur',
        '/home/campaign/outreach/_lang/fr-ca',
        '/home/campaign/outreach/_lang/fr-ca/eur'
      ])
      expect(mockFetchLanguage.mock.calls).toEqual([['529'], ['496']])
    })

    it('queues every page when a region is listed', async () => {
      await queuePageSetChange(published, {
        ...published,
        regions: published.regions.map((region) => ({
          ...region,
          listed: true
        }))
      })

      expect(queuedPaths()).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/eur',
        '/home/campaign/outreach/afr',
        '/home/campaign/outreach/_lang/en',
        '/home/campaign/outreach/_lang/en/eur',
        '/home/campaign/outreach/_lang/en/afr'
      ])
    })

    it('queues the old region path and the new one when a region slug moves', async () => {
      const plain = {
        ...published,
        regions: [{ slug: 'eur', listed: true }],
        languageIds: []
      }

      await queuePageSetChange(plain, {
        ...plain,
        regions: [{ slug: 'europe', listed: true }]
      })

      expect(queuedPaths()).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/eur',
        '/home/campaign/outreach/europe'
      ])
    })

    it('logs a language that cannot be resolved and leaves its pages out', async () => {
      const error = new Error('gateway down')
      mockFetchLanguage.mockImplementation(async (id) => {
        if (id === '496') throw error
        return { id, bcp47: BCP47[id] ?? null }
      })
      const plain = { ...published, regions: [], languageIds: ['529'] }

      await queuePageSetChange(plain, { ...plain, languageIds: ['529', '496'] })

      expect(queuedPaths()).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/_lang/en'
      ])
      expect(logger.error).toHaveBeenCalledWith(
        { error, languageId: '496' },
        'Failed to resolve campaign language for revalidation'
      )
    })

    it('leaves out a language with no tag or one the proxy never routes', async () => {
      mockFetchLanguage.mockImplementation(async (id) => ({
        id,
        bcp47: id === '529' ? 'zh-Hans-CN' : id === '496' ? 'not a tag' : null
      }))
      const plain = { ...published, regions: [], languageIds: ['529'] }

      await queuePageSetChange(plain, {
        ...plain,
        languageIds: ['529', '496', '21028']
      })

      expect(queuedPaths()).toEqual([
        '/home/campaign/outreach',
        '/home/campaign/outreach/_lang/zh-hans-cn'
      ])
    })
  })
})
