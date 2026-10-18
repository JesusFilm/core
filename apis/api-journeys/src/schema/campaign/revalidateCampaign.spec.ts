import { type MockedFunction, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'

import { fetchLanguage } from './gatewayClient'
import { campaignLanguageTags, campaignPagePaths } from './revalidateCampaign'

vi.mock('bullmq', () => ({
  Queue: vi.fn(function () {
    return { add: vi.fn() }
  })
}))

vi.mock('./gatewayClient', () => ({ fetchLanguage: vi.fn() }))

const mockFetchLanguage = fetchLanguage as MockedFunction<typeof fetchLanguage>

describe('campaignPagePaths', () => {
  it('lists the landing page and every region', () => {
    expect(
      campaignPagePaths({
        slug: 'christmas',
        regions: [{ slug: 'eur' }, { slug: 'afr' }]
      })
    ).toEqual([
      '/home/campaign/christmas',
      '/home/campaign/christmas/eur',
      '/home/campaign/christmas/afr'
    ])
  })

  it('adds the _lang page of every language tag to the root and domain forms', () => {
    expect(
      campaignPagePaths({
        slug: 'christmas',
        regions: [{ slug: 'eur' }],
        hostnames: ['christmas.example.org'],
        languageTags: ['en', 'es']
      })
    ).toEqual([
      '/home/campaign/christmas',
      '/home/campaign/christmas/eur',
      '/home/campaign/christmas/_lang/en',
      '/home/campaign/christmas/_lang/en/eur',
      '/home/campaign/christmas/_lang/es',
      '/home/campaign/christmas/_lang/es/eur',
      '/christmas.example.org',
      '/christmas.example.org/eur',
      '/christmas.example.org/_lang/en',
      '/christmas.example.org/_lang/en/eur',
      '/christmas.example.org/_lang/es',
      '/christmas.example.org/_lang/es/eur'
    ])
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
