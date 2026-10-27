import { render } from '@testing-library/react'
import type { NextSeoProps } from 'next-seo'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import {
  LANDING_PAGE_ID,
  REGION_PAGE_ID,
  campaignPublic,
  chromeBlocks,
  eurRegion,
  heroVideoBlock,
  landingBlocks,
  regionPageBlocks
} from '../testData'
import type { CampaignBlock, CampaignPublic } from '../types'

import { CampaignSeo } from './CampaignSeo'
import { campaignPreferredLocation, campaignSeoProps } from './campaignSeoProps'

const seoCalls: NextSeoProps[] = []
vi.mock('next-seo', () => ({
  NextSeo: (props: NextSeoProps) => {
    seoCalls.push(props)
    return null
  }
}))

const ROOT = {
  origin: 'https://your.nextstep.is',
  basePath: '/campaign/outreach-2026'
}
const CAMPAIGN_ROOT = { origin: 'https://outreach.example.org', basePath: '' }

const landingPoster = {
  __typename: 'CampaignVideoBlock',
  id: 'heroMediaId',
  campaignId: 'campaignId',
  pageId: LANDING_PAGE_ID,
  regionId: null,
  parentBlockId: 'heroId',
  parentOrder: null,
  image: 'https://images.example.org/landing-poster.jpg'
} as unknown as CampaignBlock

const regionHero = {
  ...landingBlocks.find((block) => block.id === 'heroId'),
  id: 'regionHeroId',
  pageId: REGION_PAGE_ID,
  parentOrder: -1,
  description: 'Region description',
  mediaBlockId: 'regionMediaId'
} as CampaignBlock

const regionImage = {
  __typename: 'CampaignImageBlock',
  id: 'regionMediaId',
  campaignId: 'campaignId',
  pageId: REGION_PAGE_ID,
  regionId: null,
  parentBlockId: 'regionHeroId',
  parentOrder: null,
  src: 'https://images.example.org/region.jpg',
  alt: 'Region image',
  width: 1200,
  height: 630
} as unknown as CampaignBlock

const logoBlock = {
  __typename: 'CampaignImageBlock',
  id: 'logoId',
  campaignId: 'campaignId',
  pageId: null,
  regionId: null,
  parentBlockId: 'headerId',
  parentOrder: null,
  src: 'https://images.example.org/logo.png',
  alt: 'Outreach logo',
  width: 320,
  height: 80
} as unknown as CampaignBlock

function withPages(
  landing: CampaignBlock[] = landingBlocks,
  region: CampaignBlock[] = regionPageBlocks,
  overrides: Partial<CampaignPublic> = {}
): CampaignPublic {
  return {
    ...campaignPublic,
    ...overrides,
    pages: [
      { ...campaignPublic.pages[0], blocks: landing },
      { ...campaignPublic.pages[1], blocks: region }
    ]
  }
}

function withLogo(campaign: CampaignPublic = campaignPublic): CampaignPublic {
  const header = { ...campaign.header, logoBlockId: 'logoId' }
  return {
    ...campaign,
    header,
    chrome: [
      ...chromeBlocks.map((block) =>
        block.id === 'headerId' ? header : block
      ),
      logoBlock
    ]
  }
}

function landingHero(overrides: Partial<CampaignBlock>): CampaignBlock[] {
  return landingBlocks.map((block) =>
    block.id === 'heroId'
      ? ({ ...block, ...overrides } as CampaignBlock)
      : block
  )
}

describe('campaignSeoProps', () => {
  describe('title, description and canonical', () => {
    it('uses the translated campaign title and the hero description on the landing page', () => {
      const props = campaignSeoProps(
        campaignPublic,
        CampaignPageKind.landing,
        null,
        ROOT
      )
      expect(props.title).toBe('Outreach 2026')
      expect(props.description).toBe(
        'Pick your region to find a journey in your language, ready to share.'
      )
      expect(props.canonical).toBe(
        'https://your.nextstep.is/campaign/outreach-2026'
      )
      expect(props.noindex).toBeUndefined()
      expect(props.nofollow).toBeUndefined()
    })

    it('titles a region page "<region name> · <campaign title>"', () => {
      const props = campaignSeoProps(
        campaignPublic,
        CampaignPageKind.regionTemplate,
        eurRegion,
        ROOT
      )
      expect(props.title).toBe('Europe · Outreach 2026')
      expect(props.canonical).toBe(
        'https://your.nextstep.is/campaign/outreach-2026/eur'
      )
      expect(props.noindex).toBeUndefined()
    })

    it("describes with the page's hero description, else its title, else nothing", () => {
      expect(
        campaignSeoProps(
          withPages(landingHero({ description: '' })),
          CampaignPageKind.landing,
          null,
          ROOT
        ).description
      ).toBe('Share the story of Outreach')
      expect(
        campaignSeoProps(
          withPages(landingHero({ description: null, title: null })),
          CampaignPageKind.landing,
          null,
          ROOT
        ).description
      ).toBeUndefined()
      expect(
        campaignSeoProps(
          campaignPublic,
          CampaignPageKind.regionTemplate,
          eurRegion,
          ROOT
        ).description
      ).toBeUndefined()
    })

    it('canonicalises to the domain root when the campaign has a Campaign Domain', () => {
      expect(
        campaignSeoProps(
          campaignPublic,
          CampaignPageKind.landing,
          null,
          CAMPAIGN_ROOT
        ).canonical
      ).toBe('https://outreach.example.org/')
      expect(
        campaignSeoProps(
          campaignPublic,
          CampaignPageKind.regionTemplate,
          eurRegion,
          CAMPAIGN_ROOT
        ).canonical
      ).toBe('https://outreach.example.org/eur')
    })
  })

  describe('language alternates', () => {
    const inFrench = {
      ...campaignPublic,
      languageId: '496',
      language: campaignPublic.languages[1].language
    }

    it('emits one hreflang per campaign language at the address it canonicalises to, plus x-default at the bare canonical', () => {
      expect(
        campaignSeoProps(campaignPublic, CampaignPageKind.landing, null, ROOT)
          .languageAlternates
      ).toEqual([
        {
          hrefLang: 'en',
          href: 'https://your.nextstep.is/campaign/outreach-2026'
        },
        {
          hrefLang: 'fr',
          href: 'https://your.nextstep.is/campaign/outreach-2026?lang=fr'
        },
        {
          hrefLang: 'x-default',
          href: 'https://your.nextstep.is/campaign/outreach-2026'
        }
      ])
    })

    it('points each alternate at the Region Page and the Campaign Domain in the preferred form', () => {
      expect(
        campaignSeoProps(
          campaignPublic,
          CampaignPageKind.regionTemplate,
          eurRegion,
          CAMPAIGN_ROOT
        ).languageAlternates
      ).toEqual([
        { hrefLang: 'en', href: 'https://outreach.example.org/eur' },
        { hrefLang: 'fr', href: 'https://outreach.example.org/eur?lang=fr' },
        { hrefLang: 'x-default', href: 'https://outreach.example.org/eur' }
      ])
    })

    it('keeps the same alternates whichever language the page was served in', () => {
      expect(
        campaignSeoProps(inFrench, CampaignPageKind.landing, null, ROOT)
          .languageAlternates
      ).toEqual(
        campaignSeoProps(campaignPublic, CampaignPageKind.landing, null, ROOT)
          .languageAlternates
      )
    })

    it('emits none for a single-language campaign', () => {
      const campaign = {
        ...campaignPublic,
        languages: [campaignPublic.languages[0]]
      }
      expect(
        campaignSeoProps(campaign, CampaignPageKind.landing, null, ROOT)
          .languageAlternates
      ).toEqual([])
    })

    it('skips a language without a bcp47 tag', () => {
      const campaign = {
        ...campaignPublic,
        languages: [
          campaignPublic.languages[0],
          {
            ...campaignPublic.languages[1],
            language: { ...campaignPublic.languages[1].language, bcp47: null }
          }
        ]
      }
      expect(
        campaignSeoProps(campaign, CampaignPageKind.landing, null, ROOT)
          .languageAlternates
      ).toEqual([
        {
          hrefLang: 'en',
          href: 'https://your.nextstep.is/campaign/outreach-2026'
        },
        {
          hrefLang: 'x-default',
          href: 'https://your.nextstep.is/campaign/outreach-2026'
        }
      ])
    })

    it('makes the canonical and og:url name the served language, matching its alternate', () => {
      const props = campaignSeoProps(
        inFrench,
        CampaignPageKind.landing,
        null,
        ROOT
      )
      expect(props.canonical).toBe(
        'https://your.nextstep.is/campaign/outreach-2026?lang=fr'
      )
      expect(props.openGraph?.url).toBe(props.canonical)
      expect(props.languageAlternates).toContainEqual({
        hrefLang: 'fr',
        href: props.canonical
      })
    })

    it('keeps the bare canonical on a page served in the campaign default', () => {
      expect(
        campaignSeoProps(campaignPublic, CampaignPageKind.landing, null, ROOT)
          .canonical
      ).toBe('https://your.nextstep.is/campaign/outreach-2026')
    })
  })

  describe('Open Graph and Twitter', () => {
    it('is a website named after the campaign with no image when there is no hero media or logo', () => {
      const props = campaignSeoProps(
        campaignPublic,
        CampaignPageKind.landing,
        null,
        ROOT
      )
      expect(props.openGraph).toEqual({
        type: 'website',
        title: 'Outreach 2026',
        description:
          'Pick your region to find a journey in your language, ready to share.',
        url: 'https://your.nextstep.is/campaign/outreach-2026',
        site_name: 'Outreach 2026',
        images: []
      })
      expect(props.twitter).toEqual({
        site: '@YourNextStepIs',
        cardType: 'summary_large_image'
      })
    })

    it('uses the hero media poster (a video image) as the image', () => {
      const campaign = withPages([
        ...landingHero({ mediaBlockId: 'heroMediaId' }),
        landingPoster
      ])
      const props = campaignSeoProps(
        withLogo(campaign),
        CampaignPageKind.landing,
        null,
        ROOT
      )
      expect(props.openGraph?.images).toEqual([
        {
          url: 'https://images.example.org/landing-poster.jpg',
          width: undefined,
          height: undefined,
          alt: 'Outreach 2026'
        }
      ])
    })

    it("uses a Watch hero video's banner as its poster", () => {
      const campaign = withPages([
        ...landingHero({ mediaBlockId: heroVideoBlock.id }),
        heroVideoBlock
      ])
      const props = campaignSeoProps(
        withLogo(campaign),
        CampaignPageKind.landing,
        null,
        ROOT
      )
      expect(props.openGraph?.images).toEqual([
        {
          url: 'https://imagedelivery.net/accountHash/storyVideoId/mobileCinematicHigh',
          width: undefined,
          height: undefined,
          alt: 'Outreach 2026'
        }
      ])
    })

    it("uses a region page's own hero image src when it has one", () => {
      const campaign = withPages(
        [...landingHero({ mediaBlockId: 'heroMediaId' }), landingPoster],
        [regionHero, regionImage, ...regionPageBlocks]
      )
      const props = campaignSeoProps(
        campaign,
        CampaignPageKind.regionTemplate,
        eurRegion,
        ROOT
      )
      expect(props.openGraph?.images).toEqual([
        {
          url: 'https://images.example.org/region.jpg',
          width: 1200,
          height: 630,
          alt: 'Region image'
        }
      ])
      expect(props.description).toBe('Region description')
    })

    it('inherits the landing hero image on a region page whose hero has none', () => {
      const campaign = withPages([
        ...landingHero({ mediaBlockId: 'heroMediaId' }),
        landingPoster
      ])
      const props = campaignSeoProps(
        campaign,
        CampaignPageKind.regionTemplate,
        eurRegion,
        ROOT
      )
      expect(props.openGraph?.images?.[0]?.url).toBe(
        'https://images.example.org/landing-poster.jpg'
      )
    })

    it('falls back to the header logo, on both pages', () => {
      expect(
        campaignSeoProps(withLogo(), CampaignPageKind.landing, null, ROOT)
          .openGraph?.images
      ).toEqual([
        {
          url: 'https://images.example.org/logo.png',
          width: 320,
          height: 80,
          alt: 'Outreach logo'
        }
      ])
      expect(
        campaignSeoProps(
          withLogo(),
          CampaignPageKind.regionTemplate,
          eurRegion,
          ROOT
        ).openGraph?.images?.[0]?.url
      ).toBe('https://images.example.org/logo.png')
    })
  })
})

describe('CampaignSeo', () => {
  beforeEach(() => {
    seoCalls.length = 0
  })

  it('renders NextSeo with the built props', () => {
    render(
      <CampaignSeo
        campaign={campaignPublic}
        pageKind={CampaignPageKind.regionTemplate}
        region={eurRegion}
        rootDomain="your.nextstep.is"
      />
    )
    expect(seoCalls).toHaveLength(1)
    expect(seoCalls[0]).toEqual(
      campaignSeoProps(
        campaignPublic,
        CampaignPageKind.regionTemplate,
        eurRegion,
        ROOT
      )
    )
    expect(seoCalls[0].title).toBe('Europe · Outreach 2026')
  })

  it('canonicalises to the domain-root form when the campaign has a Campaign Domain', () => {
    render(
      <CampaignSeo
        campaign={{
          ...campaignPublic,
          customDomainNames: ['outreach.example.org', 'other.example.org']
        }}
        pageKind={CampaignPageKind.regionTemplate}
        region={eurRegion}
        rootDomain="your.nextstep.is"
      />
    )
    expect(seoCalls[0].canonical).toBe('https://outreach.example.org/eur')
  })
})

describe('campaignPreferredLocation', () => {
  const rootDomain = 'your.nextstep.is'

  it('names the root-domain campaign path when the campaign has no Campaign Domain', () => {
    expect(
      campaignPreferredLocation({ campaign: campaignPublic, rootDomain })
    ).toEqual(ROOT)
  })

  it('names the first attached domain as the preferred address', () => {
    expect(
      campaignPreferredLocation({
        campaign: {
          ...campaignPublic,
          customDomainNames: ['outreach.example.org', 'other.example.org']
        },
        rootDomain
      })
    ).toEqual(CAMPAIGN_ROOT)
  })
})
