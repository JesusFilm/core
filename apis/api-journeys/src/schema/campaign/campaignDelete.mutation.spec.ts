import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignDelete', () => {
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

  const CAMPAIGN_DELETE = graphql(`
    mutation CampaignDelete($id: ID!) {
      campaignDelete(id: $id) {
        id
        slug
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
  })

  it('hard-deletes the campaign row for a manager, relying on the cascade for the rest', async () => {
    const campaign = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.delete.mockResolvedValue(campaign)

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: { campaignDelete: { id: 'campaignId', slug: 'christmas-2026' } }
    })
    expect(prismaMock.campaign.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
    // One delete; blocks, actions, pages, languages, theme, strings and
    // regions go with the row through the schema's onDelete: Cascade.
    expect(prismaMock.campaignBlock.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegion.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignPage.deleteMany).not.toHaveBeenCalled()
  })

  it('leaves an attached Custom Domain to the SetNull foreign key: no domain row is written', async () => {
    const campaign = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...campaign,
      customDomains: [{ id: 'customDomainId', name: 'christmas.example.org' }]
    } as any)
    prismaMock.campaign.delete.mockResolvedValue(campaign)

    await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(prismaMock.campaign.delete).toHaveBeenCalledTimes(1)
    expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
    expect(prismaMock.customDomain.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.customDomain.delete).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a member', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to delete campaign',
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.campaign.delete).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'missing' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'campaign not found',
          extensions: expect.objectContaining({ code: 'NOT_FOUND' })
        })
      ]
    })
    expect(prismaMock.campaign.delete).not.toHaveBeenCalled()
  })
})
