import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { CampaignFixture, campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { fetchShortLink } from './gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./gatewayClient', () => ({
  fetchShortLink: vi.fn(),
  shortLinkUrl: (shortLink: { hostname: string; pathname: string }) =>
    `https://${shortLink.hostname}/${shortLink.pathname}`
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const FRENCH = '496'

function journeyRow(
  id: string,
  slug: string,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    id,
    slug,
    title: slug,
    status: 'published',
    deletedAt: null,
    teamId: 'journeyTeamId',
    team: { id: 'journeyTeamId', customDomains: [] },
    journeyCollectionJourneys: [],
    ...overrides
  }
}

/**
 * A published campaign with translations on every translated-field kind, two
 * regions (one linked journey each) and one region line, shaped as the
 * `campaignPublic` Prisma read returns it.
 */
function publishedFixture(): CampaignFixture & Record<string, unknown> {
  const fixture = campaignFactory()
    .withLanguage(FRENCH)
    .withRegion('EUR')
    .withRegion('AFR')
    .withLinkedJourney('eurRegionId', '529', {
      id: 'eurJourneyId',
      title: 'EUR journey',
      description: null
    })
    .withLinkedJourney('afrRegionId', '529', {
      id: 'afrJourneyId',
      title: 'AFR journey',
      description: null
    })
    .published()
    .build()

  return {
    ...fixture,
    titleTranslations: { [FRENCH]: { value: 'Noël 2026', source: 'human' } },
    blocks: [
      ...fixture.blocks.map((block) =>
        block.id === 'heroId'
          ? {
              ...block,
              titleTranslations: {
                [FRENCH]: {
                  value: "Partagez l'histoire de Noël",
                  source: 'machine'
                }
              }
            }
          : block
      ),
      {
        ...fixture.blocks[0],
        id: 'eurLineId',
        typename: 'CampaignTypographyBlock',
        pageId: null,
        regionId: 'eurRegionId',
        parentBlockId: null,
        parentOrder: 0,
        eyebrow: null,
        title: null,
        titleTranslations: null,
        lede: null,
        align: null,
        content: 'Europe',
        contentTranslations: {
          [FRENCH]: { value: 'Europe (FR)', source: 'human' }
        },
        typographyVariant: 'overline',
        action: null
      }
    ],
    regions: fixture.regions.map((region) => ({
      ...region,
      countries:
        region.id === 'eurRegionId'
          ? [
              {
                id: 'eurCountry-FR',
                regionId: 'eurRegionId',
                countryId: 'FR',
                order: 0
              }
            ]
          : [],
      nameTranslations:
        region.id === 'eurRegionId'
          ? { [FRENCH]: { value: 'Europe', source: 'human' } }
          : {},
      languages: region.languages.map((language) => ({
        ...language,
        qrCode:
          language.qrCodeId == null
            ? null
            : {
                id: language.qrCodeId,
                teamId: 'teamId',
                journeyId: language.journeyId,
                toJourneyId: language.journeyId,
                toBlockId: null,
                shortLinkId: `${language.qrCodeId}-shortLinkId`,
                color: '#000000',
                backgroundColor: '#FFFFFF'
              },
        journey:
          language.journeyId === 'eurJourneyId'
            ? journeyRow('eurJourneyId', 'eur-journey', {
                team: {
                  id: 'journeyTeamId',
                  customDomains: [
                    { name: 'journeys.example.org', routeAllTeamJourneys: true }
                  ]
                }
              })
            : language.journeyId === 'afrJourneyId'
              ? journeyRow('afrJourneyId', 'afr-journey')
              : null
      }))
    })),
    strings: fixture.strings.map((string) =>
      string.key === 'copy'
        ? {
            ...string,
            valueTranslations: {
              [FRENCH]: { value: 'Copier le lien', source: 'human' }
            }
          }
        : string
    )
  }
}

describe('campaignPublic', () => {
  const publicClient = getClient()

  const CAMPAIGN_PUBLIC = graphql(`
    query CampaignPublic($slug: String, $hostname: String, $languageId: ID) {
      campaignPublic(
        slug: $slug
        hostname: $hostname
        languageId: $languageId
      ) {
        id
        teamId
        slug
        title
        defaultLanguageId
        defaultLanguage {
          id
        }
        languageId
        publishedAt
        languages {
          id
          languageId
          order
          language {
            id
          }
        }
        theme {
          themeMode
          primaryColor
          radius
          buttonRadius
        }
        strings {
          key
          value
        }
        regions {
          id
          slug
          name
          listed
          order
          countries {
            countryId
            order
            country {
              id
            }
          }
          languages {
            languageId
            order
            journeyStatus
            shortLinkUrl
            journeyUrl
            embedUrl
          }
          lines {
            __typename
            id
            ... on CampaignTypographyBlock {
              content
              contentTranslations {
                languageId
              }
            }
          }
        }
        header {
          id
          logoBlockId
          backgroundKind
        }
        footer {
          id
          backgroundKind
        }
        chrome {
          __typename
          id
          parentBlockId
          parentOrder
          ... on CampaignButtonBlock {
            label
            placement
            action {
              __typename
              ... on CampaignLinkAction {
                url
              }
              ... on CampaignScrollToBlockAction {
                blockId
              }
            }
          }
          ... on CampaignTypographyBlock {
            content
          }
        }
        pages {
          id
          kind
          blocks {
            __typename
            id
            pageId
            parentBlockId
            parentOrder
            ... on CampaignSectionBlock {
              backgroundKind
            }
            ... on CampaignHeroBlock {
              eyebrow
              title
              lede
              titleTranslations {
                languageId
              }
            }
            ... on CampaignButtonBlock {
              label
              placement
            }
          }
        }
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(null)
    vi.mocked(fetchShortLink).mockImplementation(async (id) => ({
      id,
      pathname: id.replace('-qrCodeId-shortLinkId', ''),
      hostname: 'short.example.org'
    }))
  })

  it('returns a published campaign with every text field resolved to the requested language and translation lists omitted', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(publishedFixture())

    const result = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { slug: 'christmas-2026', languageId: FRENCH }
    })) as any

    expect(result.errors).toBeUndefined()
    const campaign = result.data.campaignPublic
    expect(campaign).toMatchObject({
      id: 'campaignId',
      teamId: 'teamId',
      slug: 'christmas-2026',
      title: 'Noël 2026',
      defaultLanguageId: '529',
      defaultLanguage: { id: '529' },
      languageId: FRENCH,
      publishedAt: '2026-10-05T00:00:00.000Z',
      languages: [
        { languageId: '529', order: 0, language: { id: '529' } },
        { languageId: FRENCH, order: 1, language: { id: FRENCH } }
      ],
      theme: {
        themeMode: 'light',
        primaryColor: '#C52D3A',
        radius: 'rounded',
        buttonRadius: 'pill'
      },
      header: { id: 'headerId', logoBlockId: null, backgroundKind: 'none' },
      footer: { id: 'footerId', backgroundKind: 'surface' }
    })

    expect(campaign.strings).toHaveLength(17)
    expect(campaign.strings.find((s: any) => s.key === 'copy').value).toBe(
      'Copier le lien'
    )
    expect(campaign.strings.find((s: any) => s.key === 'open').value).toBe(
      'Open'
    )

    expect(campaign.pages.map((page: any) => page.kind)).toEqual([
      'landing',
      'regionTemplate'
    ])
    const landing = campaign.pages[0]
    expect(landing.blocks.map((block: any) => block.id)).toEqual([
      'heroId',
      'landingSwitcherId',
      'carouselId',
      'landingJourneyListId',
      'landingAnalyticsId',
      'heroButtonId'
    ])
    expect(landing.blocks[0]).toEqual({
      __typename: 'CampaignHeroBlock',
      id: 'heroId',
      pageId: 'landingPageId',
      parentBlockId: null,
      parentOrder: 0,
      backgroundKind: 'none',
      eyebrow: 'Christmas 2026',
      title: "Partagez l'histoire de Noël",
      lede: 'Pick your region to find a journey in your language, ready to share.',
      titleTranslations: []
    })
    expect(landing.blocks[5]).toEqual({
      __typename: 'CampaignButtonBlock',
      id: 'heroButtonId',
      pageId: 'landingPageId',
      parentBlockId: 'heroId',
      parentOrder: 0,
      label: 'Choose your region',
      placement: 'below'
    })
    expect(campaign.pages[1].blocks.map((block: any) => block.id)).toEqual([
      'regionHeaderId',
      'regionShareId',
      'regionJourneyListId',
      'regionAnalyticsId',
      'regionSwitcherId'
    ])

    expect(campaign.chrome.map((block: any) => block.id)).toEqual([
      'headerId',
      'navHomeId',
      'navResourcesId',
      'footerId',
      'footerCopyrightId',
      'footerTermsId',
      'footerPrivacyId'
    ])
    expect(
      campaign.chrome.find((block: any) => block.id === 'footerTermsId')
    ).toMatchObject({
      label: 'Terms of Use',
      placement: 'below',
      action: {
        __typename: 'CampaignLinkAction',
        url: 'https://www.cru.org/us/en/about/terms-of-use.html'
      }
    })

    expect(campaign.regions).toEqual([
      {
        id: 'eurRegionId',
        slug: 'eur',
        name: 'Europe',
        listed: true,
        order: 0,
        countries: [{ countryId: 'FR', order: 0, country: { id: 'FR' } }],
        languages: [
          {
            languageId: '529',
            order: 0,
            journeyStatus: 'published',
            shortLinkUrl: 'https://short.example.org/eurRegionId-529',
            journeyUrl: 'https://journeys.example.org/eur-journey',
            embedUrl: 'https://example.com/embed/eur-journey'
          }
        ],
        lines: [
          {
            __typename: 'CampaignTypographyBlock',
            id: 'eurLineId',
            content: 'Europe (FR)',
            contentTranslations: []
          }
        ]
      },
      {
        id: 'afrRegionId',
        slug: 'afr',
        name: 'AFR',
        listed: true,
        order: 1,
        countries: [],
        languages: [
          {
            languageId: '529',
            order: 0,
            journeyStatus: 'published',
            shortLinkUrl: 'https://short.example.org/afrRegionId-529',
            journeyUrl: 'https://example.com/afr-journey',
            embedUrl: 'https://example.com/embed/afr-journey'
          }
        ],
        lines: []
      }
    ])

    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'christmas-2026', status: 'published' }
      })
    )
    expect(fetchShortLink).toHaveBeenCalledTimes(2)
    expect(fetchShortLink).toHaveBeenCalledWith(
      'eurRegionId-529-qrCodeId-shortLinkId'
    )
  })

  it('leaves the Share Link null when the gateway no longer knows the short link', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(publishedFixture())
    vi.mocked(fetchShortLink).mockResolvedValue(null)

    const result = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { slug: 'christmas-2026' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignPublic.regions[0].languages[0]).toMatchObject({
      journeyStatus: 'published',
      shortLinkUrl: null,
      journeyUrl: 'https://journeys.example.org/eur-journey'
    })
  })

  it('resolves to the default language when none is requested or the language is not a campaign language', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(publishedFixture())

    const omitted = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { slug: 'christmas-2026' }
    })) as any
    expect(omitted.data.campaignPublic).toMatchObject({
      languageId: '529',
      title: 'Christmas 2026'
    })
    expect(omitted.data.campaignPublic.pages[0].blocks[0].title).toBe(
      'Share the story of Christmas'
    )

    const foreign = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { slug: 'christmas-2026', languageId: '21028' }
    })) as any
    expect(foreign.data.campaignPublic).toMatchObject({
      languageId: '529',
      title: 'Christmas 2026'
    })
  })

  it('treats an unpublished or deleted linked journey as unlinked', async () => {
    const fixture = publishedFixture()
    fixture.regions = (fixture.regions as any[]).map((region) => ({
      ...region,
      languages: region.languages.map((language: any) => ({
        ...language,
        journey:
          region.id === 'eurRegionId'
            ? { ...language.journey, status: 'draft' }
            : { ...language.journey, deletedAt: new Date() }
      }))
    }))
    prismaMock.campaign.findFirst.mockResolvedValue(fixture)

    const result = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { slug: 'christmas-2026' }
    })) as any

    expect(result.data.campaignPublic.regions[0].languages[0]).toEqual({
      languageId: '529',
      order: 0,
      journeyStatus: 'draft',
      shortLinkUrl: null,
      journeyUrl: null,
      embedUrl: null
    })
    expect(result.data.campaignPublic.regions[1].languages[0]).toEqual({
      languageId: '529',
      order: 0,
      journeyStatus: null,
      shortLinkUrl: null,
      journeyUrl: null,
      embedUrl: null
    })
    expect(fetchShortLink).not.toHaveBeenCalled()
  })

  describe('journey list items', () => {
    const CAMPAIGN_PUBLIC_JOURNEYS = graphql(`
      query CampaignPublicJourneys($slug: String, $languageId: ID) {
        campaignPublic(slug: $slug, languageId: $languageId) {
          pages {
            blocks {
              __typename
              id
              parentBlockId
              parentOrder
              ... on CampaignJourneyBlock {
                journeyId
                title
                description
                titleTranslations {
                  languageId
                }
                journeyStatus
                journeyUrl
                journeyImage {
                  src
                  alt
                }
              }
            }
          }
        }
      }
    `)

    function journeyItem(
      fixture: CampaignFixture,
      id: string,
      journeyId: string | null,
      parentOrder: number
    ): Record<string, unknown> {
      return {
        ...fixture.blocks[0],
        id,
        typename: 'CampaignJourneyBlock',
        pageId: 'landingPageId',
        parentBlockId: 'landingJourneyListId',
        parentOrder,
        eyebrow: null,
        title: `${id} title`,
        titleTranslations: {
          [FRENCH]: { value: `${id} titre`, source: 'human' }
        },
        lede: null,
        align: null,
        description: `${id} description`,
        journeyId,
        action: null
      }
    }

    function journeyLive(
      id: string,
      slug: string,
      overrides: Record<string, unknown> = {}
    ): Record<string, unknown> {
      return {
        ...journeyRow(id, slug),
        primaryImageBlock: {
          id: `${id}-image`,
          src: `https://imagedelivery.net/${id}/public`,
          alt: `${slug} image`
        },
        ...overrides
      }
    }

    it('carries the live journeyStatus, the journeyUrl from getJourneyPublicUrl and the primary image src, with the snapshot text resolved', async () => {
      const fixture = publishedFixture()
      fixture.blocks = [
        ...fixture.blocks,
        journeyItem(fixture, 'liveItem', 'liveJourneyId', 0),
        journeyItem(fixture, 'domainItem', 'domainJourneyId', 1),
        journeyItem(fixture, 'draftItem', 'draftJourneyId', 2),
        journeyItem(fixture, 'deletedItem', 'deletedJourneyId', 3),
        journeyItem(fixture, 'goneItem', 'goneJourneyId', 4),
        journeyItem(fixture, 'unlinkedItem', null, 5)
      ] as never
      prismaMock.campaign.findFirst.mockResolvedValue(fixture)
      prismaMock.journey.findMany.mockResolvedValue([
        journeyLive('liveJourneyId', 'live-journey'),
        journeyLive('domainJourneyId', 'domain-journey', {
          team: {
            id: 'journeyTeamId',
            customDomains: [
              { name: 'journeys.example.org', routeAllTeamJourneys: true }
            ]
          }
        }),
        journeyLive('draftJourneyId', 'draft-journey', { status: 'draft' }),
        journeyLive('deletedJourneyId', 'deleted-journey', {
          deletedAt: new Date()
        })
      ] as never)

      const result = (await publicClient({
        document: CAMPAIGN_PUBLIC_JOURNEYS,
        variables: { slug: 'christmas-2026', languageId: FRENCH }
      })) as any

      expect(result.errors).toBeUndefined()
      const items = result.data.campaignPublic.pages
        .flatMap((page: any) => page.blocks)
        .filter((block: any) => block.__typename === 'CampaignJourneyBlock')
      expect(items).toEqual([
        {
          __typename: 'CampaignJourneyBlock',
          id: 'liveItem',
          parentBlockId: 'landingJourneyListId',
          parentOrder: 0,
          journeyId: 'liveJourneyId',
          title: 'liveItem titre',
          description: 'liveItem description',
          titleTranslations: [],
          journeyStatus: 'published',
          journeyUrl: 'https://example.com/live-journey',
          journeyImage: {
            src: 'https://imagedelivery.net/liveJourneyId/public',
            alt: 'live-journey image'
          }
        },
        expect.objectContaining({
          id: 'domainItem',
          journeyStatus: 'published',
          journeyUrl: 'https://journeys.example.org/domain-journey'
        }),
        expect.objectContaining({
          id: 'draftItem',
          journeyStatus: 'draft',
          journeyUrl: null
        }),
        expect.objectContaining({
          id: 'deletedItem',
          journeyStatus: null,
          journeyUrl: null
        }),
        expect.objectContaining({
          id: 'goneItem',
          journeyStatus: null,
          journeyUrl: null,
          journeyImage: null
        }),
        expect.objectContaining({
          id: 'unlinkedItem',
          journeyId: null,
          journeyStatus: null,
          journeyUrl: null
        })
      ])
      expect(prismaMock.journey.findMany).toHaveBeenCalledTimes(1)
    })

    it('reads no journeys when no item links one', async () => {
      prismaMock.campaign.findFirst.mockResolvedValue(publishedFixture())

      const result = (await publicClient({
        document: CAMPAIGN_PUBLIC_JOURNEYS,
        variables: { slug: 'christmas-2026' }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
    })

    it('exposes no tag snapshot and nothing that leads back to the journey', async () => {
      const INTROSPECT = graphql(`
        query CampaignJourneyBlockShape {
          item: __type(name: "CampaignJourneyBlock") {
            fields {
              name
            }
          }
        }
      `)

      const result = (await publicClient({ document: INTROSPECT })) as any
      const names: string[] = result.data.item.fields.map(
        (field: any) => field.name
      )

      expect(names).not.toContain('tag')
      expect(names).not.toContain('journey')
      expect(names).toEqual(
        expect.arrayContaining([
          'journeyId',
          'title',
          'description',
          'journeyStatus',
          'journeyUrl',
          'journeyImage'
        ])
      )
    })
  })

  it('is NOT_FOUND for a draft or unknown slug', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(null)

    const result = await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { slug: 'christmas-2026' }
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
    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'christmas-2026', status: 'published' }
      })
    )
  })

  it('is NOT_FOUND for a malformed slug without reading the database', async () => {
    const result = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { slug: 'Not A Slug!' }
    })) as any

    expect(result.errors[0].extensions.code).toBe('NOT_FOUND')
    expect(prismaMock.campaign.findFirst).not.toHaveBeenCalled()
  })

  it('accepts the hostname key, which is NOT_FOUND until a Campaign Root can be set', async () => {
    const result = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { hostname: 'christmas.example.org' }
    })) as any

    expect(result.errors[0].extensions.code).toBe('NOT_FOUND')
    expect(prismaMock.campaign.findFirst).not.toHaveBeenCalled()
  })

  it('is BAD_USER_INPUT when both or neither of slug and hostname are given', async () => {
    const both = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { slug: 'christmas-2026', hostname: 'christmas.example.org' }
    })) as any
    expect(both.errors[0].extensions.code).toBe('BAD_USER_INPUT')

    const neither = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: {}
    })) as any
    expect(neither.errors[0].extensions.code).toBe('BAD_USER_INPUT')
    expect(prismaMock.campaign.findFirst).not.toHaveBeenCalled()
  })

  it('requires no authentication', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(publishedFixture())

    const result = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { slug: 'christmas-2026' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignPublic.id).toBe('campaignId')
    expect(prismaMock.userRole.findUnique).not.toHaveBeenCalled()
  })

  it('is a narrowed projection: nothing leads to the team, its members or linked-journey internals', async () => {
    const INTROSPECT = graphql(`
      query CampaignPublicShape {
        campaignPublic: __type(name: "CampaignPublic") {
          fields {
            name
          }
        }
        regionLanguage: __type(name: "CampaignRegionLanguagePublic") {
          fields {
            name
          }
        }
        campaign: __type(name: "Campaign") {
          fields {
            name
          }
        }
      }
    `)

    const result = (await publicClient({ document: INTROSPECT })) as any
    const names = (type: any): string[] =>
      type.fields.map((field: any) => field.name)

    expect(names(result.data.campaignPublic)).not.toContain('team')
    expect(names(result.data.campaignPublic)).not.toContain('palette')
    expect(names(result.data.regionLanguage)).not.toContain('journey')
    expect(names(result.data.regionLanguage)).not.toContain('journeyId')
    expect(names(result.data.regionLanguage)).not.toContain('qrCodeId')
    expect(names(result.data.campaign)).toEqual(
      expect.arrayContaining(['team', 'teamId', 'palette', 'blocks'])
    )
  })
})
