import { render } from '@testing-library/react'
import type { NextSeoProps } from 'next-seo'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import {
  LANDING_PAGE_ID,
  REGION_PAGE_ID,
  campaignPublic,
  chromeBlocks,
  eurRegion,
  landingBlocks,
  regionPageBlocks
} from '../testData'
import type { CampaignBlock, CampaignPublic } from '../types'

import { CampaignSeo } from './CampaignSeo'
import { campaignSeoProps } from './campaignSeoProps'

const seoCalls: NextSeoProps[] = []
vi.mock('next-seo', () => ({
  NextSeo: (props: NextSeoProps) => {
    seoCalls.push(props)
    return null
  }
}))

const ROOT = {
  origin: 'https://your.nextstep.is',
  basePath: '/campaign/christmas-2026'
}
const CAMPAIGN_ROOT = { origin: 'https://christmas.example.org', basePath: '' }

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
  lede: 'Region lede',
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
  alt: 'Christmas logo',
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
    it('uses the translated campaign title and the hero lede on the landing page', () => {
      const props = campaignSeoProps(
        campaignPublic,
        CampaignPageKind.landing,
        null,
        ROOT
      )
      expect(props.title).toBe('Christmas 2026')
      expect(props.description).toBe(
        'Pick your region to find a journey in your language, ready to share.'
      )
      expect(props.canonical).toBe(
        'https://your.nextstep.is/campaign/christmas-2026'
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
      expect(props.title).toBe('Europe · Christmas 2026')
      expect(props.canonical).toBe(
        'https://your.nextstep.is/campaign/christmas-2026/eur'
      )
      expect(props.noindex).toBeUndefined()
    })

    it("describes with the page's hero lede, else its title, else nothing", () => {
      expect(
        campaignSeoProps(
          withPages(landingHero({ lede: '' })),
          CampaignPageKind.landing,
          null,
          ROOT
        ).description
      ).toBe('Share the story of Christmas')
      expect(
        campaignSeoProps(
          withPages(landingHero({ lede: null, title: null })),
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

    it('canonicalises to the domain root when a Campaign Root is attached', () => {
      expect(
        campaignSeoProps(
          campaignPublic,
          CampaignPageKind.landing,
          null,
          CAMPAIGN_ROOT
        ).canonical
      ).toBe('https://christmas.example.org/')
      expect(
        campaignSeoProps(
          campaignPublic,
          CampaignPageKind.regionTemplate,
          eurRegion,
          CAMPAIGN_ROOT
        ).canonical
      ).toBe('https://christmas.example.org/eur')
    })
  })

  describe('language alternates', () => {
    it('emits no hreflang alternates until the languages ticket serves the lang param', () => {
      // The pages are ISR and never read `?lang`, and no mutation can add a
      // second campaign language, so every alternate would advertise an
      // unserved URL and conflict with the canonical tag.
      for (const props of [
        campaignSeoProps(campaignPublic, CampaignPageKind.landing, null, ROOT),
        campaignSeoProps(
          campaignPublic,
          CampaignPageKind.regionTemplate,
          eurRegion,
          ROOT
        )
      ]) {
        expect(props.languageAlternates).toBeUndefined()
      }
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
        title: 'Christmas 2026',
        description:
          'Pick your region to find a journey in your language, ready to share.',
        url: 'https://your.nextstep.is/campaign/christmas-2026',
        site_name: 'Christmas 2026',
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
          alt: 'Christmas 2026'
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
      expect(props.description).toBe('Region lede')
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
          alt: 'Christmas logo'
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
        origin="https://your.nextstep.is"
        basePath="/campaign/christmas-2026"
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
    expect(seoCalls[0].title).toBe('Europe · Christmas 2026')
  })
})
