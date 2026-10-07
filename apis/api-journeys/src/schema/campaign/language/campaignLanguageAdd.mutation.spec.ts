import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../../test/campaignFactory'
import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { fetchLanguage } from '../gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))
vi.mock('../gatewayClient', () => ({ fetchLanguage: vi.fn() }))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>
const mockFetchLanguage = fetchLanguage as MockedFunction<typeof fetchLanguage>

const FRENCH = '496'

describe('campaignLanguageAdd', () => {
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

  const CAMPAIGN_LANGUAGE_ADD = graphql(`
    mutation CampaignLanguageAdd($campaignId: ID!, $languageId: ID!) {
      campaignLanguageAdd(campaignId: $campaignId, languageId: $languageId) {
        id
        defaultLanguageId
        languages {
          languageId
          order
        }
      }
    }
  `)

  async function add(languageId: string): Promise<any> {
    return await authClient({
      document: CAMPAIGN_LANGUAGE_ADD,
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
    mockFetchLanguage.mockResolvedValue({ id: FRENCH, bcp47: 'fr' })
  })

  it('appends the language at the end of the selector order for a member', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(
      campaignFactory({ role: 'member' }).withLanguage(FRENCH).build()
    )

    const result = await add(FRENCH)

    expect(result).toEqual({
      data: {
        campaignLanguageAdd: {
          id: 'campaignId',
          defaultLanguageId: '529',
          languages: [
            { languageId: '529', order: 0 },
            { languageId: FRENCH, order: 1 }
          ]
        }
      }
    })
    expect(mockFetchLanguage).toHaveBeenCalledWith(FRENCH)
    expect(prismaMock.campaignLanguage.create).toHaveBeenCalledWith({
      data: { campaignId: 'campaignId', languageId: FRENCH, order: 1 }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
  })

  it('rejects a language api-languages does not know (BAD_USER_INPUT, field languageId)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    mockFetchLanguage.mockResolvedValue(null)

    const result = await add('nope')

    expect(result.errors[0]).toMatchObject({
      message: 'languageId must be an existing language',
      extensions: { code: 'BAD_USER_INPUT', field: 'languageId' }
    })
    expect(prismaMock.campaignLanguage.create).not.toHaveBeenCalled()
  })

  it('rejects the same language twice (BAD_USER_INPUT, field languageId) without a gateway call', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).withLanguage(FRENCH).build()
    )

    const result = await add(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'languageId is already a language of this campaign',
      extensions: { code: 'BAD_USER_INPUT', field: 'languageId' }
    })
    expect(mockFetchLanguage).not.toHaveBeenCalled()
    expect(prismaMock.campaignLanguage.create).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a user outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await add(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'user is not allowed to update campaign',
      extensions: expect.objectContaining({ code: 'FORBIDDEN' })
    })
    expect(prismaMock.campaignLanguage.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await add(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'campaign not found',
      extensions: expect.objectContaining({ code: 'NOT_FOUND' })
    })
  })
})
