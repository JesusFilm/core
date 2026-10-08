import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../../test/campaignFactory'
import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const FRENCH = '496'
const SPANISH = '21028'

describe('campaignLanguageRemove', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

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
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
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
