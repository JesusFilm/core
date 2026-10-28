import { User } from '@core/yoga/firebaseClient'

import { campaignFactory, campaignRow } from '../../../test/campaignFactory'
import { prismaMock } from '../../../test/prismaMock'

import { CampaignOperation, authorizeCampaign } from './authorizeCampaign'
import { INCLUDE_CAMPAIGN_ACL } from './campaign.acl'

describe('authorizeCampaign', () => {
  const user = { id: 'userId' } as unknown as User

  it('loads the campaign with its ACL and the requested include', async () => {
    const campaign = campaignRow(campaignFactory({ role: 'member' }).build())
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)

    await expect(
      authorizeCampaign('campaignId', 'update', user, { regions: true })
    ).resolves.toBe(campaign)
    expect(prismaMock.campaign.findUnique).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      include: { ...INCLUDE_CAMPAIGN_ACL, regions: true }
    })
  })

  it('is NOT_FOUND when the id does not resolve', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    await expect(
      authorizeCampaign('missing', 'view', user)
    ).rejects.toMatchObject({
      message: 'campaign not found',
      extensions: { code: 'NOT_FOUND' }
    })
  })

  it.each<CampaignOperation>(['view', 'update', 'publish', 'unpublish'])(
    'lets a member %s',
    async (operation) => {
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignRow(campaignFactory({ role: 'member' }).build())
      )

      await expect(
        authorizeCampaign('campaignId', operation, user)
      ).resolves.toMatchObject({ id: 'campaignId' })
    }
  )

  it('lets only a manager delete', async () => {
    prismaMock.campaign.findUnique.mockResolvedValueOnce(
      campaignRow(campaignFactory({ role: 'manager' }).build())
    )
    await expect(
      authorizeCampaign('campaignId', 'delete', user)
    ).resolves.toMatchObject({ id: 'campaignId' })

    prismaMock.campaign.findUnique.mockResolvedValueOnce(
      campaignRow(campaignFactory({ role: 'member' }).build())
    )
    await expect(
      authorizeCampaign('campaignId', 'delete', user)
    ).rejects.toMatchObject({
      message: 'user is not allowed to delete campaign',
      extensions: { code: 'FORBIDDEN' }
    })
  })

  it.each<CampaignOperation>([
    'view',
    'update',
    'publish',
    'unpublish',
    'delete'
  ])(
    'is FORBIDDEN, naming the operation, to %s for a caller outside the team',
    async (operation) => {
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignRow(campaignFactory({ userId: 'someoneElse' }).build())
      )

      await expect(
        authorizeCampaign('campaignId', operation, user)
      ).rejects.toMatchObject({
        message: `user is not allowed to ${operation} campaign`,
        extensions: { code: 'FORBIDDEN' }
      })
    }
  )

  it.each<{ operation: CampaignOperation; refused: string }>([
    { operation: 'createBlock', refused: 'create block' },
    { operation: 'createRegion', refused: 'create region' }
  ])(
    'lets a member $operation and refuses an outsider, naming what they create',
    async ({ operation, refused }) => {
      prismaMock.campaign.findUnique.mockResolvedValueOnce(
        campaignRow(campaignFactory({ role: 'member' }).build())
      )
      await expect(
        authorizeCampaign('campaignId', operation, user)
      ).resolves.toMatchObject({ id: 'campaignId' })

      prismaMock.campaign.findUnique.mockResolvedValueOnce(
        campaignRow(campaignFactory({ userId: 'someoneElse' }).build())
      )
      await expect(
        authorizeCampaign('campaignId', operation, user)
      ).rejects.toMatchObject({
        message: `user is not allowed to ${refused}`,
        extensions: { code: 'FORBIDDEN' }
      })
    }
  )
})
