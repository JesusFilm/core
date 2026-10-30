import { MockedProvider } from '@apollo/client/testing/react'
import { ThemeProvider } from '@mui/material/styles'
import { render, screen, waitFor, within } from '@testing-library/react'

import {
  CampaignColumnsRatio,
  CampaignPageKind,
  CampaignStringKey
} from '../../../../__generated__/globalTypes'
import { styleText } from '../../../test/emotionStyles'
import { GET_CAMPAIGN_STATS } from '../CampaignAnalytics'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import {
  LANDING_PAGE_ID,
  REGION_PAGE_ID,
  afrRegion,
  campaignPublic,
  campaignStatsFixture,
  columnSlot,
  eurRegion,
  featuredMediaImageBlock,
  featuredMediaSectionBlock,
  heroVideoBlock,
  landingBlocks,
  regionPageBlocks,
  section
} from '../testData'
import type { CampaignBlock, CampaignPublic, CampaignRegion } from '../types'

import { CampaignPage } from './CampaignPage'

const theme = createCampaignTheme(campaignPublic.theme, false)

function withLanding(
  blocks: CampaignBlock[],
  overrides: Partial<CampaignPublic> = {}
): CampaignPublic {
  return {
    ...campaignPublic,
    ...overrides,
    pages: [{ ...campaignPublic.pages[0], blocks }, campaignPublic.pages[1]]
  }
}

function withRegionPage(blocks: CampaignBlock[]): CampaignPublic {
  return {
    ...campaignPublic,
    pages: [campaignPublic.pages[0], { ...campaignPublic.pages[1], blocks }]
  }
}

const noJourneysCleared = campaignPublic.strings.map((string) =>
  string.key === CampaignStringKey.noJourneys
    ? { ...string, value: '' }
    : string
)

function renderPage(
  campaign: CampaignPublic,
  pageKind = CampaignPageKind.landing,
  region: CampaignRegion | null = null,
  mocks: Array<Record<string, unknown>> = []
) {
  return render(
    <MockedProvider mocks={mocks as never}>
      <ThemeProvider theme={theme}>
        <CampaignPage campaign={campaign} pageKind={pageKind} region={region} />
      </ThemeProvider>
    </MockedProvider>
  )
}

function bandIds(): string[] {
  return Array.from(document.querySelectorAll('section[id]')).map(
    (node) => node.id
  )
}

function pick(
  id: string,
  overrides: Partial<CampaignBlock> = {}
): CampaignBlock {
  const block = landingBlocks.find((candidate) => candidate.id === id)
  if (block == null) throw new Error(`no fixture block ${id}`)
  return { ...block, ...overrides } as CampaignBlock
}

describe('CampaignPage', () => {
  it('renders the landing page: the seeded sections in order between the chrome', () => {
    renderPage(campaignPublic)
    expect(screen.getByTestId('CampaignHeader')).toBeInTheDocument()
    expect(screen.getByTestId('CampaignFooter')).toBeInTheDocument()
    expect(bandIds()).toEqual([
      'heroId',
      'landingSwitcherId',
      'carouselId',
      'landingJourneyListId',
      'landingAnalyticsId'
    ])
    expect(
      screen.getByRole('link', { name: 'Choose your region' })
    ).toHaveAttribute('href', '#landingSwitcherId')
  })

  it('renders the region page for a region: header, share, lists, analytics, switcher', () => {
    renderPage(campaignPublic, CampaignPageKind.regionTemplate, eurRegion)
    expect(bandIds()).toEqual([
      'regionHeaderId',
      'regionShareId',
      'regionJourneyListId',
      'regionAnalyticsId',
      'regionSwitcherId'
    ])
    expect(screen.getByTestId('CampaignRegionName')).toHaveTextContent('Europe')
  })

  it('renders the same Region Page rows for every region; region-only sections read the region from the request', () => {
    const { unmount } = renderPage(
      campaignPublic,
      CampaignPageKind.regionTemplate,
      eurRegion
    )
    const eurBands = bandIds()
    expect(screen.getByTestId('CampaignRegionName')).toHaveTextContent('Europe')
    expect(
      screen.queryByTestId('CampaignRegionCard-eurRegionId')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('CampaignRegionCard-afrRegionId')
    ).toBeInTheDocument()
    unmount()

    renderPage(campaignPublic, CampaignPageKind.regionTemplate, afrRegion)
    expect(bandIds()).toEqual(eurBands)
    expect(screen.getByTestId('CampaignRegionName')).toHaveTextContent('Africa')
    expect(
      screen.queryByTestId('CampaignRegionCard-afrRegionId')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).toBeInTheDocument()
  })

  it('renders the Region Page for an orphan region too, hidden from the switcher', () => {
    const orphan = { ...afrRegion, listed: false }
    renderPage(
      { ...campaignPublic, regions: [eurRegion, orphan] },
      CampaignPageKind.regionTemplate,
      orphan
    )
    expect(screen.getByTestId('CampaignRegionName')).toHaveTextContent('Africa')
    expect(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('CampaignRegionCard-afrRegionId')
    ).not.toBeInTheDocument()
  })

  describe('chrome', () => {
    function chromeRows(): { nav: string[]; lines: string[]; links: string[] } {
      const nav = within(screen.getByTestId('CampaignHeaderNav'))
        .getAllByTestId('CampaignButton')
        .map((button) => button.textContent ?? '')
      const lines = within(screen.getByTestId('CampaignFooterLines'))
        .getAllByTestId('CampaignTypography')
        .map((line) => line.textContent ?? '')
      const links = within(screen.getByTestId('CampaignFooterLinks'))
        .getAllByRole('link')
        .map((link) => link.textContent ?? '')
      return { nav, lines, links }
    }

    it('renders the header and footer rows the same way on landing and region pages; only the back-chip slot differs', () => {
      const { unmount } = renderPage(campaignPublic)
      const landing = chromeRows()
      expect(landing).toEqual({
        nav: ['Home', 'Resources'],
        lines: ['© 2026 Jesus Film Project'],
        links: ['Terms of Use', 'Your Privacy']
      })
      expect(screen.getByTestId('CampaignBrandMarkTitle')).toHaveTextContent(
        'Outreach 2026'
      )
      expect(
        screen.queryByTestId('CampaignAllRegionsChip')
      ).not.toBeInTheDocument()
      unmount()

      renderPage(campaignPublic, CampaignPageKind.regionTemplate, eurRegion)
      expect(chromeRows()).toEqual(landing)
      expect(screen.getByTestId('CampaignBrandMarkTitle')).toHaveTextContent(
        'Outreach 2026'
      )
      expect(screen.getByTestId('CampaignAllRegionsChip')).toHaveAttribute(
        'href',
        '/campaign/outreach-2026?lang=en'
      )
    })

    it('orders the header before the sections and the footer after them', () => {
      renderPage(campaignPublic)
      const page = screen.getByTestId('CampaignPage')
      const order = Array.from(page.children).map((child) => child.tagName)
      expect(order).toEqual(['HEADER', 'MAIN', 'FOOTER'])
    })
  })

  describe('empty-state matrix', () => {
    it('an empty text field renders nothing and editor hints never render', () => {
      renderPage(
        withLanding([
          pick('heroId', { eyebrow: '', description: null }),
          pick('heroButtonId'),
          pick('landingJourneyListId', { eyebrow: null, description: '' }),
          pick('journeyListNoteId', { content: '' })
        ])
      )
      const main = within(screen.getByRole('main'))
      expect(main.queryByTestId('CampaignEyebrow')).not.toBeInTheDocument()
      expect(main.queryByTestId('CampaignDescription')).not.toBeInTheDocument()
      expect(main.queryByTestId('CampaignTypography')).not.toBeInTheDocument()
      expect(screen.queryByText(/your text/i)).not.toBeInTheDocument()
      expect(
        screen.queryByText(/add your first region/i)
      ).not.toBeInTheDocument()
    })

    it('skips a section with no body content and no extras, band and all', () => {
      renderPage(
        withLanding(
          [
            pick('heroId', { eyebrow: null, title: null, description: null }),
            pick('landingJourneyListId', {
              eyebrow: null,
              title: null,
              description: null
            })
          ],
          { strings: noJourneysCleared }
        )
      )
      expect(bandIds()).toEqual([])
    })

    it('Hero renders with any text, media or extra', () => {
      renderPage(
        withLanding([
          pick('heroId', {
            eyebrow: null,
            title: null,
            description: 'Only a description'
          })
        ])
      )
      expect(bandIds()).toEqual(['heroId'])
    })

    it('Hero renders with media alone, and its owned video never renders as a section', async () => {
      renderPage(
        withLanding([
          pick('heroId', {
            eyebrow: null,
            title: null,
            description: null,
            mediaBlockId: heroVideoBlock.id
          }),
          heroVideoBlock
        ])
      )
      expect(bandIds()).toEqual(['heroId'])
      expect(
        await within(
          screen.getByTestId('CampaignSectionBand-heroId')
        ).findByTestId('JourneysVideo-heroVideoId')
      ).toBeInTheDocument()
    })

    it('Featured media renders its text beside its media', () => {
      renderPage(
        withLanding([featuredMediaSectionBlock, featuredMediaImageBlock])
      )
      expect(bandIds()).toEqual(['featuredMediaId'])
      expect(
        screen.getByRole('img', { name: 'Children watching a film' })
      ).toBeInTheDocument()
    })

    it('Featured media with neither text nor media is skipped', () => {
      renderPage(
        withLanding([
          {
            ...featuredMediaSectionBlock,
            eyebrow: null,
            title: '',
            description: null,
            bullets: '',
            mediaBlockId: null
          }
        ])
      )
      expect(bandIds()).toEqual([])
    })

    it('Hero renders with an extra alone', () => {
      renderPage(
        withLanding([
          pick('heroId', { eyebrow: null, title: null, description: null }),
          pick('heroButtonId')
        ])
      )
      expect(bandIds()).toEqual(['heroId'])
    })

    it('Region switcher with no listed regions is skipped', () => {
      renderPage(
        withLanding([pick('landingSwitcherId')], {
          regions: campaignPublic.regions.map((region) => ({
            ...region,
            listed: false
          }))
        })
      )
      expect(bandIds()).toEqual([])
    })

    it('Region switcher lists only listed regions', () => {
      renderPage(
        withLanding([pick('landingSwitcherId')], {
          regions: [eurRegion, { ...campaignPublic.regions[1], listed: false }]
        })
      )
      expect(
        screen.getByTestId('CampaignRegionCard-eurRegionId')
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('CampaignRegionCard-afrRegionId')
      ).not.toBeInTheDocument()
    })

    it('Video carousel in explicit mode with nothing renders text if any, else is skipped', () => {
      const { unmount } = renderPage(
        withLanding([pick('carouselId', { eyebrow: null, title: 'Films' })])
      )
      expect(bandIds()).toEqual(['carouselId'])
      unmount()

      renderPage(
        withLanding([pick('carouselId', { eyebrow: null, title: null })])
      )
      expect(bandIds()).toEqual([])
    })

    it('Video carousel with no card renders a description alone', () => {
      renderPage(
        withLanding([
          pick('carouselId', {
            eyebrow: null,
            title: null,
            description: 'Short films to share'
          })
        ])
      )
      expect(bandIds()).toEqual(['carouselId'])
      expect(screen.getByText('Short films to share')).toBeInTheDocument()
    })

    it('Journey list with no live-published journeys renders text if any, else is skipped', () => {
      const { unmount } = renderPage(
        withLanding([
          pick('landingJourneyListId', { eyebrow: null, description: null })
        ])
      )
      expect(bandIds()).toEqual(['landingJourneyListId'])
      unmount()

      renderPage(
        withLanding(
          [
            pick('landingJourneyListId', {
              eyebrow: null,
              title: null,
              description: null
            })
          ],
          { strings: noJourneysCleared }
        )
      )
      expect(bandIds()).toEqual([])
    })

    it('Journey list with no live-published journeys and no text renders the noJourneys line on the landing page', () => {
      renderPage(
        withLanding([
          pick('landingJourneyListId', {
            eyebrow: null,
            title: null,
            description: null
          })
        ])
      )
      expect(bandIds()).toEqual(['landingJourneyListId'])
      expect(screen.getByTestId('CampaignJourneyListEmpty')).toHaveTextContent(
        'Journeys for this region are coming soon'
      )
    })

    it('Journey list with no live-published journeys and no text renders the noJourneys line on a Region Page, else is skipped', () => {
      const regionList = regionPageBlocks.find(
        (block) => block.id === 'regionJourneyListId'
      )
      if (regionList == null)
        throw new Error('no fixture block regionJourneyListId')
      const blankList = {
        ...regionList,
        eyebrow: null,
        title: null,
        description: null
      } as CampaignBlock
      const { unmount } = renderPage(
        withRegionPage([blankList]),
        CampaignPageKind.regionTemplate,
        eurRegion
      )
      expect(bandIds()).toEqual(['regionJourneyListId'])
      expect(screen.getByTestId('CampaignJourneyListEmpty')).toHaveTextContent(
        'Journeys for this region are coming soon'
      )
      unmount()

      renderPage(
        { ...withRegionPage([blankList]), strings: noJourneysCleared },
        CampaignPageKind.regionTemplate,
        eurRegion
      )
      expect(bandIds()).toEqual([])
    })

    it('Analytics always renders, with its eyebrow and title over the skeleton state', () => {
      renderPage(withLanding([pick('landingAnalyticsId')]))
      expect(bandIds()).toEqual(['landingAnalyticsId'])
      expect(screen.getByTestId('CampaignEyebrow')).toHaveTextContent(
        'Around the world'
      )
      expect(screen.getByTestId('CampaignTitle')).toHaveTextContent(
        'Where the story is spreading'
      )
      expect(
        screen.getByTestId('CampaignAnalyticsSkeleton')
      ).toBeInTheDocument()
    })

    it('Analytics requests campaignStats client-side after render, never in the page payload', async () => {
      const result = vi.fn(() => ({
        data: { campaignStats: campaignStatsFixture }
      }))
      expect(JSON.stringify(campaignPublic)).not.toContain('campaignStats')
      renderPage(withLanding([pick('landingAnalyticsId')]), undefined, null, [
        {
          request: {
            query: GET_CAMPAIGN_STATS,
            variables: { id: campaignPublic.id }
          },
          result
        }
      ])
      expect(
        screen.getByTestId('CampaignAnalyticsSkeleton')
      ).toBeInTheDocument()
      await waitFor(() => expect(result).toHaveBeenCalledTimes(1))
      expect(
        await screen.findByTestId('CampaignAnalyticsVisitors')
      ).toBeInTheDocument()
    })

    it('Analytics renders even with no text', () => {
      renderPage(
        withLanding([
          pick('landingAnalyticsId', { eyebrow: null, title: null })
        ])
      )
      expect(bandIds()).toEqual(['landingAnalyticsId'])
    })

    it('Region header and share render only on a region page', () => {
      const landingWithRegionSections = withLanding([
        ...regionPageBlocks.map((block) => ({
          ...block,
          pageId: 'landingPageId'
        }))
      ])
      renderPage(landingWithRegionSections)
      expect(bandIds()).toEqual([
        'regionJourneyListId',
        'regionAnalyticsId',
        'regionSwitcherId'
      ])
    })
  })

  describe('same-page scroll targets', () => {
    function scrollTo(blockId: string): CampaignBlock {
      return pick('heroButtonId', {
        action: {
          __typename: 'CampaignScrollToBlockAction',
          parentBlockId: 'heroButtonId',
          blockId
        }
      })
    }

    function heroButton(): HTMLElement {
      return within(
        screen.getByTestId('CampaignSectionBand-heroId')
      ).getByTestId('CampaignButton')
    }

    const columns = [
      section('CampaignColumnsBlock', {
        id: 'columnsId',
        pageId: LANDING_PAGE_ID,
        parentOrder: 2,
        ratio: CampaignColumnsRatio.equal
      }),
      columnSlot({
        id: 'slotLeftId',
        parentBlockId: 'columnsId',
        parentOrder: 0
      }),
      columnSlot({
        id: 'slotRightId',
        parentBlockId: 'columnsId',
        parentOrder: 1
      }),
      section('CampaignRichTextBlock', {
        id: 'emptyRichTextId',
        pageId: LANDING_PAGE_ID,
        parentBlockId: 'slotLeftId',
        parentOrder: 0,
        title: null,
        richTextContent: ''
      }),
      section('CampaignHeroBlock', {
        id: 'slotHeroId',
        pageId: LANDING_PAGE_ID,
        parentBlockId: 'slotRightId',
        parentOrder: 0,
        eyebrow: null,
        title: 'In a column',
        description: null,
        align: null,
        minHeight: null,
        mediaBlockId: null
      })
    ] as CampaignBlock[]

    it('renders the seeded hero button inert on a fresh campaign, whose switcher is skipped', () => {
      renderPage(
        withLanding(
          [pick('heroId'), pick('heroButtonId'), pick('landingSwitcherId')],
          { regions: [] }
        )
      )

      expect(bandIds()).toEqual(['heroId'])
      expect(heroButton()).toHaveAttribute('aria-disabled', 'true')
      expect(heroButton()).not.toHaveAttribute('href')
    })

    it('renders a button aimed at a section in a skipped Column Slot inert', () => {
      renderPage(
        withLanding([pick('heroId'), scrollTo('emptyRichTextId'), ...columns])
      )

      expect(bandIds()).toEqual(['heroId', 'columnsId', 'slotHeroId'])
      expect(heroButton()).toHaveAttribute('aria-disabled', 'true')
      expect(heroButton()).not.toHaveAttribute('href')
    })

    it('keeps the anchor of a button aimed at a section the page renders, in a slot or not', () => {
      const { unmount } = renderPage(
        withLanding([pick('heroId'), scrollTo('slotHeroId'), ...columns])
      )
      expect(heroButton()).toHaveAttribute('href', '#slotHeroId')
      unmount()

      renderPage(
        withLanding([pick('heroId'), scrollTo('columnsId'), ...columns])
      )
      expect(heroButton()).toHaveAttribute('href', '#columnsId')
    })
  })

  describe('page heading', () => {
    function hero(
      id: string,
      title: string,
      overrides: Pick<
        Partial<CampaignBlock>,
        'pageId' | 'parentBlockId' | 'parentOrder'
      > = {}
    ): CampaignBlock {
      return section('CampaignHeroBlock', {
        id,
        pageId: LANDING_PAGE_ID,
        parentOrder: 0,
        eyebrow: null,
        title,
        description: null,
        align: null,
        minHeight: null,
        mediaBlockId: null,
        ...overrides
      })
    }

    it('makes the region name the one h1 of a Region Page with a Hero, and the Hero title an h2', () => {
      renderPage(
        withRegionPage([
          hero('regionHeroId', 'Welcome to the region', {
            pageId: REGION_PAGE_ID
          }),
          ...regionPageBlocks.map((block, index) => ({
            ...block,
            parentOrder: index + 1
          }))
        ]),
        CampaignPageKind.regionTemplate,
        eurRegion
      )

      expect(bandIds()[0]).toBe('regionHeroId')
      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
      expect(headings[0]).toHaveTextContent('Europe')
      expect(
        screen.getByRole('heading', { level: 2, name: 'Welcome to the region' })
      ).toBeInTheDocument()
    })

    it('makes the first Hero title the one h1 of a landing page with two Heroes', () => {
      renderPage(
        withLanding([
          hero('firstHeroId', 'First hero'),
          hero('secondHeroId', 'Second hero', { parentOrder: 1 })
        ])
      )

      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
      expect(headings[0]).toHaveTextContent('First hero')
      expect(
        screen.getByRole('heading', { level: 2, name: 'Second hero' })
      ).toBeInTheDocument()
    })

    it("counts a Column Slot Hero in its Columns' place", () => {
      renderPage(
        withLanding([
          section('CampaignColumnsBlock', {
            id: 'columnsId',
            pageId: LANDING_PAGE_ID,
            parentOrder: 0,
            ratio: CampaignColumnsRatio.equal
          }),
          columnSlot({
            id: 'slotLeftId',
            parentBlockId: 'columnsId',
            parentOrder: 0
          }),
          hero('slotHeroId', 'In a column', { parentBlockId: 'slotLeftId' }),
          hero('laterHeroId', 'Later hero', { parentOrder: 1 })
        ])
      )

      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
      expect(headings[0]).toHaveTextContent('In a column')
    })
  })

  describe('responsive', () => {
    it('is single column below md and auto-fills switcher cards at 230px minimum at md and up', () => {
      renderPage(campaignPublic)
      expect(
        screen.getByTestId('CampaignRegionSwitcherGrid')
      ).toBeInTheDocument()
      const css = styleText()
      expect(css).toContain('grid-template-columns:1fr')
      expect(css).toMatch(
        /@media \(min-width:600px\)[^}]*\{[^}]*grid-template-columns:repeat\(auto-fill,\s*minmax\(230px,\s*1fr\)\)/
      )
    })

    it('enables smooth scrolling for same-page anchors only without a reduced-motion preference', () => {
      renderPage(campaignPublic)
      const css = styleText()
      expect(css).toMatch(
        /@media \(prefers-reduced-motion: ?no-preference\)\s*\{\s*html\s*\{\s*scroll-behavior:\s*smooth;?\s*\}\s*\}/
      )
      expect(
        css.replace(
          /@media \(prefers-reduced-motion: ?no-preference\)\s*\{[^}]*\}\s*\}/g,
          ''
        )
      ).not.toContain('scroll-behavior')
    })
  })
})

describe('CampaignPage page language', () => {
  const arabic: CampaignPublic['languages'][number] = {
    __typename: 'CampaignLanguage',
    id: 'campaignLanguageArId',
    languageId: '22658',
    order: 2,
    language: {
      __typename: 'Language',
      id: '22658',
      bcp47: 'ar',
      name: [{ __typename: 'LanguageName', value: 'العربية', primary: true }]
    }
  }

  afterEach(() => {
    document.documentElement.lang = ''
    document.documentElement.dir = ''
  })

  it("carries the lang param on every in-campaign link: brand mark, back chip and the other regions' switcher cards", () => {
    renderPage(campaignPublic, CampaignPageKind.regionTemplate, eurRegion)
    expect(screen.getByTestId('CampaignBrandMark')).toHaveAttribute(
      'href',
      '/campaign/outreach-2026?lang=en'
    )
    expect(screen.getByTestId('CampaignAllRegionsChip')).toHaveAttribute(
      'href',
      '/campaign/outreach-2026?lang=en'
    )
    expect(
      screen.queryByTestId('CampaignRegionCard-eurRegionId')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('CampaignRegionCard-afrRegionId')
    ).toHaveAttribute('href', '/campaign/outreach-2026/afr?lang=en')
  })

  it('keeps the chosen language, not the default, across a region switch', () => {
    renderPage({
      ...campaignPublic,
      languageId: '496',
      language: { __typename: 'Language', id: '496', bcp47: 'fr' }
    })
    expect(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).toHaveAttribute('href', '/campaign/outreach-2026/eur?lang=fr')
    expect(
      screen.getByRole('link', { name: 'Start with Europe' })
    ).toHaveAttribute('href', '/campaign/outreach-2026/eur?lang=fr')
    expect(screen.getByTestId('CampaignBrandMark')).toHaveAttribute(
      'href',
      '/campaign/outreach-2026?lang=fr'
    )
  })

  it('drops the lang param on a single-language campaign', () => {
    renderPage({
      ...campaignPublic,
      languages: [campaignPublic.languages[0]]
    })
    expect(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).toHaveAttribute('href', '/campaign/outreach-2026/eur')
  })

  it('sets html lang to the resolved bcp47 and dir to ltr when the language is not right-to-left', () => {
    renderPage(campaignPublic)
    expect(document.documentElement).toHaveAttribute('lang', 'en')
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  })

  it('keeps the server-rendered lang and dir when the page language has no bcp47', () => {
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
    renderPage({
      ...campaignPublic,
      language: { __typename: 'Language', id: '529', bcp47: null }
    })
    expect(document.documentElement).toHaveAttribute('lang', 'en')
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  })

  it('sets dir to rtl for a right-to-left page language', () => {
    renderPage({
      ...campaignPublic,
      languageId: '22658',
      language: { __typename: 'Language', id: '22658', bcp47: 'ar' },
      languages: [...campaignPublic.languages, arabic]
    })
    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).toHaveAttribute('href', '/campaign/outreach-2026/eur?lang=ar')
  })
})
