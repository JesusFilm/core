import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { deleteShortLink } from '../qrCode/qrCode.service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../qrCode/qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../qrCode/qrCode.service')>()),
  deleteShortLink: vi.fn()
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
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue([])
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
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
  })

  it("deletes every Share Language's QR row and short link before the campaign", async () => {
    const campaign = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.delete.mockResolvedValue(campaign)
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue([
      { qrCode: { id: 'qrCodeA', shortLinkId: 'shortLinkA' } },
      { qrCode: { id: 'qrCodeB', shortLinkId: 'shortLinkB' } }
    ] as never)

    const result = (await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaignRegionLanguage.findMany).toHaveBeenCalledWith({
      where: { region: { campaignId: 'campaignId' }, qrCodeId: { not: null } },
      select: { qrCode: { select: { id: true, shortLinkId: true } } }
    })
    expect(deleteShortLink).toHaveBeenCalledWith('shortLinkA')
    expect(deleteShortLink).toHaveBeenCalledWith('shortLinkB')
    expect(prismaMock.qrCode.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['qrCodeA', 'qrCodeB'] } }
    })
    expect(prismaMock.campaign.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
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
