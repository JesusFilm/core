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

describe('campaign', () => {
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

  const CAMPAIGN = graphql(`
    query Campaign($id: ID!) {
      campaign(id: $id) {
        id
        teamId
        title
        slug
        status
        defaultLanguageId
        palette
        publishedAt
        languages {
          languageId
          order
        }
        theme {
          themeMode
          primaryColor
          radius
          buttonRadius
        }
        pages {
          kind
        }
        blocks {
          __typename
          id
          pageId
          regionId
          parentBlockId
          parentOrder
          ... on CampaignSectionBlock {
            backgroundKind
          }
          ... on CampaignHeroBlock {
            title
            align
          }
          ... on CampaignButtonBlock {
            label
            action {
              __typename
              parentBlockId
              ... on CampaignScrollToBlockAction {
                blockId
              }
              ... on CampaignLinkAction {
                url
              }
            }
          }
        }
        regions {
          id
          name
          slug
          listed
          languages {
            languageId
            journeyId
          }
        }
        strings {
          key
          value
        }
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

  it('returns the full admin shape behind campaign Read', async () => {
    const fixture = campaignFactory()
      .withRegion('EUR')
      .withLinkedJourney('eurRegionId', '529', {
        id: 'journeyId',
        title: 'Journey',
        description: null
      })
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(fixture)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(fixture)

    const result = (await authClient({
      document: CAMPAIGN,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    const campaign = result.data.campaign
    expect(campaign).toMatchObject({
      id: 'campaignId',
      teamId: 'teamId',
      title: 'Christmas 2026',
      slug: 'christmas-2026',
      status: 'draft',
      defaultLanguageId: '529',
      palette: fixture.palette,
      publishedAt: null,
      languages: [{ languageId: '529', order: 0 }],
      theme: {
        themeMode: 'light',
        primaryColor: '#C52D3A',
        radius: 'rounded',
        buttonRadius: 'pill'
      },
      pages: [{ kind: 'landing' }, { kind: 'regionTemplate' }],
      regions: [
        {
          id: 'eurRegionId',
          name: 'EUR',
          slug: 'eur',
          listed: true,
          languages: [{ languageId: '529', journeyId: 'journeyId' }]
        }
      ]
    })
    expect(campaign.blocks).toHaveLength(fixture.blocks.length)
    expect(campaign.blocks[0]).toEqual({
      __typename: 'CampaignHeroBlock',
      id: 'heroId',
      pageId: 'landingPageId',
      regionId: null,
      parentBlockId: null,
      parentOrder: 0,
      backgroundKind: 'none',
      title: 'Share the story of Christmas',
      align: 'center'
    })
    expect(
      campaign.blocks.find((block: any) => block.id === 'heroButtonId')
    ).toMatchObject({
      __typename: 'CampaignButtonBlock',
      label: 'Choose your region',
      action: {
        __typename: 'CampaignScrollToBlockAction',
        parentBlockId: 'heroButtonId',
        blockId: 'landingSwitcherId'
      }
    })
    expect(
      campaign.blocks.find((block: any) => block.id === 'footerTermsId').action
    ).toEqual({
      __typename: 'CampaignLinkAction',
      parentBlockId: 'footerTermsId',
      url: 'https://www.cru.org/us/en/about/terms-of-use.html'
    })
    expect(campaign.strings).toHaveLength(17)
    expect(prismaMock.campaign.findUnique).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      include: { team: { include: { userTeams: true } } }
    })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    const fixture = campaignFactory({ userId: 'someoneElse' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(fixture)

    const result = await authClient({
      document: CAMPAIGN,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to view campaign',
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.campaign.findUniqueOrThrow).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGN,
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
  })
})
