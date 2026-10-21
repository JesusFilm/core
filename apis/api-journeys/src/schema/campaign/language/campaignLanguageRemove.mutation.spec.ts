import { vi } from 'vitest'

import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import { campaignFactory } from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

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

  async function remove(languageId: string): Promise<any> {
    return await authClient({
      document: CAMPAIGN_LANGUAGE_REMOVE,
      variables: { campaignId: 'campaignId', languageId }
    })
  }

  beforeEach(() => {
    setupCampaignBlockSpec()
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
    prismaMock.campaign.findUnique
      .mockResolvedValueOnce(campaign)
      .mockResolvedValueOnce({ ...campaign, defaultLanguageId: FRENCH })

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
