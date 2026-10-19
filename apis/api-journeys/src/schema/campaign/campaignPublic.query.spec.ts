import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import {
  CampaignBlockRow,
  CampaignFixture,
  campaignFactory
} from '../../../test/campaignFactory'
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
        description: null,
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
        customDomainNames
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
            title
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
              description
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
        buttonRadius: 'veryRounded'
      },
      header: {
        id: 'headerId',
        logoBlockId: 'headerLogoId',
        backgroundKind: 'none'
      },
      footer: { id: 'footerId', backgroundKind: 'surface' }
    })

    expect(campaign.strings).toHaveLength(18)
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
      description: 'Pick your region to find a journey in your language, ready to share.',
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
      'headerLogoId',
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
            title: 'EUR journey',
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
            title: 'AFR journey',
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

  it('renders the page without Share Links when the gateway lookup fails', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(publishedFixture())
    vi.mocked(fetchShortLink).mockRejectedValue(new Error('gateway down'))

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

  describe('the Video Carousel', () => {
    const CAMPAIGN_PUBLIC_CAROUSEL = graphql(`
      query CampaignPublicCarousel($slug: String) {
        campaignPublic(slug: $slug) {
          pages {
            blocks {
              __typename
              id
              parentBlockId
              parentOrder
              ... on CampaignVideoCarouselBlock {
                videoId
                videoVariantLanguageId
                video {
                  __typename
                  id
                  primaryLanguageId
                }
              }
              ... on CampaignVideoBlock {
                source
                videoId
              }
            }
          }
        }
      }
    `)

    function carouselFixture(
      carousel: Partial<CampaignBlockRow>
    ): CampaignFixture & Record<string, unknown> {
      const fixture = publishedFixture()
      const row = fixture.blocks.find((block) => block.id === 'carouselId')!
      const item = (id: string, parentOrder: number): CampaignBlockRow => ({
        ...row,
        id,
        typename: 'CampaignVideoBlock',
        parentBlockId: 'carouselId',
        parentOrder,
        eyebrow: null,
        title: null,
        source: 'youTube',
        videoId: id
      })
      return {
        ...fixture,
        blocks: [
          ...fixture.blocks.map((block) =>
            block.id === 'carouselId' ? { ...block, ...carousel } : block
          ),
          item('firstItemId', 0),
          item('secondItemId', 1)
        ]
      }
    }

    it('returns an expanded carousel’s video as a federation reference key only, fetching nothing', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      prismaMock.campaign.findFirst.mockResolvedValue(
        carouselFixture({
          videoId: 'collectionVideoId',
          videoVariantLanguageId: '529'
        })
      )

      const result = (await publicClient({
        document: CAMPAIGN_PUBLIC_CAROUSEL,
        variables: { slug: 'christmas-2026' }
      })) as any

      expect(result.errors).toBeUndefined()
      const blocks = result.data.campaignPublic.pages[0].blocks
      expect(blocks.find((block: any) => block.id === 'carouselId')).toEqual({
        __typename: 'CampaignVideoCarouselBlock',
        id: 'carouselId',
        parentBlockId: null,
        parentOrder: 2,
        videoId: 'collectionVideoId',
        videoVariantLanguageId: '529',
        video: {
          __typename: 'Video',
          id: 'collectionVideoId',
          primaryLanguageId: '529'
        }
      })
      // Expansion is the gateway's join: api-journeys fetches and caches nothing.
      expect(fetchSpy).not.toHaveBeenCalled()
      fetchSpy.mockRestore()
    })

    it('returns a null video in explicit mode, with the items as ordered CampaignVideoBlock children', async () => {
      prismaMock.campaign.findFirst.mockResolvedValue(carouselFixture({}))

      const result = (await publicClient({
        document: CAMPAIGN_PUBLIC_CAROUSEL,
        variables: { slug: 'christmas-2026' }
      })) as any

      expect(result.errors).toBeUndefined()
      const blocks = result.data.campaignPublic.pages[0].blocks
      expect(
        blocks.find((block: any) => block.id === 'carouselId').video
      ).toBeNull()
      expect(
        blocks
          .filter((block: any) => block.parentBlockId === 'carouselId')
          .map((block: any) => [block.id, block.parentOrder])
      ).toEqual([
        ['firstItemId', 0],
        ['secondItemId', 1]
      ])
    })
  })

  describe('owned Campaign Videos', () => {
    const CAMPAIGN_PUBLIC_VIDEOS = graphql(`
      query CampaignPublicVideos($slug: String, $languageId: ID) {
        campaignPublic(slug: $slug, languageId: $languageId) {
          pages {
            kind
            blocks {
              __typename
              id
              parentBlockId
              parentOrder
              ... on CampaignHeroBlock {
                mediaBlockId
              }
              ... on CampaignFeaturedMediaBlock {
                mediaSide
                layout
                mediaBlockId
              }
              ... on CampaignVideoBlock {
                source
                videoId
                videoVariantLanguageId
                title
                titleTranslations {
                  languageId
                }
                description
                image
                duration
                mediaVideo {
                  __typename
                  # Video's primaryLanguageId is ID!, the others' ID: alias one.
                  ... on Video {
                    id
                    videoPrimaryLanguageId: primaryLanguageId
                  }
                  ... on YouTube {
                    id
                    primaryLanguageId
                  }
                  ... on MuxVideo {
                    id
                    primaryLanguageId
                  }
                }
              }
            }
          }
        }
      }
    `)

    function videoRow(
      fixture: CampaignFixture,
      row: Partial<CampaignBlockRow>
    ): CampaignBlockRow {
      const hero = fixture.blocks.find((block) => block.id === 'heroId')!
      return {
        ...hero,
        typename: 'CampaignVideoBlock',
        parentOrder: null,
        eyebrow: null,
        title: null,
        titleTranslations: null,
        description: null,
        align: null,
        action: null,
        ...row
      }
    }

    function videoFixture(): CampaignFixture & Record<string, unknown> {
      const fixture = publishedFixture()
      const hero = fixture.blocks.find((block) => block.id === 'heroId')!
      return {
        ...fixture,
        blocks: [
          ...fixture.blocks.map((block) =>
            block.id === 'heroId'
              ? { ...block, mediaBlockId: 'heroVideoId' }
              : block
          ),
          {
            ...hero,
            id: 'youTubeSectionId',
            typename: 'CampaignFeaturedMediaBlock',
            parentOrder: 5,
            titleTranslations: null,
            mediaSide: 'left' as const,
            layout: 'stacked' as const,
            mediaBlockId: 'youTubeVideoId'
          },
          {
            ...hero,
            id: 'muxSectionId',
            typename: 'CampaignFeaturedMediaBlock',
            parentOrder: 6,
            titleTranslations: null,
            mediaSide: null,
            mediaBlockId: 'muxVideoId'
          },
          videoRow(fixture, {
            id: 'heroVideoId',
            parentBlockId: 'heroId',
            source: 'internal',
            videoId: '1_jf-0-0',
            videoVariantLanguageId: '529',
            description: 'Our description',
            descriptionTranslations: {
              [FRENCH]: { value: 'Notre description', source: 'human' }
            }
          }),
          videoRow(fixture, {
            id: 'youTubeVideoId',
            parentBlockId: 'youTubeSectionId',
            source: 'youTube',
            videoId: 'jQaN9DvFTbw',
            title: 'YouTube title',
            titleTranslations: {
              [FRENCH]: { value: 'Titre YouTube', source: 'machine' }
            },
            description: 'YouTube description',
            image: 'https://i.ytimg.com/vi/jQaN9DvFTbw/hqdefault.jpg',
            duration: 120
          }),
          videoRow(fixture, {
            id: 'muxVideoId',
            parentBlockId: 'muxSectionId',
            source: 'mux',
            videoId: 'muxAssetId',
            title: 'Mux title',
            image: 'https://image.mux.com/playbackId/thumbnail.png?time=1',
            duration: 90
          })
        ]
      }
    }

    it('returns each section’s owned video in pages[].blocks with mediaVideo as an unresolved federation reference by source', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      prismaMock.campaign.findFirst.mockResolvedValue(videoFixture())

      const result = (await publicClient({
        document: CAMPAIGN_PUBLIC_VIDEOS,
        variables: { slug: 'christmas-2026' }
      })) as any

      expect(result.errors).toBeUndefined()
      const blocks = result.data.campaignPublic.pages[0].blocks
      const byId = (id: string): any =>
        blocks.find((block: any) => block.id === id)

      expect(byId('heroId')).toMatchObject({ mediaBlockId: 'heroVideoId' })
      expect(byId('youTubeSectionId')).toMatchObject({
        __typename: 'CampaignFeaturedMediaBlock',
        mediaSide: 'left',
        layout: 'stacked',
        mediaBlockId: 'youTubeVideoId'
      })
      expect(byId('muxSectionId').mediaSide).toBe('right')
      expect(byId('muxSectionId').layout).toBe('sideBySide')

      expect(byId('heroVideoId')).toEqual({
        __typename: 'CampaignVideoBlock',
        id: 'heroVideoId',
        parentBlockId: 'heroId',
        parentOrder: null,
        source: 'internal',
        videoId: '1_jf-0-0',
        videoVariantLanguageId: '529',
        title: null,
        titleTranslations: [],
        description: 'Our description',
        image: null,
        duration: null,
        mediaVideo: {
          __typename: 'Video',
          id: '1_jf-0-0',
          videoPrimaryLanguageId: '529'
        }
      })
      expect(byId('youTubeVideoId')).toMatchObject({
        parentBlockId: 'youTubeSectionId',
        parentOrder: null,
        title: 'YouTube title',
        image: 'https://i.ytimg.com/vi/jQaN9DvFTbw/hqdefault.jpg',
        duration: 120,
        mediaVideo: {
          __typename: 'YouTube',
          id: 'jQaN9DvFTbw',
          primaryLanguageId: null
        }
      })
      expect(byId('muxVideoId').mediaVideo).toEqual({
        __typename: 'MuxVideo',
        id: 'muxAssetId',
        primaryLanguageId: null
      })
      // The gateway resolves the reference; api-journeys never fetches the video.
      expect(fetchSpy).not.toHaveBeenCalled()
      fetchSpy.mockRestore()
    })

    it('resolves a video’s title and description overrides to the requested language like other text', async () => {
      prismaMock.campaign.findFirst.mockResolvedValue(videoFixture())

      const result = (await publicClient({
        document: CAMPAIGN_PUBLIC_VIDEOS,
        variables: { slug: 'christmas-2026', languageId: FRENCH }
      })) as any

      expect(result.errors).toBeUndefined()
      const blocks = result.data.campaignPublic.pages[0].blocks
      const byId = (id: string): any =>
        blocks.find((block: any) => block.id === id)
      expect(byId('heroVideoId')).toMatchObject({
        title: null,
        description: 'Notre description'
      })
      expect(byId('youTubeVideoId')).toMatchObject({
        title: 'Titre YouTube',
        titleTranslations: [],
        description: 'YouTube description'
      })
      expect(byId('muxVideoId')).toMatchObject({
        title: 'Mux title',
        description: null
      })
    })

    it('returns a null mediaVideo for a video row without an id', async () => {
      const fixture = videoFixture()
      fixture.blocks = (fixture.blocks as any[]).map((block) =>
        block.id === 'heroVideoId' ? { ...block, videoId: null } : block
      )
      prismaMock.campaign.findFirst.mockResolvedValue(fixture)

      const result = (await publicClient({
        document: CAMPAIGN_PUBLIC_VIDEOS,
        variables: { slug: 'christmas-2026' }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(
        result.data.campaignPublic.pages[0].blocks.find(
          (block: any) => block.id === 'heroVideoId'
        ).mediaVideo
      ).toBeNull()
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
      title: null,
      shortLinkUrl: null,
      journeyUrl: null,
      embedUrl: null
    })
    expect(result.data.campaignPublic.regions[1].languages[0]).toEqual({
      languageId: '529',
      order: 0,
      journeyStatus: null,
      title: null,
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
        journeyItem(fixture, 'domainItem', 'domainJourneyId', 1)
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
        })
      ])
      expect(prismaMock.journey.findMany).toHaveBeenCalledTimes(1)
    })

    it('keeps a card whose journey is archived, with its address', async () => {
      const fixture = publishedFixture()
      fixture.blocks = [
        ...fixture.blocks,
        journeyItem(fixture, 'archivedItem', 'archivedJourneyId', 0)
      ] as never
      prismaMock.campaign.findFirst.mockResolvedValue(fixture)
      prismaMock.journey.findMany.mockResolvedValue([
        journeyLive('archivedJourneyId', 'archived-journey', {
          status: 'archived'
        })
      ] as never)

      const result = (await publicClient({
        document: CAMPAIGN_PUBLIC_JOURNEYS,
        variables: { slug: 'christmas-2026' }
      })) as any

      expect(result.errors).toBeUndefined()
      const items = result.data.campaignPublic.pages
        .flatMap((page: any) => page.blocks)
        .filter((block: any) => block.__typename === 'CampaignJourneyBlock')
      expect(items).toEqual([
        expect.objectContaining({
          id: 'archivedItem',
          journeyStatus: 'archived',
          journeyUrl: 'https://example.com/archived-journey'
        })
      ])
    })

    it('leaves out cards whose journey is draft, trashed, deleted, missing or unlinked', async () => {
      const fixture = publishedFixture()
      fixture.blocks = [
        ...fixture.blocks,
        journeyItem(fixture, 'liveItem', 'liveJourneyId', 0),
        journeyItem(fixture, 'draftItem', 'draftJourneyId', 1),
        journeyItem(fixture, 'trashedItem', 'trashedJourneyId', 2),
        journeyItem(fixture, 'deletedItem', 'deletedJourneyId', 3),
        journeyItem(fixture, 'goneItem', 'goneJourneyId', 4),
        journeyItem(fixture, 'unlinkedItem', null, 5)
      ] as never
      prismaMock.campaign.findFirst.mockResolvedValue(fixture)
      prismaMock.journey.findMany.mockResolvedValue([
        journeyLive('liveJourneyId', 'live-journey'),
        journeyLive('draftJourneyId', 'draft-journey', { status: 'draft' }),
        journeyLive('trashedJourneyId', 'trashed-journey', {
          status: 'trashed'
        }),
        journeyLive('deletedJourneyId', 'deleted-journey', {
          deletedAt: new Date()
        })
      ] as never)

      const result = (await publicClient({
        document: CAMPAIGN_PUBLIC_JOURNEYS,
        variables: { slug: 'christmas-2026' }
      })) as any

      expect(result.errors).toBeUndefined()
      const ids = result.data.campaignPublic.pages
        .flatMap((page: any) => page.blocks)
        .filter((block: any) => block.__typename === 'CampaignJourneyBlock')
        .map((block: any) => block.id)
      expect(ids).toEqual(['liveItem'])
      expect(JSON.stringify(result.data)).not.toMatch(
        /draftJourneyId|trashedJourneyId|deletedJourneyId|goneJourneyId|draftItem|deletedItem/
      )
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

  it("returns the domain's published Campaign Root for a hostname", async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({
      ...publishedFixture(),
      customDomains: [
        { name: 'christmas.example.org' },
        { name: 'z.example.org' }
      ]
    } as any)

    const result = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { hostname: 'christmas.example.org' }
    })) as any

    expect(result.data.campaignPublic).toMatchObject({
      id: 'campaignId',
      slug: 'christmas-2026',
      customDomainNames: ['christmas.example.org', 'z.example.org']
    })
    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'published',
          customDomains: { some: { name: 'christmas.example.org' } }
        }
      })
    )
  })

  it('is NOT_FOUND for a hostname with no Campaign Root or a draft one, so the route falls through', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(null)

    const result = (await publicClient({
      document: CAMPAIGN_PUBLIC,
      variables: { hostname: 'christmas.example.org' }
    })) as any

    expect(result.errors[0].extensions.code).toBe('NOT_FOUND')
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

describe('campaignPublic languages', () => {
  const publicClient = getClient()

  const CAMPAIGN_PUBLIC_LANGUAGES = graphql(`
    query CampaignPublicLanguages($slug: String, $languageId: ID) {
      campaignPublic(slug: $slug, languageId: $languageId) {
        languageId
        languages {
          languageId
          order
          language {
            id
          }
        }
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the Page Languages in CampaignLanguage.order, each resolving to its api-languages Language for bcp47 and autonym', async () => {
    // Order comes from the Prisma read; the gateway fills `language.bcp47`
    // and `language.name(primary: true)` from api-languages through the
    // `Language` entity reference.
    prismaMock.campaign.findFirst.mockResolvedValue(publishedFixture())

    const result = (await publicClient({
      document: CAMPAIGN_PUBLIC_LANGUAGES,
      variables: { slug: 'christmas-2026', languageId: FRENCH }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignPublic).toEqual({
      languageId: FRENCH,
      languages: [
        { languageId: '529', order: 0, language: { id: '529' } },
        { languageId: FRENCH, order: 1, language: { id: FRENCH } }
      ]
    })
    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          languages: { orderBy: { order: 'asc' } }
        })
      })
    )
  })
})
