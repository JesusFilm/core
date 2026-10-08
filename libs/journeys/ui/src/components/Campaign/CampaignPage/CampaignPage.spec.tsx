import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import {
  campaignPublic,
  eurRegion,
  landingBlocks,
  regionPageBlocks
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

function renderPage(
  campaign: CampaignPublic,
  pageKind = CampaignPageKind.landing,
  region: CampaignRegion | null = null
) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignPage campaign={campaign} pageKind={pageKind} region={region} />
    </ThemeProvider>
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

function styleText(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => node.textContent ?? '')
    .join('')
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
        'Christmas 2026'
      )
      expect(
        screen.queryByTestId('CampaignAllRegionsChip')
      ).not.toBeInTheDocument()
      unmount()

      renderPage(campaignPublic, CampaignPageKind.regionTemplate, eurRegion)
      expect(chromeRows()).toEqual(landing)
      expect(screen.getByTestId('CampaignBrandMarkTitle')).toHaveTextContent(
        'Christmas 2026'
      )
      expect(screen.getByTestId('CampaignAllRegionsChip')).toHaveAttribute(
        'href',
        '/campaign/christmas-2026?lang=en'
      )
    })

    it('always renders the header and footer, even from an empty chrome list', () => {
      renderPage({ ...campaignPublic, chrome: [] })
      expect(screen.getByTestId('CampaignHeader')).toBeInTheDocument()
      expect(screen.getByTestId('CampaignBrandMarkTitle')).toHaveTextContent(
        'Christmas 2026'
      )
      expect(screen.queryByTestId('CampaignHeaderNav')).not.toBeInTheDocument()
      expect(screen.getByTestId('CampaignFooter')).toHaveAttribute(
        'data-empty',
        'true'
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
          pick('heroId', { eyebrow: '', lede: null }),
          pick('heroButtonId'),
          pick('landingJourneyListId', { eyebrow: null, lede: '' }),
          pick('journeyListNoteId', { content: '' })
        ])
      )
      const main = within(screen.getByRole('main'))
      expect(main.queryByTestId('CampaignEyebrow')).not.toBeInTheDocument()
      expect(main.queryByTestId('CampaignLede')).not.toBeInTheDocument()
      expect(main.queryByTestId('CampaignTypography')).not.toBeInTheDocument()
      expect(screen.queryByText(/your text/i)).not.toBeInTheDocument()
      expect(
        screen.queryByText(/add your first region/i)
      ).not.toBeInTheDocument()
    })

    it('skips a section with no body content and no extras, band and all', () => {
      renderPage(
        withLanding([
          pick('heroId', { eyebrow: null, title: null, lede: null }),
          pick('landingJourneyListId', {
            eyebrow: null,
            title: null,
            lede: null
          })
        ])
      )
      expect(bandIds()).toEqual([])
    })

    it('Hero renders with any text, media or extra', () => {
      renderPage(
        withLanding([
          pick('heroId', { eyebrow: null, title: null, lede: 'Only a lede' })
        ])
      )
      expect(bandIds()).toEqual(['heroId'])
    })

    it('Hero renders with an extra alone', () => {
      renderPage(
        withLanding([
          pick('heroId', { eyebrow: null, title: null, lede: null }),
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

    it('Journey list with no live-published journeys renders text if any, else is skipped', () => {
      const { unmount } = renderPage(
        withLanding([
          pick('landingJourneyListId', { eyebrow: null, lede: null })
        ])
      )
      expect(bandIds()).toEqual(['landingJourneyListId'])
      unmount()

      renderPage(
        withLanding([
          pick('landingJourneyListId', {
            eyebrow: null,
            title: null,
            lede: null
          })
        ])
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

    it('enables smooth scrolling for same-page anchors', () => {
      renderPage(campaignPublic)
      expect(styleText()).toContain('scroll-behavior:smooth')
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

  it('carries the lang param on every in-campaign link: brand mark, back chip, switcher cards and region buttons', () => {
    renderPage(campaignPublic, CampaignPageKind.regionTemplate, eurRegion)
    expect(screen.getByTestId('CampaignBrandMark')).toHaveAttribute(
      'href',
      '/campaign/christmas-2026?lang=en'
    )
    expect(screen.getByTestId('CampaignAllRegionsChip')).toHaveAttribute(
      'href',
      '/campaign/christmas-2026?lang=en'
    )
    expect(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).toHaveAttribute('href', '/campaign/christmas-2026/eur?lang=en')
    expect(
      screen.getByTestId('CampaignRegionCard-afrRegionId')
    ).toHaveAttribute('href', '/campaign/christmas-2026/afr?lang=en')
  })

  it('keeps the chosen language, not the default, across a region switch', () => {
    renderPage({
      ...campaignPublic,
      languageId: '496',
      language: { __typename: 'Language', id: '496', bcp47: 'fr' }
    })
    expect(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).toHaveAttribute('href', '/campaign/christmas-2026/eur?lang=fr')
    expect(
      screen.getByRole('link', { name: 'Start with Europe' })
    ).toHaveAttribute('href', '/campaign/christmas-2026/eur?lang=fr')
    expect(screen.getByTestId('CampaignBrandMark')).toHaveAttribute(
      'href',
      '/campaign/christmas-2026?lang=fr'
    )
  })

  it('drops the lang param on a single-language campaign', () => {
    renderPage({
      ...campaignPublic,
      languages: [campaignPublic.languages[0]]
    })
    expect(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).toHaveAttribute('href', '/campaign/christmas-2026/eur')
  })

  it('sets html lang to the resolved bcp47 and dir to ltr when the language is not right-to-left', () => {
    renderPage(campaignPublic)
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
    ).toHaveAttribute('href', '/campaign/christmas-2026/eur?lang=ar')
  })
})
