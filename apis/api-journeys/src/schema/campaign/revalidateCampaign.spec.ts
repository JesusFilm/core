import { type MockedFunction, vi } from 'vitest'

import { mockQueueAdd } from '../../../test/bullmqMock'
import { prismaMock } from '../../../test/prismaMock'

import { fetchLanguage } from './gatewayClient'
import {
  campaignLanguageTags,
  campaignPagePaths,
  enqueueCampaignRevalidation
} from './revalidateCampaign'

vi.mock('./gatewayClient', () => ({ fetchLanguage: vi.fn() }))

const mockFetchLanguage = fetchLanguage as MockedFunction<typeof fetchLanguage>

describe('campaignPagePaths', () => {
  it('lists the landing page and every region', () => {
    expect(
      campaignPagePaths({
        slug: 'outreach',
        regions: [{ slug: 'eur' }, { slug: 'afr' }]
      })
    ).toEqual([
      '/home/campaign/outreach',
      '/home/campaign/outreach/eur',
      '/home/campaign/outreach/afr'
    ])
  })

  it('adds the _lang page of every language tag to the root and domain forms', () => {
    expect(
      campaignPagePaths({
        slug: 'outreach',
        regions: [{ slug: 'eur' }],
        hostnames: ['outreach.example.org'],
        languageTags: ['en', 'es']
      })
    ).toEqual([
      '/home/campaign/outreach',
      '/home/campaign/outreach/eur',
      '/home/campaign/outreach/_lang/en',
      '/home/campaign/outreach/_lang/en/eur',
      '/home/campaign/outreach/_lang/es',
      '/home/campaign/outreach/_lang/es/eur',
      '/outreach.example.org',
      '/outreach.example.org/eur',
      '/outreach.example.org/_lang/en',
      '/outreach.example.org/_lang/en/eur',
      '/outreach.example.org/_lang/es',
      '/outreach.example.org/_lang/es/eur'
    ])
  })
})

describe('enqueueCampaignRevalidation', () => {
  it('queues one job per path, retried three times with exponential backoff', async () => {
    await enqueueCampaignRevalidation([
      '/home/campaign/christmas',
      '/home/campaign/christmas/eur'
    ])

    const options = {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    }
    expect(mockQueueAdd.mock.calls).toEqual([
      ['revalidate', { paths: ['/home/campaign/christmas'] }, options],
      ['revalidate', { paths: ['/home/campaign/christmas/eur'] }, options]
    ])
  })

  it('logs a queue failure instead of throwing', async () => {
    mockQueueAdd.mockRejectedValue(new Error('redis down'))

    await expect(
      enqueueCampaignRevalidation(['/home/campaign/christmas'])
    ).resolves.toBeUndefined()
  })
})

describe('campaignLanguageTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves the bcp47 tag of each campaign language, lowercased', async () => {
    prismaMock.campaignLanguage.findMany.mockResolvedValue([
      { languageId: '529' },
      { languageId: '496' }
    ] as any)
    mockFetchLanguage
      .mockResolvedValueOnce({ id: '529', bcp47: 'en' })
      .mockResolvedValueOnce({ id: '496', bcp47: 'fr-CA' })

    expect(await campaignLanguageTags('campaignId')).toEqual(['en', 'fr-ca'])
    expect(prismaMock.campaignLanguage.findMany).toHaveBeenCalledWith({
      where: { campaignId: 'campaignId' }
    })
  })

  it('leaves out a language that has no tag or cannot be resolved', async () => {
    prismaMock.campaignLanguage.findMany.mockResolvedValue([
      { languageId: '529' },
      { languageId: '496' },
      { languageId: '21028' }
    ] as any)
    mockFetchLanguage
      .mockResolvedValueOnce({ id: '529', bcp47: 'en' })
      .mockResolvedValueOnce({ id: '496', bcp47: null })
      .mockRejectedValueOnce(new Error('gateway down'))

    expect(await campaignLanguageTags('campaignId')).toEqual(['en'])
  })

  it('returns no tags when the languages cannot be listed', async () => {
    prismaMock.campaignLanguage.findMany.mockRejectedValue(new Error('db down'))

    expect(await campaignLanguageTags('campaignId')).toEqual([])
  })
})
