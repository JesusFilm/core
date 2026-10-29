import { vi } from 'vitest'

import { mockQueueAdd } from '../../../../test/bullmqMock'
import { mockAddressSnapshots } from '../../../../test/campaignAddressSnapshot'
import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSetup'
import { campaignFactory } from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { fetchLanguage } from '../gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))
vi.mock('../gatewayClient', () => ({ fetchLanguage: vi.fn() }))

const FRENCH = '496'
const SPANISH = '21028'

describe('campaignLanguageRemove', () => {
  const CAMPAIGN_LANGUAGE_REMOVE = graphql(`
    mutation CampaignLanguageRemove($campaignId: ID!, $languageId: ID!) {
      campaignLanguageRemove(campaignId: $campaignId, languageId: $languageId) {
        id
        defaultLanguageId
        languages {
          languageId
          order
        }
      }
    }
  `)

  async function remove(
    languageId: string
  ): Promise<CampaignSpecResult<typeof CAMPAIGN_LANGUAGE_REMOVE>> {
    return await authClient({
      document: CAMPAIGN_LANGUAGE_REMOVE,
      variables: { campaignId: 'campaignId', languageId }
    })
  }

  beforeEach(() => {
    setupCampaignBlockSpec()
    vi.mocked(fetchLanguage).mockImplementation(async (id) => ({
      id,
      bcp47: { '529': 'en', [FRENCH]: 'fr', [SPANISH]: 'es' }[id] ?? null
    }))
  })

  it('removes a non-default language and closes the gap in the order', async () => {
    const campaign = campaignFactory({ role: 'member' })
      .withLanguage(FRENCH)
      .withLanguage(SPANISH)
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      ...campaign,
      languages: [campaign.languages[0], { ...campaign.languages[2], order: 1 }]
    } as any)

    const result = await remove(FRENCH)

    expect(result).toEqual({
      data: {
        campaignLanguageRemove: {
          id: 'campaignId',
          defaultLanguageId: '529',
          languages: [
            { languageId: '529', order: 0 },
            { languageId: SPANISH, order: 1 }
          ]
        }
      }
    })
    expect(prismaMock.campaignLanguage.delete).toHaveBeenCalledWith({
      where: { id: `campaignLanguage-${FRENCH}` }
    })
    expect(prismaMock.campaignLanguage.update).toHaveBeenCalledTimes(1)
    expect(prismaMock.campaignLanguage.update).toHaveBeenCalledWith({
      where: { id: `campaignLanguage-${SPANISH}` },
      data: { order: 1 }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('queues every page of a published campaign, the removed language’s _lang pages included', async () => {
    const campaign = campaignFactory({ role: 'member' })
      .withLanguage(FRENCH)
      .withRegion('EUR')
      .published()
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    mockAddressSnapshots(campaign, {
      ...campaign,
      languages: [campaign.languages[0]]
    })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(campaign)

    await remove(FRENCH)

    expect(prismaMock.campaignLanguage.delete).toHaveBeenCalled()
    expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
      '/home/campaign/outreach-2026',
      '/home/campaign/outreach-2026/eur',
      '/home/campaign/outreach-2026/_lang/en',
      '/home/campaign/outreach-2026/_lang/en/eur',
      '/home/campaign/outreach-2026/_lang/fr',
      '/home/campaign/outreach-2026/_lang/fr/eur'
    ])
  })

  it('queues nothing when the removal is refused', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' })
        .withLanguage(FRENCH)
        .published()
        .build()
    )

    await remove('529')

    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('refuses to remove the default language (CONFLICT, field languageId)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).withLanguage(FRENCH).build()
    )

    const result = await remove('529')

    expect(result.errors[0]).toMatchObject({
      message: 'languageId is the default language and cannot be removed',
      extensions: { code: 'CONFLICT', field: 'languageId' }
    })
    expect(prismaMock.campaignLanguage.delete).not.toHaveBeenCalled()
  })

  it('refuses to remove the last language (CONFLICT, field languageId)', async () => {
    // The last language is always the default too; a campaign whose only
    // language were not its default could not exist. Model the state anyway so
    // the last-language rule is checked on its own.
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...campaign,
      defaultLanguageId: FRENCH
    })

    const result = await remove('529')

    expect(result.errors[0]).toMatchObject({
      message: 'languageId is the last language and cannot be removed',
      extensions: { code: 'CONFLICT', field: 'languageId' }
    })
    expect(prismaMock.campaignLanguage.delete).not.toHaveBeenCalled()
  })

  it('judges the removal against the state locked inside the transaction (CONFLICT when a concurrent swap made the language the default)', async () => {
    const campaign = campaignFactory({ role: 'member' })
      .withLanguage(FRENCH)
      .build()
    // Every read inside the transaction, the address snapshot included,
    // sees the concurrent swap.
    prismaMock.campaign.findUnique
      .mockResolvedValueOnce(campaign)
      .mockResolvedValue({ ...campaign, defaultLanguageId: FRENCH })

    const result = await remove(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'languageId is the default language and cannot be removed',
      extensions: { code: 'CONFLICT', field: 'languageId' }
    })
    const lockSql = prismaMock.$queryRaw.mock.calls.map(([strings]) =>
      (strings as unknown as readonly string[]).join('')
    )
    expect(lockSql.every((sql) => sql.includes('FOR UPDATE'))).toBe(true)
    expect(lockSql.map((sql) => sql.match(/"(\w+)"/)?.[1])).toEqual([
      'CampaignLanguage',
      'Campaign'
    ])
    expect(prismaMock.campaignLanguage.delete).not.toHaveBeenCalled()
  })

  it('is NOT_FOUND for a language the campaign does not have', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).withLanguage(FRENCH).build()
    )

    const result = await remove(SPANISH)

    expect(result.errors[0]).toMatchObject({
      message: 'language not found',
      extensions: expect.objectContaining({ code: 'NOT_FOUND' })
    })
  })

  it('throws FORBIDDEN for a user outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).withLanguage(FRENCH).build()
    )

    const result = await remove(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'user is not allowed to update campaign',
      extensions: expect.objectContaining({ code: 'FORBIDDEN' })
    })
    expect(prismaMock.campaignLanguage.delete).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await remove(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'campaign not found',
      extensions: expect.objectContaining({ code: 'NOT_FOUND' })
    })
  })
})
