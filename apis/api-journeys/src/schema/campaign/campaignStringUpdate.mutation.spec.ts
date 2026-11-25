import { vi } from 'vitest'

import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../test/campaignBlockSetup'
import { campaignFactory } from '../../../test/campaignFactory'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignStringUpdate', () => {
  const CAMPAIGN_STRING_UPDATE = graphql(`
    mutation CampaignStringUpdate(
      $campaignId: ID!
      $key: CampaignStringKey!
      $value: String!
    ) {
      campaignStringUpdate(campaignId: $campaignId, key: $key, value: $value) {
        id
        key
        value
        valueTranslations {
          languageId
          value
          source
        }
      }
    }
  `)

  async function update(
    key: string,
    value: string
  ): Promise<CampaignSpecResult<typeof CAMPAIGN_STRING_UPDATE>> {
    return await authClient({
      document: CAMPAIGN_STRING_UPDATE,
      variables: { campaignId: 'campaignId', key, value }
    })
  }

  beforeEach(() => {
    setupCampaignBlockSpec()
  })

  it('writes the trimmed default-language wording by key and leaves translations alone', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    const copy = campaign.strings.find((string) => string.key === 'copy')
    prismaMock.campaignString.update.mockResolvedValue({
      ...copy!,
      value: 'Copy the link',
      valueTranslations: {
        '496': { value: 'Copier le lien', source: 'human' }
      }
    })

    const result = await update('copy', '  Copy the link  ')

    expect(result).toEqual({
      data: {
        campaignStringUpdate: {
          id: 'string-copy',
          key: 'copy',
          value: 'Copy the link',
          valueTranslations: [
            { languageId: '496', value: 'Copier le lien', source: 'human' }
          ]
        }
      }
    })
    expect(prismaMock.campaignString.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { campaignId_key: { campaignId: 'campaignId', key: 'copy' } },
        data: { value: 'Copy the link' }
      })
    )
    expect(prismaMock.campaignString.delete).not.toHaveBeenCalled()
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
  })

  it('allows an empty value', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    const videos = campaign.strings.find((string) => string.key === 'videos')
    prismaMock.campaignString.update.mockResolvedValue({
      ...videos!,
      value: ''
    })

    const result = await update('videos', '   ')

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignStringUpdate.value).toBe('')
  })

  it('keeps line breaks and drops other control characters', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    const copy = campaign.strings.find((string) => string.key === 'copy')
    prismaMock.campaignString.update.mockResolvedValue({
      ...copy!,
      value: 'a\nb c'
    })

    await update('copy', 'a\r\nb\tc\u0007')

    expect(prismaMock.campaignString.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { value: 'a\nb c' } })
    )
  })

  it('normalises a lone carriage return to a line break', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    const copy = campaign.strings.find((string) => string.key === 'copy')
    prismaMock.campaignString.update.mockResolvedValue({
      ...copy!,
      value: 'a\nb'
    })

    await update('copy', 'a\rb')

    expect(prismaMock.campaignString.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { value: 'a\nb' } })
    )
  })

  it('stores an empty value as empty', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    const copy = campaign.strings.find((string) => string.key === 'copy')
    prismaMock.campaignString.update.mockResolvedValue({ ...copy!, value: '' })

    await update('copy', '')

    expect(prismaMock.campaignString.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { value: '' } })
    )
  })

  it('caps the value at 200 characters (BAD_USER_INPUT, field value)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = await update('copy', 'x'.repeat(201))

    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'value'
    })
    expect(prismaMock.campaignString.update).not.toHaveBeenCalled()
  })

  it('takes only a CampaignStringKey', async () => {
    const result = await update('notAKey', 'Hello')

    expect(result.errors?.[0].message).toMatch(/CampaignStringKey/)
    expect(prismaMock.campaign.findUnique).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a user outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await update('copy', 'Nope')

    expect(result.errors?.[0]).toMatchObject({
      message: 'user is not allowed to update campaign',
      extensions: expect.objectContaining({ code: 'FORBIDDEN' })
    })
    expect(prismaMock.campaignString.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await update('copy', 'Nope')

    expect(result.errors?.[0]).toMatchObject({
      message: 'campaign not found',
      extensions: expect.objectContaining({ code: 'NOT_FOUND' })
    })
  })
})
