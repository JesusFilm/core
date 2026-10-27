import { User } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { prismaMock } from '../../../test/prismaMock'

import { authorizeCampaignDomainAdd } from './authorizeCampaignDomainAdd'
import { INCLUDE_CAMPAIGN_ACL } from './campaign.acl'

describe('authorizeCampaignDomainAdd', () => {
  const user = { id: 'userId' } as unknown as User

  it('loads the campaign with its ACL, regions and domains and allows a member of its team', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)

    await expect(
      authorizeCampaignDomainAdd('campaignId', 'teamId', user)
    ).resolves.toBe(campaign)
    expect(prismaMock.campaign.findUnique).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      include: { ...INCLUDE_CAMPAIGN_ACL, regions: true, customDomains: true }
    })
  })

  it.each([
    { name: 'an unknown campaign', campaign: null },
    {
      name: 'a campaign of another team',
      campaign: campaignFactory({ teamId: 'otherTeamId' }).build()
    }
  ])('is BAD_USER_INPUT on campaignId for $name', async ({ campaign }) => {
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)

    await expect(
      authorizeCampaignDomainAdd('campaignId', 'teamId', user)
    ).rejects.toMatchObject({
      message: 'campaign not found for this team',
      extensions: { code: 'BAD_USER_INPUT', field: 'campaignId' }
    })
  })

  it('is FORBIDDEN for a caller who may not update the campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    await expect(
      authorizeCampaignDomainAdd('campaignId', 'teamId', user)
    ).rejects.toMatchObject({
      message: 'user is not allowed to update campaign',
      extensions: { code: 'FORBIDDEN' }
    })
  })

  it('is BAD_USER_INPUT on campaignId when the campaign already has a domain', async () => {
    const campaign = {
      ...campaignFactory({ role: 'manager' }).build(),
      customDomains: [
        {
          id: 'customDomainId',
          name: 'taken.example.com',
          apexName: 'example.com',
          teamId: 'teamId',
          routeAllTeamJourneys: false,
          journeyCollectionId: null,
          campaignId: 'campaignId'
        }
      ]
    }
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)

    await expect(
      authorizeCampaignDomainAdd('campaignId', 'teamId', user)
    ).rejects.toMatchObject({
      message: 'campaign already has a custom domain',
      extensions: { code: 'BAD_USER_INPUT', field: 'campaignId' }
    })
  })
})
