import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

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
      <CampaignPage
        campaign={campaign}
        pageKind={pageKind}
        region={region}
        headerSlot={<header data-testid="HeaderSlot" />}
        footerSlot={<footer data-testid="FooterSlot" />}
      />
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
  it('renders the landing page: the seeded sections in order between the chrome slots', () => {
    renderPage(campaignPublic)
    expect(screen.getByTestId('HeaderSlot')).toBeInTheDocument()
    expect(screen.getByTestId('FooterSlot')).toBeInTheDocument()
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
      expect(screen.queryByTestId('CampaignEyebrow')).not.toBeInTheDocument()
      expect(screen.queryByTestId('CampaignLede')).not.toBeInTheDocument()
      expect(screen.queryByTestId('CampaignTypography')).not.toBeInTheDocument()
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
