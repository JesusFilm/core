import { vi } from 'vitest'

import {
  authClient,
  setupCampaignBlockSpec
} from '../../../test/campaignBlockSetup'
import { CampaignFixture, campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaign', () => {
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

  const CAMPAIGN_JOURNEY_CARDS = graphql(`
    query CampaignJourneyCards($id: ID!) {
      campaign(id: $id) {
        blocks {
          __typename
          id
          ... on CampaignJourneyBlock {
            journeyStatus
            journeyUrl
            journeyImage {
              src
            }
          }
        }
      }
    }
  `)

  beforeEach(() => {
    setupCampaignBlockSpec()
  })

  describe('journeyUrl', () => {
    const JOURNEY_URL = graphql(`
      query CampaignJourneyUrl($id: ID!) {
        campaign(id: $id) {
          regions {
            languages {
              journeyUrl
            }
          }
        }
      }
    `)

    function withServedJourney(
      customDomains: Array<{ name: string; routeAllTeamJourneys: boolean }>
    ): CampaignFixture {
      const fixture = campaignFactory()
        .withRegion('EUR')
        .withLinkedJourney('eurRegionId', '529', {
          id: 'journeyId',
          title: 'Journey',
          description: null
        })
        .build()
      const language = fixture.regions[0].languages[0] as Record<
        string,
        unknown
      >
      language.journey = {
        id: 'journeyId',
        slug: 'outreach-europe',
        teamId: 'journeyTeamId',
        team: { id: 'journeyTeamId', customDomains },
        journeyCollectionJourneys: []
      }
      return fixture
    }

    it.each([
      [[], 'https://example.com/outreach-europe'],
      [
        [{ name: 'journeys.example.org', routeAllTeamJourneys: true }],
        'https://journeys.example.org/outreach-europe'
      ]
    ])(
      'is where the linked journey is served, custom domain %j',
      async (customDomains, expected) => {
        const fixture = withServedJourney(customDomains)
        prismaMock.campaign.findUnique.mockResolvedValue(fixture)
        prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(fixture)

        const result = await authClient({
          document: JOURNEY_URL,
          variables: { id: 'campaignId' }
        })

        expect(result.errors).toBeUndefined()
        expect(result.data.campaign.regions[0].languages[0].journeyUrl).toBe(
          expected
        )
      }
    )

    it('is null for an Unlinked Language', async () => {
      const fixture = campaignFactory().withRegion('EUR').build()
      prismaMock.campaign.findUnique.mockResolvedValue(fixture)
      prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(fixture)

      const result = await authClient({
        document: JOURNEY_URL,
        variables: { id: 'campaignId' }
      })

      expect(result.data.campaign.regions[0].languages[0].journeyUrl).toBeNull()
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

    const result = await authClient({
      document: CAMPAIGN,
      variables: { id: 'campaignId' }
    })

    expect(result.errors).toBeUndefined()
    const campaign = result.data.campaign
    expect(campaign).toMatchObject({
      id: 'campaignId',
      teamId: 'teamId',
      title: 'Outreach 2026',
      slug: 'outreach-2026',
      status: 'draft',
      defaultLanguageId: '529',
      palette: fixture.palette,
      publishedAt: null,
      languages: [{ languageId: '529', order: 0 }],
      theme: {
        themeMode: 'light',
        primaryColor: '#C52D3A',
        radius: 'rounded',
        buttonRadius: 'veryRounded'
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
      title: 'Share the story',
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
    expect(campaign.strings).toHaveLength(18)
    expect(prismaMock.campaign.findUnique).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      include: { team: { include: { userTeams: true } } }
    })
  })

  it("returns the Campaign's Plausible token behind campaign Read", async () => {
    const fixture = {
      ...campaignFactory().build(),
      plausibleToken: 'sharedLinkSlug'
    }
    prismaMock.campaign.findUnique.mockResolvedValue(fixture)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(fixture)

    const result = await authClient({
      document: graphql(`
        query CampaignPlausibleToken($id: ID!) {
          campaign(id: $id) {
            id
            plausibleToken
          }
        }
      `),
      variables: { id: 'campaignId' }
    })

    expect(result.errors).toBeUndefined()
    expect(result.data.campaign).toEqual({
      id: 'campaignId',
      plausibleToken: 'sharedLinkSlug'
    })
  })

  it('reads the live journey of every journey card in one query', async () => {
    const fixture = campaignFactory().build()
    const card = (id: string, journeyId: string): any => ({
      ...fixture.blocks[0],
      id,
      typename: 'CampaignJourneyBlock',
      journeyId,
      action: null
    })
    fixture.blocks = [
      ...fixture.blocks,
      card('cardOne', 'journeyOne'),
      card('cardTwo', 'journeyTwo'),
      card('cardThree', 'journeyThree')
    ]
    const journey = (id: string, status: string): any => ({
      id,
      slug: id,
      status,
      deletedAt: null,
      team: { id: 'otherTeamId', customDomains: [] },
      journeyCollectionJourneys: [],
      primaryImageBlock: null
    })
    prismaMock.campaign.findUnique.mockResolvedValue(fixture)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(fixture)
    prismaMock.journey.findMany.mockResolvedValue([
      journey('journeyOne', 'published'),
      journey('journeyTwo', 'draft'),
      journey('journeyThree', 'archived')
    ])

    const result = await authClient({
      document: CAMPAIGN_JOURNEY_CARDS,
      variables: { id: 'campaignId' }
    })

    expect(result.errors).toBeUndefined()
    expect(
      result.data.campaign.blocks.filter(
        (block: any) => block.__typename === 'CampaignJourneyBlock'
      )
    ).toEqual([
      expect.objectContaining({
        id: 'cardOne',
        journeyStatus: 'published',
        journeyUrl: expect.stringContaining('/journeyOne')
      }),
      expect.objectContaining({
        id: 'cardTwo',
        journeyStatus: 'draft',
        journeyUrl: null
      }),
      expect.objectContaining({
        id: 'cardThree',
        journeyStatus: 'archived',
        journeyUrl: expect.stringContaining('/journeyThree')
      })
    ])
    expect(prismaMock.journey.findMany).toHaveBeenCalledTimes(1)
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

/** A type reference as `TYPE_FIELDS` selects it, `ofType` three deep. */
interface TypeRef {
  kind?: string
  name?: string
  ofType?: TypeRef | null
}

/** The `__type` response `TYPE_FIELDS` reads. */
interface TypeFieldsResult {
  data: { __type: { fields: Array<{ name: string; type: TypeRef }> } }
}

describe('translation lists', () => {
  const publicClient = getClient()

  const TYPE_FIELDS = graphql(`
    query TypeFields($name: String!) {
      __type(name: $name) {
        fields {
          name
          type {
            kind
            ofType {
              kind
              ofType {
                kind
                ofType {
                  name
                }
              }
            }
          }
        }
      }
    }
  `)

  async function fieldNames(name: string): Promise<string[]> {
    const result = (await publicClient({
      document: TYPE_FIELDS,
      variables: { name }
    })) as TypeFieldsResult
    return result.data.__type.fields.map((field) => field.name)
  }

  it('exposes <field>Translations: [TranslatedValue!]! on every admin type that carries a Translated Field', async () => {
    const result = (await publicClient({
      document: TYPE_FIELDS,
      variables: { name: 'Campaign' }
    })) as TypeFieldsResult
    const titleTranslations = result.data.__type.fields.find(
      (field) => field.name === 'titleTranslations'
    )
    expect(titleTranslations?.type).toEqual({
      kind: 'NON_NULL',
      ofType: {
        kind: 'LIST',
        ofType: {
          kind: 'NON_NULL',
          ofType: { name: 'TranslatedValue' }
        }
      }
    })
    expect(await fieldNames('CampaignRegion')).toContain('nameTranslations')
    expect(await fieldNames('CampaignString')).toContain('valueTranslations')
    expect(await fieldNames('CampaignHeroBlock')).toEqual(
      expect.arrayContaining([
        'eyebrowTranslations',
        'titleTranslations',
        'descriptionTranslations'
      ])
    )
    expect(await fieldNames('CampaignTypographyBlock')).toContain(
      'contentTranslations'
    )
    expect(await fieldNames('CampaignButtonBlock')).toContain(
      'labelTranslations'
    )
    expect((await fieldNames('TranslatedValue')).sort()).toEqual([
      'languageId',
      'source',
      'value'
    ])
  })

  it('keeps the Plausible token off the CampaignPublic projection', async () => {
    expect(await fieldNames('Campaign')).toContain('plausibleToken')
    expect(await fieldNames('CampaignPublic')).not.toContain('plausibleToken')
  })

  it('omits every translation list from the CampaignPublic projection', async () => {
    for (const name of [
      'CampaignPublic',
      'CampaignRegionPublic',
      'CampaignPagePublic',
      'CampaignRegionLanguagePublic'
    ]) {
      const names = await fieldNames(name)
      expect(names.filter((field) => field.endsWith('Translations'))).toEqual(
        []
      )
    }
  })
})
